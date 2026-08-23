"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, Globe, ScanSearch } from "lucide-react";
import { isAdminEmail } from "@/lib/auth-config";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [stats, setStats] = useState({ websites: 0, scanned: 0, issues: 0 });
  const [email, setEmail] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("aisc_user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "ADMIN" && !isAdminEmail(u.email)) {
        router.replace("/dashboard");
        return;
      }
      setEmail(u.email || "");
      setAllowed(true);

      const sitesRaw = localStorage.getItem("aisc_websites");
      if (sitesRaw) {
        const sites = JSON.parse(sitesRaw);
        const scanned = sites.filter((s: { lastScanAt?: string }) => s.lastScanAt).length;
        const issues = sites.reduce(
          (n: number, s: { issuesCount?: number }) => n + (s.issuesCount || 0),
          0
        );
        setStats({ websites: sites.length, scanned, issues });
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">در حال بررسی دسترسی...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">پنل ادمین</h1>
          <p className="text-sm text-muted-foreground">
            دسترسی مدیریت سیستم
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold mb-2">حساب ادمین فعال</h2>
        <p className="text-sm text-muted-foreground" dir="ltr">
          {email}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          این ایمیل در لیست ادمین‌های سیستم تعریف شده است.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">وب‌سایت‌ها (این مرورگر)</p>
            <p className="text-2xl font-bold">{stats.websites}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 flex items-center gap-3">
          <ScanSearch className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">اسکن‌شده</p>
            <p className="text-2xl font-bold">{stats.scanned}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">مشکلات یافت‌شده</p>
            <p className="text-2xl font-bold">{stats.issues}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-2 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">نکته</h2>
        <p>
          در نسخه دمو، داده کاربران و اسکن‌ها در مرورگر ذخیره می‌شود. پس از اتصال
          دیتابیس و Auth واقعی، پنل ادمین لیست همه کاربران، اسکن‌های سراسری و
          تنظیمات پلن‌ها را نمایش می‌دهد.
        </p>
      </div>
    </div>
  );
}
