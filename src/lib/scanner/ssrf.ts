import { isIP } from "net";
import { lookup } from "dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "instance-data",
]);

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
];

export function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

export function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (lower.endsWith(".local") || lower.endsWith(".internal")) return true;
  if (lower === "0.0.0.0") return true;
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
    const addresses = await lookup(hostname, { all: true });
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
