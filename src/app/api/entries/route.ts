import { NextResponse } from "next/server";

import { createPublicSupabaseClient } from "@/lib/supabase";
import type { EntryPayload } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as EntryPayload;
  const displayName = payload.displayName?.trim();
  const teamIds = Array.isArray(payload.teamIds) ? payload.teamIds : [];

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  if (new Set(teamIds).size !== 3) {
    return NextResponse.json({ error: "Choose exactly 3 different teams." }, { status: 400 });
  }

  const supabase = createPublicSupabaseClient();

  const tournamentResult = await supabase
    .from("worldcup_tournaments")
    .select("id,status")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournamentResult.error || !tournamentResult.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  if (tournamentResult.data.status !== "open") {
    return NextResponse.json({ error: "Team selection is locked." }, { status: 403 });
  }

  const entryResult = await supabase
    .from("worldcup_entries")
    .insert({
      tournament_id: tournamentResult.data.id,
      display_name: displayName,
    })
    .select("id")
    .single();

  if (entryResult.error || !entryResult.data) {
    return NextResponse.json({ error: "Could not create entry." }, { status: 500 });
  }

  const picks = teamIds.map((teamId, index) => ({
    entry_id: entryResult.data.id,
    team_id: teamId,
    pick_slot: index + 1,
  }));

  const pickResult = await supabase.from("worldcup_entry_teams").insert(picks);

  if (pickResult.error) {
    return NextResponse.json({ error: "Could not save selected teams." }, { status: 500 });
  }

  const finalizeResult = await supabase.rpc("worldcup_finalize_entry", {
    target_entry_id: entryResult.data.id,
  });

  if (finalizeResult.error) {
    return NextResponse.json({ error: "Could not lock entry." }, { status: 500 });
  }

  return NextResponse.json({ entryId: entryResult.data.id });
}

