"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Plus, Trash2, Play, Loader2 } from "lucide-react";

type Website = {
  id: string;
  url: string;
  name: string;
  lastScore?: number;
  lastScanAt?: string;
  issuesCount?: number;
  scores?: Record<string, number>;
  issues?: Issue[];
};

type Issue = {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
};

function normalizeUrl(input: string): string {
  let u = input.trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    return parsed.origin;
  } catch {
    return "";
  }
}

function mockScanResult(url: string): Partial<Website> {
  const issues: Issue[] = [
    {
      id: crypto.randomUUID(),
      category: "SEO",
      severity: "HIGH",
      title: "عنوان صفحه کوتاه است",
      description: "عنوان صفحه باید بین ۳۰ تا ۶۰ کاراکتر باشد.",
      recommendation: "عنوان را به شکل «نام برند | خدمات اصلی» گسترش دهید.",
    },
    {
      id: crypto.randomUUID(),
      category: "SEO",
      severity: "MEDIUM",
      title: "متا توضیحات وجود ندارد",
      description: "تگ meta description تعریف نشده است.",
      recommendation: "یک توضیح ۱۵۰–۱۶۰ کاراکتری اضافه کنید.",
    },
    {
      id: crypto.randomUUID(),
      category: "SECURITY",
      severity: "CRITICAL",
      title: "هدر CSP وجود ندارد",
      description: "Content-Security-Policy تنظیم نشده است.",
      recommendation: "یک سیاست CSP مناسب تعریف کنید.",
    },
    {
      id: crypto.randomUUID(),
      category: "RTL",
      severity: "HIGH",
      title: "ویژگی dir تنظیم نشده",
      description: "تگ html فاقد dir=\"rtl\" است.",
      recommendation: "dir=\"rtl\" و lang=\"fa\" را اضافه کنید.",
    },
    {
      id: crypto.randomUUID(),
      category: "ACCESSIBILITY",
      severity: "MEDIUM",
      title: "تصاویر بدون alt",
      description: "چند تصویر فاقد متن جایگزین هستند.",
      recommendation: "برای تمام تصاویر معنادار alt بنویسید.",
    },
    {
      id: crypto.randomUUID(),
      category: "PERFORMANCE",
      severity: "HIGH",
      title: "تصاویر بدون فشرده‌سازی",
      description: "تصاویر بزرگ بدون بهینه‌سازی یافت شد.",
      recommendation: "از WebP/AVIF و فشرده‌سازی استفاده کنید.",
    },
  ];

  const scores = {
    seo: 68,
    performance: 62,
    accessibility: 74,
    security: 55,
    mobile: 71,
    rtl: 48,
  };
  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  return {
    lastScore: overall,
    lastScanAt: new Date().toISOString(),
    issuesCount: issues.length,
    scores,
    issues,
  };
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("aisc_websites");
    if (raw) {
      try {
        setWebsites(JSON.parse(raw));
      } catch {}
    }
  }, []);

  function save(list: Website[]) {
    setWebsites(list);
    localStorage.setItem("aisc_websites", JSON.stringify(list));
  }

  function addWebsite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("آدرس وب‌سایت نامعتبر است.");
      return;
    }
    if (websites.some((w) => w.url === normalized)) {
      setError("این وب‌سایت قبلاً اضافه شده است.");
      return;
    }
    const site: Website = {
      id: crypto.randomUUID(),
      url: normalized,
      name: name || new URL(normalized).hostname,
    };
    save([site, ...websites]);
    setUrl("");
    setName("");
    setShowForm(false);
  }

  function removeWebsite(id: string) {
    if (!confirm("آیا از حذف این وب‌سایت مطمئن هستید؟")) return;
    save(websites.filter((w) => w.id !== id));
  }

  async function runScan(id: string) {
    setScanning(id);
    await new Promise((r) => setTimeout(r, 1500));
    const list = websites.map((w) => {
      if (w.id !== id) return w;
      return { ...w, ...mockScanResult(w.url) };
    });
    save(list);
    setScanning(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">وب‌سایت‌ها</h1>
          <p className="text-muted-foreground text-sm mt-1">
            مدیریت و اسکن وب‌سایت‌های شما
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          افزودن وب‌سایت
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={addWebsite}
          className="rounded-xl border bg-card p-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">آدرس وب‌سایت</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="example.com"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">نام نمایشی (اختیاری)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="فروشگاه من"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit">افزودن</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              انصراف
            </Button>
          </div>
        </form>
      )}

      {websites.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">هنوز وب‌سایتی اضافه نشده است</p>
          <Button onClick={() => setShowForm(true)}>افزودن اولین وب‌سایت</Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {websites.map((w) => (
            <div
              key={w.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold">{w.name}</p>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {w.url}
                </p>
                {w.lastScanAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    آخرین اسکن:{" "}
                    {new Date(w.lastScanAt).toLocaleString("fa-IR")}
                    {w.issuesCount != null && ` · ${w.issuesCount} مشکل`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {w.lastScore != null && (
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      w.lastScore >= 80
                        ? "bg-green-100 text-green-800"
                        : w.lastScore >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {w.lastScore}/100
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => runScan(w.id)}
                  disabled={scanning === w.id}
                  className="gap-1.5"
                >
                  {scanning === w.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {scanning === w.id ? "در حال اسکن..." : "اسکن"}
                </Button>
                <Link href={`/dashboard/websites/${w.id}`}>
                  <Button size="sm" variant="outline">
                    جزئیات
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeWebsite(w.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
