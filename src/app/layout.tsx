import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ای‌آی سایت‌چک | AI SiteCheck",
    template: "%s | ای‌آی سایت‌چک",
  },
  description:
    "سایتت را بررسی کن، مشکلاتش را پیدا کن، اصلاحش کن. تحلیل SEO، عملکرد، امنیت، دسترسی‌پذیری و RTL با هوش مصنوعی.",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ای‌آی سایت‌چک",
    title: "ای‌آی سایت‌چک — بررسی هوشمند وب‌سایت",
    description: "سایتت را بررسی کن، مشکلاتش را پیدا کن، اصلاحش کن.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
