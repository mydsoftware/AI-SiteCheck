# ای‌آی سایت‌چک (AI SiteCheck)

**سایتت را بررسی کن، مشکلاتش را پیدا کن، اصلاحش کن.**

پلتفرم SaaS برای بررسی و تحلیل وب‌سایت با تمرکز بر بازار فارسی و RTL.

## استقرار سریع روی Vercel (محیط تست)

1. به [vercel.com](https://vercel.com) بروید و با GitHub وارد شوید.
2. **Add New Project** → مخزن `mydsoftware/AI-SiteCheck` را انتخاب کنید.
3. Framework: Next.js (خودکار تشخیص داده می‌شود).
4. Environment Variables (اختیاری برای مرحله اول):
   - `MOCK_SCANNER` = `true`
   - `AI_PROVIDER` = `mock`
5. Deploy را بزنید.

بعد از Deploy، لینک پیش‌نمایش آماده تست است.

برای دیتابیس بعداً از Vercel Postgres یا Neon استفاده می‌کنیم.

## تکنولوژی

- Next.js 15 + TypeScript + Tailwind
- Prisma + PostgreSQL (مرحله بعد)
- RTL فارسی
- Mock Scanner برای تست بدون API پولی

## وضعیت فعلی

- [x] Landing Page فارسی RTL
- [x] ساختار پروژه و کانفیگ Vercel
- [ ] Auth و Dashboard
- [ ] Scanner واقعی
- [ ] اتصال دیتابیس

مخزن: https://github.com/mydsoftware/AI-SiteCheck
