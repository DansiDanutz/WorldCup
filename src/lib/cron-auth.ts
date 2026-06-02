import { requireEnv } from "@/lib/env";
import { getBearerToken } from "@/lib/request";
import { timingSafeEqualStrings } from "@/lib/secure-compare";

/**
 * Verifies a Vercel cron / trusted-caller request against `CRON_SECRET` using a
 * constant-time comparison. Fails closed: if `CRON_SECRET` is unset, `requireEnv`
 * throws and the caller returns a 5xx rather than allowing the request through.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const token = getBearerToken(request);

  if (!token) {
    return false;
  }

  return timingSafeEqualStrings(token, requireEnv("CRON_SECRET"));
}
