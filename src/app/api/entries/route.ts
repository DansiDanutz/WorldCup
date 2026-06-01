import { NextResponse } from "next/server";

import { getAuthProvider, normalizeReferralCode } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getLockedTeamIds } from "@/lib/team-eligibility";
import type { EntryPayload } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as EntryPayload;
  const displayName = payload.displayName?.trim();
  const teamIds = Array.isArray(payload.teamIds) ? payload.teamIds : [];
  const referralCode = normalizeReferralCode(payload.referralCode);
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  if (new Set(teamIds).size !== 3) {
    return NextResponse.json({ error: "Choose exactly 3 different teams." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const userResult = token ? await supabase.auth.getUser(token) : null;

  if (!userResult?.data.user || userResult.error) {
    return NextResponse.json({ error: "Sign in with Google before locking an entry." }, { status: 401 });
  }

  const user = userResult.data.user;

  if (getAuthProvider(user) !== "google") {
    return NextResponse.json({ error: "Only Google sign-in is allowed." }, { status: 403 });
  }

  if (referralCode && !payload.referralTermsAccepted) {
    return NextResponse.json(
      { error: "Accept the 5% referral agreement before joining with a referral code." },
      { status: 400 },
    );
  }

  const [tournamentResult, teamsResult, groupMatchesResult] = await Promise.all([
    supabase
      .from("worldcup_tournaments")
      .select("id,status")
      .eq("slug", "fifa-world-cup-2026")
      .single(),
    supabase.from("worldcup_teams").select("id,name").in("id", teamIds),
    supabase
      .from("worldcup_matches")
      .select("home_team_id,away_team_id,kickoff_at")
      .eq("stage_id", "group_stage")
      .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`),
  ]);

  if (tournamentResult.error || !tournamentResult.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  if (teamsResult.error || !teamsResult.data || teamsResult.data.length !== 3) {
    return NextResponse.json({ error: "Choose exactly 3 valid teams." }, { status: 400 });
  }

  if (groupMatchesResult.error) {
    return NextResponse.json({ error: "Could not check team availability." }, { status: 500 });
  }

  const lockedTeamIds = getLockedTeamIds(teamIds, groupMatchesResult.data ?? []);

  if (lockedTeamIds.length > 0) {
    const namesById = new Map((teamsResult.data ?? []).map((team) => [team.id, team.name]));
    const lockedTeamNames = lockedTeamIds.map((teamId) => namesById.get(teamId) ?? teamId);

    return NextResponse.json(
      {
        error: `${lockedTeamNames.join(", ")} can no longer be selected because the second group match has started.`,
      },
      { status: 403 },
    );
  }

  if (tournamentResult.data.status !== "open") {
    return NextResponse.json({ error: "Team selection is locked." }, { status: 403 });
  }

  let referrerUserId: string | null = null;

  if (referralCode) {
    const referralProfile = await supabase
      .from("worldcup_referral_profiles")
      .select("user_id")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (referralProfile.error || !referralProfile.data) {
      return NextResponse.json({ error: "Referral code is not valid." }, { status: 400 });
    }

    if (referralProfile.data.user_id === user.id) {
      return NextResponse.json({ error: "You cannot use your own referral code." }, { status: 400 });
    }

    referrerUserId = referralProfile.data.user_id;
  }

  const entryResult = await supabase
    .from("worldcup_entries")
    .insert({
      tournament_id: tournamentResult.data.id,
      user_id: user.id,
      display_name: displayName,
      referral_code: referralCode || null,
      referrer_user_id: referrerUserId,
      referral_fee_percent: referrerUserId ? 5 : 0,
      referral_terms_accepted_at: referrerUserId ? new Date().toISOString() : null,
      auth_provider: "google",
    })
    .select("id")
    .single();

  if (entryResult.error || !entryResult.data) {
    if (entryResult.error?.code === "23505") {
      return NextResponse.json(
        { error: "You already locked an entry for this tournament." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Could not create entry." }, { status: 500 });
  }

  const picks = teamIds.map((teamId, index) => ({
    entry_id: entryResult.data.id,
    team_id: teamId,
    pick_slot: index + 1,
  }));

  const pickResult = await supabase.from("worldcup_entry_teams").insert(picks);

  if (pickResult.error) {
    await supabase.from("worldcup_entries").delete().eq("id", entryResult.data.id);

    return NextResponse.json(
      { error: pickResult.error.message ?? "Could not save selected teams." },
      { status: 500 },
    );
  }

  const finalizeResult = await supabase.rpc("worldcup_finalize_entry", {
    target_entry_id: entryResult.data.id,
  });

  if (finalizeResult.error) {
    return NextResponse.json({ error: "Could not lock entry." }, { status: 500 });
  }

  if (referrerUserId) {
    const referralResult = await supabase.from("worldcup_referrals").upsert(
      {
        tournament_id: tournamentResult.data.id,
        entry_id: entryResult.data.id,
        inviter_user_id: referrerUserId,
        invited_user_id: user.id,
        referral_code: referralCode,
        referral_fee_percent: 5,
        accepted_at: new Date().toISOString(),
      },
      { onConflict: "tournament_id,invited_user_id" },
    );

    if (referralResult.error) {
      return NextResponse.json({ error: "Could not save referral agreement." }, { status: 500 });
    }
  }

  return NextResponse.json({ entryId: entryResult.data.id });
}
