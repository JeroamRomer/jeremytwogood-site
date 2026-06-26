const MCP_LIMIT = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(ip: string): { allowed: boolean; remaining: number };
  reset(): void;
}

// In-memory, per-IP limiter. The store persists within a warm function instance
// and resets on cold start — a soft abuse ceiling, not durable accounting.
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  let store = new Map<string, Entry>();

  return {
    check(ip: string) {
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
      }

      if (entry.count >= limit) {
        return { allowed: false, remaining: 0 };
      }

      entry.count++;
      return { allowed: true, remaining: limit - entry.count };
    },
    reset() {
      store = new Map();
    },
  };
}

// MCP action tools: 3 requests per IP per day. Kept as named exports for the
// existing MCP server and its tests.
const mcpLimiter = createRateLimiter(MCP_LIMIT, DAY_MS);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  return mcpLimiter.check(ip);
}

// Exported for tests only — not called in production code.
export function resetRateLimitStore(): void {
  mcpLimiter.reset();
}
