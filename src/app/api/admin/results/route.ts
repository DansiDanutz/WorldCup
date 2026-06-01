import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { advanceBracket } from "@/lib/bracket-advance";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  optionalInteger,
  requireEnum,
  requireInteger,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  let matchId: string;
  let finishMethod: "90" | "extra_time" | "penalties";
  let homeGoals90: number;
  let awayGoals90: number;
  let homeGoalsTotal: number;
  let awayGoalsTotal: number;
  let homePenalties: number | null;
  let awayPenalties: number | null;
  let winnerTeamId: string | null;

  try {
    const body = requireObject(await request.json());
    matchId = requireString(body.matchId, "Match id", { max: 64 });
    finishMethod = requireEnum(body.finishMethod, "Finish method", ["90", "extra_time", "penalties"] as const);
    homeGoals90 = requireInteger(body.homeGoals90, "Home 90 goals", { min: 0, max: 99 });
    awayGoals90 = requireInteger(body.awayGoals90, "Away 90 goals", { min: 0, max: 99 });
    homeGoalsTotal = requireInteger(body.homeGoalsTotal, "Home total goals", { min: 0, max: 99 });
    awayGoalsTotal = requireInteger(body.awayGoalsTotal, "Away total goals", { min: 0, max: 99 });
    homePenalties = optionalInteger(body.homePenalties, "Home penalties", { min: 0 });
    awayPenalties = optionalInteger(body.awayPenalties, "Away penalties", { min: 0 });
    winnerTeamId = typeof body.winnerTeamId === "string" && body.winnerTeamId ? body.winnerTeamId : null;
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const updateResult = await supabase
    .from("worldcup_matches")
    .update({
      status: "completed",
      finish_method: finishMethod,
      home_goals_90: homeGoals90,
      away_goals_90: awayGoals90,
      home_goals_total: homeGoalsTotal,
      away_goals_total: awayGoalsTotal,
      home_penalties: homePenalties,
      away_penalties: awayPenalties,
      winner_team_id: winnerTeamId,
      result_checked_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select("id")
    .single();

  if (updateResult.error) {
    return jsonError(updateResult.error.message, 500);
  }

  const applyResult = await supabase.rpc("worldcup_apply_match_points", {
    target_match_id: matchId,
  });

  if (applyResult.error) {
    return jsonError(applyResult.error.message, 500);
  }

  // Progress the bracket if this result resolves any knockout participants.
  let advanced = 0;
  try {
    advanced = (await advanceBracket(supabase)).assigned;
  } catch {
    // Non-fatal: the result is saved; bracket advancement can be retried.
  }

  return NextResponse.json({
    matchId: updateResult.data.id,
    awardedRows: applyResult.data ?? 0,
    bracketAdvanced: advanced,
  });
}
