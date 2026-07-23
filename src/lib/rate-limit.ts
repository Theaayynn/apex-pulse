/**
 * Minimal in-memory rate limiter. Good enough for a single Node process
 * (Vercel serverless functions are short-lived per instance, Railway/VPS is
 * one long-lived process). Swap the `hits` Map for Redis/Upstash if you
 * scale to multiple instances.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000); // 15 min
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? 100);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { windowMs = WINDOW_MS, max = MAX_REQUESTS }: { windowMs?: number; max?: number } = {}
): RateLimitResult {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
