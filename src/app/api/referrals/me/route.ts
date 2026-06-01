import { NextResponse } from "next/server";

import {
  getAuthProvider,
  getOrCreateReferralProfile,
  getUserDisplayName,
} from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Sign in with Google first." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const user = userResult.data.user;

  if (getAuthProvider(user) !== "google") {
    return NextResponse.json({ error: "Only Google sign-in is allowed." }, { status: 403 });
  }

  const profile = await getOrCreateReferralProfile(supabase, user);
  const referrals = await supabase
    .from("worldcup_referrals")
    .select("id,entry_id,referral_code,referral_fee_percent,accepted_at")
    .eq("inviter_user_id", user.id)
    .order("accepted_at", { ascending: false });

  if (referrals.error) {
    return NextResponse.json({ error: "Could not load referral activity." }, { status: 500 });
  }

  const entryIds = (referrals.data ?? [])
    .map((referral) => referral.entry_id)
    .filter((entryId): entryId is string => Boolean(entryId));
  const entries =
    entryIds.length > 0
      ? await supabase.from("worldcup_entries").select("id,display_name").in("id", entryIds)
      : null;

  if (entries?.error) {
    return NextResponse.json({ error: "Could not load referred entries." }, { status: 500 });
  }

  const entriesById = new Map(
    (entries?.data ?? []).map((entry) => [entry.id, entry.display_name ?? "Referred player"]),
  );

  return NextResponse.json({
    referralCode: profile.referral_code,
    displayName: profile.display_name ?? getUserDisplayName(user),
    referrals: (referrals.data ?? []).map((referral) => ({
      id: referral.id,
      entryId: referral.entry_id,
      invitedDisplayName: entriesById.get(referral.entry_id ?? "") ?? "Referred player",
      referralCode: referral.referral_code,
      feePercent: referral.referral_fee_percent,
      acceptedAt: referral.accepted_at,
    })),
  });
}
