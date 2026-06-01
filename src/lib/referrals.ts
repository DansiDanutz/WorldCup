import type { SupabaseClient, User } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

type ReferralProfile = {
  user_id: string;
  referral_code: string;
  display_name: string | null;
  email: string | null;
};

export function normalizeReferralCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function getAuthProvider(user: User) {
  const provider = user.app_metadata.provider;

  return typeof provider === "string" ? provider : null;
}

export function getUserDisplayName(user: User) {
  const fullName = user.user_metadata.full_name;
  const name = user.user_metadata.name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  return user.email ?? "WorldCup player";
}

export async function getOrCreateReferralProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<ReferralProfile> {
  const existing = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id,referral_code,display_name,email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    const displayName = getUserDisplayName(user);
    const email = user.email ?? null;

    if (existing.data.display_name !== displayName || existing.data.email !== email) {
      await supabase
        .from("worldcup_referral_profiles")
        .update({ display_name: displayName, email, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return existing.data as ReferralProfile;
  }

  const displayName = getUserDisplayName(user);
  const email = user.email ?? null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referralCode = randomBytes(5).toString("hex").toUpperCase();
    const created = await supabase
      .from("worldcup_referral_profiles")
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        display_name: displayName,
        email,
      })
      .select("user_id,referral_code,display_name,email")
      .single();

    if (!created.error && created.data) {
      return created.data as ReferralProfile;
    }

    if (created.error?.code !== "23505") {
      throw created.error;
    }
  }

  throw new Error("Could not create a referral code.");
}
