"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { resolveRole } from "@/lib/auth-config";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 700));
    if (!name || !email || !password) {
      setError("همه فیلدها الزامی هستند.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      setLoading(false);
      return;
    }
    const role = resolveRole(email);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "aisc_user",
        JSON.stringify({ email: email.trim(), name, role })
      );
    }
    router.push(role === "ADMIN" ? "/dashboard/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <BarChart3 className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold">ای‌آی سایت‌چک</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2">ایجاد حساب کاربری</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          رایگان شروع کنید — اولین اسکن رایگان است
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">نام</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="نام شما"
              required
            />
          </div>
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
              placeholder="حداقل ۶ کاراکتر"
              dir="ltr"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="text-primary hover:underline">
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}
