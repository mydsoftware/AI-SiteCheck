import { isIP } from "net";
import { lookup } from "dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "instance-data",
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0)) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function normalizeMappedIPv4(ip: string): string | null {
  const lower = ip.toLowerCase();
  const match = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  return match ? match[1] : null;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase().split("%")[0];
  if (lower === "::" || lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
  if (lower.startsWith("ff")) return true;
  return false;
}

export function isPrivateIP(ip: string): boolean {
  const mapped = normalizeMappedIPv4(ip);
  if (mapped) return isPrivateIPv4(mapped);
  if (isIP(ip) === 4) return isPrivateIPv4(ip);
  if (isIP(ip) === 6) return isPrivateIPv6(ip);
  return false;
}

export function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (lower.endsWith(".local") || lower.endsWith(".internal")) return true;
  if (lower === "0.0.0.0" || lower === "[::]" || lower === "[::1]") return true;
  return false;
}

export async function validateUrlForScan(urlString: string): Promise<{
  ok: boolean;
  url?: URL;
  error?: string;
}> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { ok: false, error: "invalidUrl" };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "invalidUrl" };
  }

  const hostname = url.hostname;
  if (isBlockedHostname(hostname)) {
    return { ok: false, error: "ssrf" };
  }

  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      return { ok: false, error: "ssrf" };
    }
    return { ok: true, url };
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (addresses.length === 0) return { ok: false, error: "invalidUrl" };
    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        return { ok: false, error: "ssrf" };
      }
    }
  } catch {
    return { ok: false, error: "invalidUrl" };
  }

  return { ok: true, url };
}
