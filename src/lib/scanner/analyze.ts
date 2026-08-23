import * as cheerio from "cheerio";

export type IssueSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type IssueCategory =
  | "SEO"
  | "PERFORMANCE"
  | "ACCESSIBILITY"
  | "SECURITY"
  | "MOBILE"
  | "IMAGE"
  | "TECHNICAL"
  | "RTL";

export interface ScanIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  recommendation: string;
  evidence?: Record<string, unknown>;
}

export interface CategoryScores {
  seo: number;
  performance: number;
  accessibility: number;
  security: number;
  mobile: number;
  rtl: number;
}

export interface ScanResultPayload {
  overallScore: number;
  scores: CategoryScores;
  issues: ScanIssue[];
  meta: {
    url: string;
    finalUrl: string;
    statusCode: number;
    title?: string;
    htmlSize: number;
    scannedAt: string;
  };
}

function uid() {
  return crypto.randomUUID();
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function analyzeHtml(
  html: string,
  headers: Record<string, string>,
  url: string,
  finalUrl: string,
  statusCode: number
): ScanResultPayload {
  const $ = cheerio.load(html);
  const issues: ScanIssue[] = [];

  const title = $("title").first().text().trim();
  const metaDesc =
    $('meta[name="description"]').attr("content")?.trim() || "";
  const h1s = $("h1");
  const canonical = $('link[rel="canonical"]').attr("href");
  const lang = $("html").attr("lang") || "";
  const dir = $("html").attr("dir") || "";
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  const images = $("img");
  const imagesWithoutAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;
  const htmlSize = Buffer.byteLength(html, "utf8");

  // --- SEO ---
  if (!title) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "HIGH",
      title: "عنوان صفحه وجود ندارد",
      description: "تگ <title> خالی یا موجود نیست.",
      recommendation: "یک عنوان توصیفی ۳۰ تا ۶۰ کاراکتری اضافه کنید.",
    });
  } else if (title.length < 15) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "MEDIUM",
      title: "عنوان صفحه خیلی کوتاه است",
      description: `عنوان فعلی «${title}» فقط ${title.length} کاراکتر دارد.`,
      recommendation: "عنوان را بین ۳۰ تا ۶۰ کاراکتر نگه دارید.",
      evidence: { title, length: title.length },
    });
  } else if (title.length > 65) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "LOW",
      title: "عنوان صفحه طولانی است",
      description: `عنوان ${title.length} کاراکتر دارد و ممکن است در نتایج جستجو بریده شود.`,
      recommendation: "عنوان را به کمتر از ۶۰ کاراکتر کاهش دهید.",
      evidence: { length: title.length },
    });
  }

  if (!metaDesc) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "MEDIUM",
      title: "متا توضیحات وجود ندارد",
      description: "تگ meta description تعریف نشده است.",
      recommendation: "یک توضیح ۱۵۰ تا ۱۶۰ کاراکتری جذاب بنویسید.",
    });
  }

  if (h1s.length === 0) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "HIGH",
      title: "تگ H1 وجود ندارد",
      description: "هیچ هدینگ سطح یک در صفحه یافت نشد.",
      recommendation: "یک H1 مرتبط با موضوع اصلی صفحه اضافه کنید.",
    });
  } else if (h1s.length > 1) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "LOW",
      title: "چندین H1 در صفحه",
      description: `${h1s.length} تگ H1 یافت شد.`,
      recommendation: "ترجیحاً فقط یک H1 اصلی داشته باشید.",
    });
  }

  if (!canonical) {
    issues.push({
      id: uid(),
      category: "SEO",
      severity: "LOW",
      title: "canonical تعریف نشده",
      description: "لینک canonical وجود ندارد.",
      recommendation: "لینک canonical به نسخه اصلی صفحه اضافه کنید.",
    });
  }

  // --- Security headers ---
  const h = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  if (!finalUrl.startsWith("https://")) {
    issues.push({
      id: uid(),
      category: "SECURITY",
      severity: "CRITICAL",
      title: "سایت بدون HTTPS",
      description: "صفحه روی HTTP بارگذاری شده است.",
      recommendation: "گواهی SSL نصب کنید و همه ترافیک را به HTTPS هدایت کنید.",
    });
  }

  if (!h["content-security-policy"]) {
    issues.push({
      id: uid(),
      category: "SECURITY",
      severity: "HIGH",
      title: "هدر CSP وجود ندارد",
      description: "Content-Security-Policy تنظیم نشده است.",
      recommendation: "یک سیاست CSP مناسب برای کاهش ریسک XSS تعریف کنید.",
    });
  }

  if (!h["x-frame-options"] && !h["content-security-policy"]?.includes("frame-ancestors")) {
    issues.push({
      id: uid(),
      category: "SECURITY",
      severity: "MEDIUM",
      title: "X-Frame-Options تنظیم نشده",
      description: "محافظت در برابر clickjacking ضعیف است.",
      recommendation: "هدر X-Frame-Options: DENY یا SAMEORIGIN اضافه کنید.",
    });
  }

  if (!h["x-content-type-options"]) {
    issues.push({
      id: uid(),
      category: "SECURITY",
      severity: "LOW",
      title: "X-Content-Type-Options وجود ندارد",
      description: "هدر nosniff تنظیم نشده است.",
      recommendation: "X-Content-Type-Options: nosniff را اضافه کنید.",
    });
  }

  if (!h["strict-transport-security"] && finalUrl.startsWith("https://")) {
    issues.push({
      id: uid(),
      category: "SECURITY",
      severity: "MEDIUM",
      title: "HSTS فعال نیست",
      description: "هدر Strict-Transport-Security وجود ندارد.",
      recommendation: "HSTS را با max-age مناسب فعال کنید.",
    });
  }

  // --- Accessibility ---
  if (imagesWithoutAlt > 0) {
    issues.push({
      id: uid(),
      category: "ACCESSIBILITY",
      severity: imagesWithoutAlt > 5 ? "HIGH" : "MEDIUM",
      title: "تصاویر بدون متن جایگزین",
      description: `${imagesWithoutAlt} تصویر فاقد ویژگی alt هستند.`,
      recommendation: "برای تصاویر معنادار alt مناسب بنویسید.",
      evidence: { count: imagesWithoutAlt },
    });
  }

  if (!$("html").attr("lang")) {
    issues.push({
      id: uid(),
      category: "ACCESSIBILITY",
      severity: "MEDIUM",
      title: "ویژگی lang روی html نیست",
      description: "زبان صفحه مشخص نشده است.",
      recommendation: "lang=\"fa\" یا زبان مناسب را روی تگ html بگذارید.",
    });
  }

  // --- Mobile ---
  if (!viewport) {
    issues.push({
      id: uid(),
      category: "MOBILE",
      severity: "HIGH",
      title: "متا viewport وجود ندارد",
      description: "صفحه برای موبایل بهینه اعلام نشده است.",
      recommendation: "content=\"width=device-width, initial-scale=1\" اضافه کنید.",
    });
  }

  // --- RTL / Persian ---
  const bodyText = $("body").text();
  const hasPersian = /[\u0600-\u06FF]/.test(bodyText + title + metaDesc);
  if (hasPersian && dir.toLowerCase() !== "rtl") {
    issues.push({
      id: uid(),
      category: "RTL",
      severity: "HIGH",
      title: "dir=rtl برای محتوای فارسی تنظیم نشده",
      description: "محتوای فارسی تشخیص داده شد اما dir=\"rtl\" روی html نیست.",
      recommendation: "dir=\"rtl\" و lang=\"fa\" را به تگ html اضافه کنید.",
    });
  }
  if (hasPersian && !lang.toLowerCase().startsWith("fa")) {
    issues.push({
      id: uid(),
      category: "RTL",
      severity: "MEDIUM",
      title: "lang فارسی تنظیم نشده",
      description: `مقدار lang فعلی: «${lang || "خالی"}».`,
      recommendation: "lang=\"fa\" یا fa-IR را تنظیم کنید.",
    });
  }

  // --- Performance heuristics ---
  if (htmlSize > 500_000) {
    issues.push({
      id: uid(),
      category: "PERFORMANCE",
      severity: "HIGH",
      title: "حجم HTML زیاد است",
      description: `حجم HTML حدود ${Math.round(htmlSize / 1024)} کیلوبایت است.`,
      recommendation: "محتوای غیرضروری و اسکریپت‌های inline را کاهش دهید.",
    });
  } else if (htmlSize > 200_000) {
    issues.push({
      id: uid(),
      category: "PERFORMANCE",
      severity: "MEDIUM",
      title: "حجم HTML نسبتاً بالا",
      description: `حجم HTML حدود ${Math.round(htmlSize / 1024)} کیلوبایت است.`,
      recommendation: "صفحه را سبک‌تر کنید.",
    });
  }

  const scriptCount = $("script[src]").length;
  if (scriptCount > 15) {
    issues.push({
      id: uid(),
      category: "PERFORMANCE",
      severity: "MEDIUM",
      title: "تعداد زیاد اسکریپت خارجی",
      description: `${scriptCount} اسکریپت با src یافت شد.`,
      recommendation: "اسکریپت‌ها را ادغام یا با defer/async بارگذاری کنید.",
    });
  }

  // Scoring
  const deduct = (list: ScanIssue[], cat: IssueCategory) => {
    let d = 0;
    for (const i of list.filter((x) => x.category === cat)) {
      if (i.severity === "CRITICAL") d += 25;
      else if (i.severity === "HIGH") d += 15;
      else if (i.severity === "MEDIUM") d += 8;
      else if (i.severity === "LOW") d += 4;
    }
    return clamp(100 - d);
  };

  const scores: CategoryScores = {
    seo: deduct(issues, "SEO"),
    performance: deduct(issues, "PERFORMANCE"),
    accessibility: deduct(issues, "ACCESSIBILITY"),
    security: deduct(issues, "SECURITY"),
    mobile: deduct(issues, "MOBILE"),
    rtl: deduct(issues, "RTL"),
  };

  const overall = clamp(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  return {
    overallScore: overall,
    scores,
    issues,
    meta: {
      url,
      finalUrl,
      statusCode,
      title: title || undefined,
      htmlSize,
      scannedAt: new Date().toISOString(),
    },
  };
}
