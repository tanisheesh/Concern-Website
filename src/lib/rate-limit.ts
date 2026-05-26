interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>();

// Prune expired entries every minute
const pruner = setInterval(() => {
  const now = Date.now();
  for (const [k, e] of store) if (now > e.resetAt) store.delete(k);
}, 60_000);
pruner.unref?.();

export function rateLimit(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
