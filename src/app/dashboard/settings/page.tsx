"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("aisc_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  function clearData() {
    if (!confirm("همه وب‌سایت‌ها و نتایج اسکن پاک شوند؟")) return;
    localStorage.removeItem("aisc_websites");
    alert("داده‌ها پاک شدند.");
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات</h1>
        <p className="text-muted-foreground text-sm mt-1">تنظیمات حساب و داده</p>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold">حساب کاربری</h2>
        <p className="text-sm">
          <span className="text-muted-foreground">نام: </span>
          {user?.name || "—"}
        </p>
        <p className="text-sm" dir="ltr">
          <span className="text-muted-foreground">Email: </span>
          {user?.email || "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          نسخه دمو — احراز هویت واقعی در فاز بعدی اضافه می‌شود.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold">داده محلی</h2>
        <p className="text-sm text-muted-foreground">
          وب‌سایت‌ها و نتایج اسکن فعلاً در مرورگر شما ذخیره می‌شوند.
        </p>
        <Button variant="outline" onClick={clearData}>
          پاک کردن همه داده‌ها
        </Button>
      </div>
    </div>
  );
}
