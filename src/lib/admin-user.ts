import type { SupabaseClient } from "@supabase/supabase-js";

import { getOwnerAdminEmail } from "@/lib/admin-auth";

export type AdminUserIdentity = {
  userId: string;
  email: string;
};

export async function resolveAdminUserIdentity(
  supabase: SupabaseClient,
  adminEmail: string | null,
): Promise<AdminUserIdentity | null> {
  const email = (adminEmail ?? getOwnerAdminEmail() ?? "").trim().toLowerCase();
  if (!email) {
    return null;
  }

  const profile = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id,email")
    .eq("email", email)
    .maybeSingle();

  if (profile.error || !profile.data?.user_id) {
    return null;
  }

  return {
    userId: profile.data.user_id as string,
    email: (profile.data.email as string | null)?.toLowerCase() ?? email,
  };
}
