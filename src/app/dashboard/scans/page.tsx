"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanSearch } from "lucide-react";

type Website = {
  id: string;
  url: string;
  name: string;
  lastScore?: number;
  lastScanAt?: string;
  issuesCount?: number;
};

export default function ScansPage() {
  const [scans, setScans] = useState<Website[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("aisc_websites");
    if (raw) {
      try {
        const list: Website[] = JSON.parse(raw);
        setScans(list.filter((w) => w.lastScanAt).sort((a, b) =>
          (b.lastScanAt || "").localeCompare(a.lastScanAt || "")
        ));
      } catch {}
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اسکن‌ها</h1>
        <p className="text-muted-foreground text-sm mt-1">تاریخچه اسکن‌های انجام‌شده</p>
      </div>

      {scans.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <ScanSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">هنوز اسکنی انجام نشده است</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {scans.map((s) => (
            <div key={s.id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.lastScanAt && new Date(s.lastScanAt).toLocaleString("fa-IR")}
                  {s.issuesCount != null && ` · ${s.issuesCount} مشکل`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {s.lastScore != null && (
                  <span className="font-bold">{s.lastScore}/100</span>
                )}
                <Link href={`/dashboard/websites/${s.id}`} className="text-sm text-primary hover:underline">
                  مشاهده
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
