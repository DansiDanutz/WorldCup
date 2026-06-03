import type { SupabaseClient } from "@supabase/supabase-js";

import { getBearerToken } from "@/lib/request";
import { timingSafeEqualStrings } from "@/lib/secure-compare";

// Built-in default owner admin Google account. Kept in code for production
// continuity, but overridable via the OWNER_ADMIN_EMAIL env var (rotate the
// owner) or removable by setting OWNER_ADMIN_EMAIL to "none"/"disabled"
// (break-glass via ADMIN_RESULT_SECRET still works). Resolve the effective
// owner through getOwnerAdminEmail() rather than reading this constant directly.
export const OWNER_ADMIN_EMAIL = "semebitcoin@gmail.com";

export type AdminAuthResult =
  | { ok: true; via: "email"; adminEmail: string }
  | { ok: true; via: "secret"; adminEmail: null }
  | { ok: false; status: number; error: string };

type AdminEmailEnv = Record<string, string | undefined>;

const OWNER_ADMIN_DISABLED_VALUES = new Set(["none", "disabled", "off", "false"]);

/**
 * The effective owner admin email. Defaults to OWNER_ADMIN_EMAIL for production
 * continuity, can be rotated by setting the OWNER_ADMIN_EMAIL env var, or
 * removed entirely by setting it to "none"/"disabled" (returns null). When
 * removed, admin access still works via ADMIN_EMAILS and the break-glass secret.
 */
export function getOwnerAdminEmail(env: AdminEmailEnv = process.env): string | null {
  const configured = (env.OWNER_ADMIN_EMAIL ?? "").trim().toLowerCase();

  if (OWNER_ADMIN_DISABLED_VALUES.has(configured)) {
    return null;
  }

  return configured || OWNER_ADMIN_EMAIL;
}

export function getAdminEmailAllowlist(env: AdminEmailEnv = process.env): string[] {
  const configuredEmails = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const ownerEmail = getOwnerAdminEmail(env);

  return Array.from(new Set([...configuredEmails, ...(ownerEmail ? [ownerEmail] : [])]));
}

export function isAllowlistedAdminEmail(
  email: string | null | undefined,
  env: AdminEmailEnv = process.env,
): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmailAllowlist(env).includes(email.trim().toLowerCase());
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
