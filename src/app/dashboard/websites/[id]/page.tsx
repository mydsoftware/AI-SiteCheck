"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Loader2 } from "lucide-react";

type Issue = {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
};

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

const severityFa: Record<string, string> = {
  CRITICAL: "بحرانی",
  HIGH: "زیاد",
  MEDIUM: "متوسط",
  LOW: "کم",
  INFO: "اطلاعاتی",
};

const categoryFa: Record<string, string> = {
  SEO: "سئو",
  PERFORMANCE: "عملکرد",
  ACCESSIBILITY: "دسترسی‌پذیری",
  SECURITY: "امنیت",
  MOBILE: "موبایل",
  RTL: "فارسی / RTL",
  IMAGE: "تصاویر",
  TECHNICAL: "فنی",
};

const severityColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  INFO: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [site, setSite] = useState<Website | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  function load() {
    const raw = localStorage.getItem("aisc_websites");
    if (!raw) return;
    try {
      const list: Website[] = JSON.parse(raw);
      const found = list.find((w) => w.id === id);
      if (found) setSite(found);
      else router.replace("/dashboard/websites");
    } catch {
      router.replace("/dashboard/websites");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function rescan() {
    if (!site) return;
    setScanning(true);
    setError("");
    try {
      const res = await fetch("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: site.url }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "اسکن ناموفق بود");
        return;
      }
      const r = data.result;
      const raw = localStorage.getItem("aisc_websites");
      if (!raw) return;
      const list: Website[] = JSON.parse(raw);
      const updated = list.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          lastScore: r.overallScore,
          lastScanAt: r.meta.scannedAt,
          issuesCount: r.issues.length,
          scores: r.scores,
          issues: r.issues,
        };
      });
      localStorage.setItem("aisc_websites", JSON.stringify(updated));
      setSite(updated.find((w) => w.id === id) || null);
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setScanning(false);
    }
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const counts = {
    CRITICAL: site.issues?.filter((i) => i.severity === "CRITICAL").length || 0,
    HIGH: site.issues?.filter((i) => i.severity === "HIGH").length || 0,
    MEDIUM: site.issues?.filter((i) => i.severity === "MEDIUM").length || 0,
    LOW: site.issues?.filter((i) => i.severity === "LOW").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/websites" className="hover:text-foreground">
          وب‌سایت‌ها
        </Link>
        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
        <span className="text-foreground">{site.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-sm text-muted-foreground" dir="ltr">
            {site.url}
          </p>
        </div>
        <Button onClick={rescan} disabled={scanning} className="gap-2">
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {scanning ? "در حال اسکن..." : "اسکن مجدد"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {site.lastScore != null ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">امتیاز کلی</p>
              <p
                className={`text-4xl font-bold ${
                  site.lastScore >= 80
                    ? "text-green-600"
                    : site.lastScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {site.lastScore}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
            </div>
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
              <div key={sev} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground mb-1">
                  {severityFa[sev]}
                </p>
                <p className="text-2xl font-bold">{counts[sev]}</p>
              </div>
            ))}
          </div>

          {site.scores && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold mb-4">امتیاز دسته‌ها</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(site.scores).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">
                      {categoryFa[key.toUpperCase()] ||
                        categoryFa[key] ||
                        key}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold">
                مشکلات ({site.issues?.length || 0})
              </h2>
            </div>
            <div className="divide-y">
              {(site.issues || []).map((issue) => (
                <div key={issue.id} className="p-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColor[issue.severity] || ""}`}
                    >
                      {severityFa[issue.severity] || issue.severity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {categoryFa[issue.category] || issue.category}
                    </span>
                  </div>
                  <h3 className="font-medium">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {issue.description}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-primary">پیشنهاد: </span>
                    {issue.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            هنوز اسکنی برای این وب‌سایت انجام نشده است
          </p>
          <Button onClick={rescan} disabled={scanning} className="gap-2">
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            شروع اولین اسکن
          </Button>
        </div>
      )}
    </div>
  );
}
