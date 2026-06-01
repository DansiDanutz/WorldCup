// Pure, dependency-free sliding-window limiter. In a serverless deployment each
// instance keeps its own buckets, so this is a best-effort guard against bursts
// and brute-force, not a globally exact quota. For strict limits use a shared
// store (Supabase/Redis). The Next-aware wrapper lives in http.ts.

type Bucket = {
  hits: number[];
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const bucket = buckets.get(key) ?? { hits: [] };

  bucket.hits = bucket.hits.filter((timestamp) => timestamp > windowStart);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);

    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so the map does not grow without bound.
  if (buckets.size > 5000) {
    for (const [bucketKey, value] of buckets) {
      value.hits = value.hits.filter((timestamp) => timestamp > windowStart);

      if (value.hits.length === 0) {
        buckets.delete(bucketKey);
      }
    }
  }

  return { allowed: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 };
}
