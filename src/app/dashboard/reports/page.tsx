"use client";

import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">گزارش‌ها</h1>
        <p className="text-muted-foreground text-sm mt-1">
          گزارش‌های PDF و JSON (به‌زودی)
        </p>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          صدور گزارش PDF و JSON در نسخه بعدی فعال می‌شود.
        </p>
      </div>
    </div>
  );
}
