export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * A basic in-memory rate limiter compatible with Edge environments.
 * For production with multiple instances/edge nodes, replace this with Upstash Redis or similar.
 */
export async function rateLimit(
  ip: string,
  limit: number = 100, // requests
  windowMs: number = 60000 // per minute
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = memoryStore.get(ip);

  if (!record || record.resetTime < now) {
    memoryStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  const newCount = record.count + 1;
  memoryStore.set(ip, { count: newCount, resetTime: record.resetTime });

  return {
    success: newCount <= limit,
    limit,
    remaining: Math.max(0, limit - newCount),
    reset: record.resetTime,
  };
}
