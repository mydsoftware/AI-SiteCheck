"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Globe,
  ScanSearch,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminEmail } from "@/lib/auth-config";

type StoredUser = {
  name?: string;
  email?: string;
  role?: string;
};

const baseNav = [
  { href: "/dashboard", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/dashboard/websites", label: "وب‌سایت‌ها", icon: Globe },
  { href: "/dashboard/scans", label: "اسکن‌ها", icon: ScanSearch },
  { href: "/dashboard/issues", label: "مشکلات", icon: AlertTriangle },
  { href: "/dashboard/reports", label: "گزارش‌ها", icon: FileText },
  { href: "/dashboard/settings", label: "تنظیمات", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("aisc_user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const u = JSON.parse(raw) as StoredUser;
      // refresh role from email in case config changed
      if (u.email && isAdminEmail(u.email)) {
        u.role = "ADMIN";
        localStorage.setItem("aisc_user", JSON.stringify(u));
      }
      setUser(u);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("aisc_user");
    localStorage.removeItem("aisc_websites");
    router.push("/");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN" || isAdminEmail(user.email);
  const nav = isAdmin
    ? [
        ...baseNav,
        { href: "/dashboard/admin", label: "پنل ادمین", icon: Shield },
      ]
    : baseNav;

  return (
    <div className="min-h-screen flex bg-muted/20">
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 right-0 z-50 w-64 border-l bg-card flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold">ای‌آی سایت‌چک</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <div className="px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{user.name || "کاربر"}</p>
              {isAdmin && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                  ادمین
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate" dir="ltr">
              {user.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center px-4 gap-3 lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
