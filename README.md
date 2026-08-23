# ای‌آی سایت‌چک (AI SiteCheck)

**سایتت را بررسی کن، مشکلاتش را پیدا کن، اصلاحش کن.**

پلتفرم SaaS بررسی و تحلیل وب‌سایت با تمرکز بر بازار فارسی و RTL.

## دمو زنده

https://ai-site-check-rho.vercel.app/

## قابلیت‌های فعلی (v0.2)

- Landing Page فارسی RTL
- ثبت‌نام / ورود (دمو — localStorage)
- Dashboard کامل با سایدبار
- افزودن وب‌سایت
- **اسکن واقعی** از طریق `POST /api/v1/scan`
  - Fetch HTML زنده
  - حفاظت SSRF (localhost / IP خصوصی / metadata)
  - تحلیل SEO، امنیت، دسترسی‌پذیری، موبایل، عملکرد، RTL
  - امتیاز ۰–۱۰۰ و لیست مشکلات با پیشنهاد فارسی
- تاریخچه اسکن و تجمیع مشکلات

## API

```http
POST /api/v1/scan
Content-Type: application/json

{ "url": "https://example.com" }
```

پاسخ شامل `overallScore`، `scores` و `issues` است.

## تکنولوژی

- Next.js 15 + TypeScript + Tailwind CSS
- Cheerio برای Parse HTML
- Zod برای اعتبارسنجی
- استقرار روی Vercel

## نصب محلی

```bash
git clone https://github.com/mydsoftware/AI-SiteCheck.git
cd AI-SiteCheck
npm install
npm run dev
```

## نقشه راه بعدی

- [ ] Auth واقعی (NextAuth) + PostgreSQL
- [ ] ذخیره اسکن در دیتابیس
- [ ] Queue / Worker برای اسکن‌های سنگین
- [ ] گزارش PDF
- [ ] AutoFix با تأیید کاربر
- [ ] یکپارچه‌سازی WordPress / GitHub

## امنیت

- SSRF protection روی URL و redirect
- فقط حسابرسی دفاعی (بدون exploit)
- کاربر فقط سایت‌هایی را اسکن کند که مجوز دارد

## مجوز

در حال توسعه — استفاده آزمایشی آزاد است.
