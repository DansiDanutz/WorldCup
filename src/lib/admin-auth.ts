import type { SupabaseClient } from "@supabase/supabase-js";

import { getBearerToken } from "@/lib/request";
import { timingSafeEqualStrings } from "@/lib/secure-compare";

export type AdminAuthResult =
  | { ok: true; via: "email"; adminEmail: string }
  | { ok: true; via: "secret"; adminEmail: null }
  | { ok: false; status: number; error: string };

export function getAdminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmailAllowlist().includes(email.trim().toLowerCase());
}

/**
 * Authorizes an admin request. Primary path: a signed-in Google user whose
 * verified email is on the ADMIN_EMAILS allowlist (token in the Authorization
 * header). Break-glass path: a constant-time match against ADMIN_RESULT_SECRET
 * supplied in the `x-admin-secret` header. The secret is never read from the
 * request body so it cannot leak through logs of JSON payloads.
 */
export async function requireAdmin(
  request: Request,
  supabase: SupabaseClient,
): Promise<AdminAuthResult> {
  const token = getBearerToken(request);

  if (token) {
    const userResult = await supabase.auth.getUser(token);
    const email = userResult.data.user?.email ?? null;

    if (!userResult.error && email && isAllowlistedAdminEmail(email)) {
      return { ok: true, via: "email", adminEmail: email.toLowerCase() };
    }
  }

  const breakGlassSecret = request.headers.get("x-admin-secret");
  const expectedSecret = process.env.ADMIN_RESULT_SECRET;

  if (breakGlassSecret && expectedSecret && timingSafeEqualStrings(breakGlassSecret, expectedSecret)) {
    return { ok: true, via: "secret", adminEmail: null };
  }

  return { ok: false, status: 401, error: "Admin authorization required." };
}
