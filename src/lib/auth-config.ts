/** ایمیل‌های ادمین سیستم */
export const ADMIN_EMAILS = [
  "yusefimohammad@gmail.com",
].map((e) => e.toLowerCase().trim());

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export type UserRole = "ADMIN" | "USER";

export function resolveRole(email: string): UserRole {
  return isAdminEmail(email) ? "ADMIN" : "USER";
}
