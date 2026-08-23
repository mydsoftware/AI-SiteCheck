import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Search, Zap, Shield, Smartphone, Accessibility, Languages, CheckCircle2, ArrowLeft } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: Search, title: "تحلیل سئو", desc: "عنوان، متا، هدینگ، لینک و داده‌ساختاریافته" },
    { icon: Zap, title: "عملکرد", desc: "سرعت، تصاویر، کش و منابع بلاک‌کننده" },
    { icon: Shield, title: "امنیت", desc: "HTTPS، CSP، HSTS و هدرهای امنیتی" },
    { icon: Accessibility, title: "دسترسی‌پذیری", desc: "Alt، ARIA، کنتراست و ناوبری" },
    { icon: Smartphone, title: "موبایل", desc: "Viewport، ریسپانسیو و اهداف لمسی" },
    { icon: Languages, title: "فارسی و RTL", desc: "dir، lang، فونت فارسی و تراز" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">ای‌آی سایت‌چک</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">ورود</Button></Link>
            <Link href="/register"><Button size="sm">ثبت‌نام</Button></Link>
          </div>
        </div>
      </header>

      <section className="py-20 md:py-28 text-center">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            وب‌سایتت را با هوش مصنوعی بررسی و اصلاح کن
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            مشکلات SEO، عملکرد، دسترسی‌پذیری، امنیت و RTL را در چند ثانیه پیدا کن و با پیشنهادهای هوشمند اصلاح کن.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                رایگان سایتت را بررسی کن
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">مشاهده قابلیت‌ها</Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            شما فقط مجاز به بررسی وب‌سایت‌هایی هستید که مجوز آن‌ها را دارید.
          </p>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">چرا ای‌آی سایت‌چک؟</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">همین حالا شروع کن</h2>
          <p className="text-muted-foreground mb-8">اولین اسکن رایگان است. بدون کارت اعتباری.</p>
          <Link href="/register">
            <Button size="lg" className="px-10">رایگان سایتت را بررسی کن</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-10 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <span>ای‌آی سایت‌چک</span>
          </div>
          <p>سایتت را بررسی کن، مشکلاتش را پیدا کن، اصلاحش کن.</p>
        </div>
      </footer>
    </div>
  );
}
