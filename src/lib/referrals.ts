import type { SupabaseClient, User } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

import { getOwnerAdminEmail } from "@/lib/admin-auth";

type ReferralProfile = {
  user_id: string;
  referral_code: string;
  display_name: string | null;
  email: string | null;
  usdt_sender_wallet_address?: string | null;
  usdt_sender_wallet_network?: string | null;
  usdt_sender_wallet_updated_at?: string | null;
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

async function ensureOwnerAgent(supabase: SupabaseClient, profile: ReferralProfile) {
  const ownerAdminEmail = getOwnerAdminEmail();

  if (
    !ownerAdminEmail ||
    (profile.email ?? "").trim().toLowerCase() !== ownerAdminEmail
  ) {
    return;
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .maybeSingle();

  if (tournament.error || !tournament.data) {
    return;
  }

  const agent = await supabase
    .from("worldcup_agents")
    .upsert(
      {
        tournament_id: tournament.data.id,
        user_id: profile.user_id,
        email: profile.email,
        display_name: profile.display_name,
        active: true,
        created_by: "owner-bootstrap",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tournament_id,user_id" },
    );

  if (agent.error) {
    return;
  }

  await supabase.rpc("worldcup_bootstrap_owner_agent_inventory", {
    p_owner_email: ownerAdminEmail,
    p_quantity: 1000,
    p_created_by: "owner-bootstrap",
  });
}

export async function getOrCreateReferralProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<ReferralProfile> {
  const existing = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id,referral_code,display_name,email,usdt_sender_wallet_address,usdt_sender_wallet_network,usdt_sender_wallet_updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    const displayName = getUserDisplayName(user);
    const email = user.email ?? null;
    const profile = {
      ...(existing.data as ReferralProfile),
      display_name: displayName,
      email,
    };

    if (existing.data.display_name !== displayName || existing.data.email !== email) {
      await supabase
        .from("worldcup_referral_profiles")
        .update({ display_name: displayName, email, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    await ensureOwnerAgent(supabase, profile);
    return profile;
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
      .select("user_id,referral_code,display_name,email,usdt_sender_wallet_address,usdt_sender_wallet_network,usdt_sender_wallet_updated_at")
      .single();

    if (!created.error && created.data) {
      const profile = created.data as ReferralProfile;
      await ensureOwnerAgent(supabase, profile);
      return profile;
    }

    if (created.error?.code !== "23505") {
      throw created.error;
    }
  }

  throw new Error("Could not create a referral code.");
}
