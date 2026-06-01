import { NextResponse } from "next/server";

import { isValidAdminSecret } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { ResultPayload } from "@/lib/types";

function numberOrNull(value: number | null | undefined) {
  return typeof value === "number" ? value : null;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ResultPayload;

  if (!isValidAdminSecret(payload.adminSecret)) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  if (!payload.matchId) {
    return NextResponse.json({ error: "Match id is required." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  const updateResult = await supabase
    .from("worldcup_matches")
    .update({
      status: "completed",
      finish_method: payload.finishMethod,
      home_goals_90: payload.homeGoals90,
      away_goals_90: payload.awayGoals90,
      home_goals_total: payload.homeGoalsTotal,
      away_goals_total: payload.awayGoalsTotal,
      home_penalties: numberOrNull(payload.homePenalties),
      away_penalties: numberOrNull(payload.awayPenalties),
      winner_team_id: payload.winnerTeamId ?? null,
      result_checked_at: new Date().toISOString(),
    })
    .eq("id", payload.matchId)
    .select("id")
    .single();

  if (updateResult.error) {
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 });
  }

  const applyResult = await supabase.rpc("worldcup_apply_match_points", {
    target_match_id: payload.matchId,
  });

  if (applyResult.error) {
    return NextResponse.json({ error: applyResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    matchId: updateResult.data.id,
    awardedRows: applyResult.data ?? 0,
  });
}
