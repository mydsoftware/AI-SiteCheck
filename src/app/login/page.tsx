"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock auth for demo — any email/password works
    await new Promise((r) => setTimeout(r, 600));
    if (!email || !password) {
      setError("ایمیل و رمز عبور را وارد کنید.");
      setLoading(false);
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("aisc_user", JSON.stringify({ email, name: email.split("@")[0] }));
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <BarChart3 className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold">ای‌آی سایت‌چک</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2">ورود به حساب</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          برای ادامه وارد حساب کاربری خود شوید
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          حساب ندارید؟{" "}
          <Link href="/register" className="text-primary hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
        <p className="text-xs text-center text-muted-foreground mt-3">
          نسخه دمو: هر ایمیل و رمزی پذیرفته می‌شود
        </p>
      </div>
    </div>
  );
}
