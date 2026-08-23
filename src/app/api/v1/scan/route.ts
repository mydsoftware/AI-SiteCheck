import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateUrlForScan } from "@/lib/scanner/ssrf";
import { analyzeHtml } from "@/lib/scanner/analyze";

const bodySchema = z.object({
  url: z.string().min(3).max(2048),
});

const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 2_000_000;

export const maxDuration = 30;

async function fetchHtmlSafely(startUrl: string): Promise<
  | { ok: true; response: Response; finalUrl: string }
  | { ok: false; response: NextResponse }
> {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const validation = await validateUrlForScan(currentUrl);
    if (!validation.ok || !validation.url) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "آدرس وب‌سایت نامعتبر یا غیرمجاز است", code: validation.error },
          { status: 400 }
        ),
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(validation.url.toString(), {
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
        response: NextResponse.json(
          {
            error: "امکان دریافت صفحه وجود ندارد. سایت در دسترس نیست یا مسدود است.",
            code: "fetch_failed",
          },
          { status: 502 }
        ),
      };
    } finally {
      clearTimeout(timeout);
    }

    if (res.status >= 300 && res.status < 400) {
      if (redirectCount === MAX_REDIRECTS) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "تعداد ریدایرکت‌ها بیش از حد مجاز است", code: "too_many_redirects" },
            { status: 400 }
          ),
        };
      }

      const location = res.headers.get("location");
      if (!location) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "ریدایرکت بدون مقصد دریافت شد", code: "invalid_redirect" },
            { status: 400 }
          ),
        };
      }

      try {
        currentUrl = new URL(location, validation.url).toString();
      } catch {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "مقصد ریدایرکت نامعتبر است", code: "invalid_redirect" },
            { status: 400 }
          ),
        };
      }
      continue;
    }

    return { ok: true, response: res, finalUrl: validation.url.toString() };
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: "اسکن به دلیل ریدایرکت‌های غیرعادی متوقف شد", code: "redirect_loop" },
      { status: 400 }
    ),
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

    const validation = await validateUrlForScan(inputUrl);
    if (!validation.ok || !validation.url) {
      const msg =
        validation.error === "ssrf"
          ? "این آدرس به دلایل امنیتی قابل اسکن نیست"
          : "آدرس وب‌سایت نامعتبر است";
      return NextResponse.json(
        { error: msg, code: validation.error },
        { status: 400 }
      );
    }

    const fetched = await fetchHtmlSafely(validation.url.toString());
    if (!fetched.ok) return fetched.response;

    const { response: res, finalUrl } = fetched;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json(
        {
          error: "پاسخ دریافتی HTML نیست",
          code: "not_html",
          statusCode: res.status,
        },
        { status: 422 }
      );
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "صفحه بیش از حد بزرگ است", code: "too_large" },
        { status: 413 }
      );
    }

    const html = await res.text();
    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "صفحه بیش از حد بزرگ است", code: "too_large" },
        { status: 413 }
      );
    }

    const headerObj: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headerObj[k] = v;
    });

    const result = analyzeHtml(
      html,
      headerObj,
      validation.url.toString(),
      finalUrl,
      res.status
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
