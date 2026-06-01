import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export { getBearerToken } from "@/lib/request";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function enforceRateLimit(
  request: Request,
  name: string,
  options: { limit: number; windowMs: number },
): NextResponse | null {
  const key = `${name}:${getClientIp(request)}`;
  const result = checkRateLimit(key, options.limit, options.windowMs);

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
