import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { createServiceSupabaseClient } from "@/lib/supabase";

export { getBearerToken } from "@/lib/request";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) } },
  );
}

/**
 * Cross-instance rate limit backed by the `worldcup_rate_limit_hit` Postgres
 * function, so limits hold across serverless instances. If the database is
 * unavailable it falls back to the per-process limiter (fail-soft: a transient
 * DB issue must not lock everyone out, and the in-memory guard still sheds
 * bursts on the same instance).
 */
export async function enforceRateLimit(
  request: Request,
  name: string,
  options: { limit: number; windowMs: number },
): Promise<NextResponse | null> {
  const key = `${name}:${getClientIp(request)}`;
  const windowSeconds = Math.ceil(options.windowMs / 1000);

  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase.rpc("worldcup_rate_limit_hit", {
      p_key: key,
      p_limit: options.limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      return fallback(key, options);
    }

    return data === false ? tooManyRequests(windowSeconds) : null;
  } catch {
    return fallback(key, options);
  }
}

function fallback(key: string, options: { limit: number; windowMs: number }) {
  const result = checkRateLimit(key, options.limit, options.windowMs);

  return result.allowed ? null : tooManyRequests(result.retryAfterSeconds);
}
