import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { advanceBracket } from "@/lib/bracket-advance";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { normalizeResultPayload } from "@/lib/result-validation";
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

  const match = await supabase
    .from("worldcup_matches")
    .select("id,match_number,home_team_id,away_team_id")
    .eq("id", matchId)
    .maybeSingle();

  if (match.error) {
    return jsonError("Could not load the match.", 500);
  }

  if (!match.data) {
    return jsonError("Match not found.", 404);
  }

  // Run the same cross-field validation the automated provider path uses, so a
  // manually entered result cannot be internally inconsistent (e.g. totals below
  // the 90-minute goals, penalties on a non-shootout, or a winner that did not
  // win). This also resolves/validates the winning team against the match teams.
  let normalized: ReturnType<typeof normalizeResultPayload>;
  try {
    normalized = normalizeResultPayload(
      {
        finishMethod,
        homeGoals90,
        awayGoals90,
        homeGoalsTotal,
        awayGoalsTotal,
        homePenalties,
        awayPenalties,
        winnerTeamId,
      },
      {
        matchNumber: match.data.match_number,
        homeTeamId: match.data.home_team_id,
        awayTeamId: match.data.away_team_id,
      },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid result.", 400);
  }

  const updateResult = await supabase
    .from("worldcup_matches")
    .update({
      status: "completed",
      finish_method: normalized.finishMethod,
      home_goals_90: normalized.homeGoals90,
      away_goals_90: normalized.awayGoals90,
      home_goals_total: normalized.homeGoalsTotal,
      away_goals_total: normalized.awayGoalsTotal,
      home_penalties: normalized.homePenalties,
      away_penalties: normalized.awayPenalties,
      winner_team_id: normalized.winnerTeamId,
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
