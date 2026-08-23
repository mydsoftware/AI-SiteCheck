"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

type Issue = {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  siteName?: string;
};

const severityFa: Record<string, string> = {
  CRITICAL: "بحرانی",
  HIGH: "زیاد",
  MEDIUM: "متوسط",
  LOW: "کم",
};

const severityColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-blue-100 text-blue-800",
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("aisc_websites");
    if (!raw) return;
    try {
      const list = JSON.parse(raw);
      const all: Issue[] = [];
      for (const w of list) {
        for (const i of w.issues || []) {
          all.push({ ...i, siteName: w.name });
        }
      }
      const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
      all.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
      setIssues(all);
    } catch {}
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مشکلات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          همه مشکلات یافت‌شده در وب‌سایت‌ها ({issues.length})
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">مشکلی یافت نشد. ابتدا یک اسکن اجرا کنید.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {issues.map((issue) => (
            <div key={issue.id} className="p-5 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColor[issue.severity] || ""}`}>
                  {severityFa[issue.severity] || issue.severity}
                </span>
                {issue.siteName && (
                  <span className="text-xs text-muted-foreground">{issue.siteName}</span>
                )}
              </div>
              <h3 className="font-medium">{issue.title}</h3>
              <p className="text-sm text-muted-foreground">{issue.description}</p>
              <p className="text-sm">
                <span className="font-medium text-primary">پیشنهاد: </span>
                {issue.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
