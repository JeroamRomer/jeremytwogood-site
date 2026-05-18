const LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface Entry {
  count: number;
  resetAt: number;
}

// Module-level store — persists within a warm function instance, resets on cold start.
let store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}

// Exported for tests only — not called in production code.
export function resetRateLimitStore(): void {
  store = new Map();
}
