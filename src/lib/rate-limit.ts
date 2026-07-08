/**
 * Best-effort, in-memory fixed-window rate limiter. Deliberately not
 * backed by Redis: this is a stopgap for a single-instance deployment
 * (local dev, one Docker container). On serverless (Vercel), each cold
 * start gets its own empty Map, so this does NOT enforce a real limit
 * across instances — production hardening needs a shared store (e.g.
 * Upstash Redis) once that's provisioned.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  // Only enforced in production: in dev/test there's no real adversary, and
  // the shared "unknown" bucket (see requestIp below) would otherwise make
  // local development and E2E test runs flaky.
  if (process.env.NODE_ENV !== "production") return { allowed: true };

  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

export function requestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
