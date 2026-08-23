import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateUrlForScan } from "@/lib/scanner/ssrf";
import { analyzeHtml } from "@/lib/scanner/analyze";

const bodySchema = z.object({
  url: z.string().min(3).max(2048),
});

const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 2_000_000;
const FETCH_TIMEOUT_MS = 15_000;

export const maxDuration = 30;

async function readTextWithLimit(res: Response, maxBytes: number): Promise<string | null> {
  const contentLength = Number(res.headers.get("content-length") || 0);
  if (contentLength > maxBytes) return null;
  if (!res.body) return "";

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

async function fetchValidatedHtml(startUrl: string): Promise<
  | { ok: true; response: Response; finalUrl: string; html: string }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const validation = await validateUrlForScan(currentUrl);
    if (!validation.ok || !validation.url) {
      return {
        ok: false,
        status: 400,
        body: {
          error: redirectCount === 0 ? "این آدرس به دلایل امنیتی قابل اسکن نیست" : "ریدایرکت به آدرس غیرمجاز انجام شد",
          code: validation.error === "ssrf" ? "ssrf" : "invalidUrl",
        },
      };
    }

    const target = validation.url.toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(target, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "AI-SiteCheck/0.2 (+https://github.com/mydsoftware/AI-SiteCheck; audit-bot)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      return {
        ok: false,
        status: 502,
        body: {
          error: "امکان دریافت صفحه وجود ندارد. سایت در دسترس نیست یا مسدود است.",
          code: "fetch_failed",
        },
      };
    } finally {
      clearTimeout(timeout);
    }

    const location = res.headers.get("location");
    if ([301, 302, 303, 307, 308].includes(res.status) && location) {
      if (redirectCount === MAX_REDIRECTS) {
        return {
          ok: false,
          status: 508,
          body: { error: "تعداد ریدایرکت‌ها بیش از حد مجاز است", code: "too_many_redirects" },
        };
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(location, target);
      } catch {
        return {
          ok: false,
          status: 400,
          body: { error: "ریدایرکت نامعتبر است", code: "invalid_redirect" },
        };
      }

      const nextValidation = await validateUrlForScan(nextUrl.toString());
      if (!nextValidation.ok || !nextValidation.url) {
        return {
          ok: false,
          status: 400,
          body: { error: "ریدایرکت به آدرس غیرمجاز انجام شد", code: "ssrf" },
        };
      }

      currentUrl = nextValidation.url.toString();
      continue;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return {
        ok: false,
        status: 422,
        body: {
          error: "پاسخ دریافتی HTML نیست",
          code: "not_html",
          statusCode: res.status,
        },
      };
    }

    const html = await readTextWithLimit(res, MAX_HTML_BYTES);
    if (html === null) {
      return {
        ok: false,
        status: 413,
        body: { error: "صفحه بیش از حد بزرگ است", code: "too_large" },
      };
    }

    return { ok: true, response: res, finalUrl: target, html };
  }

  return {
    ok: false,
    status: 508,
    body: { error: "تعداد ریدایرکت‌ها بیش از حد مجاز است", code: "too_many_redirects" },
  };
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "آدرس نامعتبر است", code: "validation" },
        { status: 400 }
      );
    }

    let inputUrl = parsed.data.url.trim();
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = "https://" + inputUrl;
    }

    const fetched = await fetchValidatedHtml(inputUrl);
    if (!fetched.ok) {
      return NextResponse.json(fetched.body, { status: fetched.status });
    }

    const headerObj: Record<string, string> = {};
    fetched.response.headers.forEach((v, k) => {
      headerObj[k] = v;
    });

    const result = analyzeHtml(
      fetched.html,
      headerObj,
      inputUrl,
      fetched.finalUrl,
      fetched.response.status
    );

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error("[scan]", e);
    return NextResponse.json(
      { error: "خطای داخلی سرور", code: "internal" },
      { status: 500 }
    );
  }
}
