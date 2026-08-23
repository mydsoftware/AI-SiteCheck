import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateUrlForScan } from "@/lib/scanner/ssrf";
import { analyzeHtml } from "@/lib/scanner/analyze";

const bodySchema = z.object({
  url: z.string().min(3).max(2048),
});

export const maxDuration = 30;

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

    const target = validation.url.toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(target, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "AI-SiteCheck/0.2 (+https://github.com/mydsoftware/AI-SiteCheck; audit-bot)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (e) {
      clearTimeout(timeout);
      return NextResponse.json(
        {
          error: "امکان دریافت صفحه وجود ندارد. سایت در دسترس نیست یا مسدود است.",
          code: "fetch_failed",
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeout);
    }

    // Re-validate final URL after redirects
    const finalValidation = await validateUrlForScan(res.url);
    if (!finalValidation.ok) {
      return NextResponse.json(
        { error: "ریدایرکت به آدرس غیرمجاز انجام شد", code: "ssrf" },
        { status: 400 }
      );
    }

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

    const html = await res.text();
    // Cap size ~2MB
    if (html.length > 2_000_000) {
      return NextResponse.json(
        { error: "صفحه بیش از حد بزرگ است", code: "too_large" },
        { status: 413 }
      );
    }

    const headerObj: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headerObj[k] = v;
    });

    const result = analyzeHtml(html, headerObj, target, res.url, res.status);

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (e) {
    console.error("[scan]", e);
    return NextResponse.json(
      { error: "خطای داخلی سرور", code: "internal" },
      { status: 500 }
    );
  }
}
