"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Globe,
  ScanSearch,
  AlertTriangle,
  Plus,
  TrendingUp,
} from "lucide-react";

type Website = {
  id: string;
  url: string;
  name: string;
  lastScore?: number;
  lastScanAt?: string;
  issuesCount?: number;
};

export default function DashboardPage() {
  const [websites, setWebsites] = useState<Website[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("aisc_websites");
    if (raw) {
      try {
        setWebsites(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const totalIssues = websites.reduce((s, w) => s + (w.issuesCount || 0), 0);
  const avgScore =
    websites.filter((w) => w.lastScore != null).length > 0
      ? Math.round(
          websites
            .filter((w) => w.lastScore != null)
            .reduce((s, w) => s + (w.lastScore || 0), 0) /
            websites.filter((w) => w.lastScore != null).length
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">نمای کلی</h1>
          <p className="text-muted-foreground text-sm mt-1">
            خلاصه وضعیت وب‌سایت‌ها و اسکن‌ها
          </p>
        </div>
        <Link href="/dashboard/websites">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            افزودن وب‌سایت
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Globe}
          label="وب‌سایت‌ها"
          value={String(websites.length)}
        />
        <StatCard
          icon={ScanSearch}
          label="اسکن انجام‌شده"
          value={String(websites.filter((w) => w.lastScanAt).length)}
        />
        <StatCard
          icon={AlertTriangle}
          label="مشکلات یافت‌شده"
          value={String(totalIssues)}
        />
        <StatCard
          icon={TrendingUp}
          label="میانگین امتیاز"
          value={avgScore != null ? `${avgScore}/100` : "—"}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">وب‌سایت‌های اخیر</h2>
          <Link href="/dashboard/websites" className="text-sm text-primary hover:underline">
            مشاهده همه
          </Link>
        </div>
        {websites.length === 0 ? (
          <div className="p-10 text-center">
            <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">هنوز وب‌سایتی اضافه نکرده‌اید</p>
            <Link href="/dashboard/websites">
              <Button>افزودن اولین وب‌سایت</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {websites.slice(0, 5).map((w) => (
              <div
                key={w.id}
                className="px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{w.name || w.url}</p>
                  <p className="text-xs text-muted-foreground truncate" dir="ltr">
                    {w.url}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {w.lastScore != null && (
                    <ScoreBadge score={w.lastScore} />
                  )}
                  <Link href={`/dashboard/websites/${w.id}`}>
                    <Button variant="outline" size="sm">
                      جزئیات
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : score >= 60
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {score}/100
    </span>
  );
}
