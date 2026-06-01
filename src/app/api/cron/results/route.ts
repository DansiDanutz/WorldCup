import { NextResponse } from "next/server";

import { advanceBracket } from "@/lib/bracket-advance";
import { requireEnv } from "@/lib/env";
import { fetchExternalResult } from "@/lib/result-provider";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { DueMatch } from "@/lib/types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error.";
}

async function runResultCron(request: Request) {
  const authorization = request.headers.get("authorization");
  const expected = `Bearer ${requireEnv("CRON_SECRET")}`;

  if (authorization !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const dueResult = await supabase
    .from("worldcup_matches_due_for_result_check")
    .select(
      "id,tournament_id,match_number,stage_id,home_team_id,away_team_id,home_slot,away_slot,kickoff_at,result_check_after,result_checked_at,status,points_applied_at",
    )
    .order("result_check_after", { ascending: true })
    .limit(25);

  if (dueResult.error) {
    return NextResponse.json({ error: dueResult.error.message }, { status: 500 });
  }

  const processed: Array<{ matchNumber: number; action: string; awardedRows?: number; error?: string }> = [];

  // Each match is isolated: a single provider/DB failure is recorded and the
  // batch continues, so one bad match never blocks every other due match.
  for (const match of (dueResult.data ?? []) as DueMatch[]) {
    try {
      if (match.status === "completed" && !match.points_applied_at) {
        const applyResult = await supabase.rpc("worldcup_apply_match_points", {
          target_match_id: match.id,
        });

        if (applyResult.error) {
          throw applyResult.error;
        }

        processed.push({
          matchNumber: match.match_number,
          action: "applied_existing_result",
          awardedRows: applyResult.data ?? 0,
        });
        continue;
      }

      const providerResult = await fetchExternalResult({
        matchNumber: match.match_number,
        homeTeamId: match.home_team_id,
        awayTeamId: match.away_team_id,
      });

      if (providerResult.status === "not_found") {
        await supabase.rpc("worldcup_mark_match_result_checked", { target_match_id: match.id });
        processed.push({ matchNumber: match.match_number, action: "result_not_available" });
        continue;
      }

      const result = providerResult.result;
      const updateResult = await supabase
        .from("worldcup_matches")
        .update({
          status: "completed",
          finish_method: result.finishMethod,
          home_goals_90: result.homeGoals90,
          away_goals_90: result.awayGoals90,
          home_goals_total: result.homeGoalsTotal,
          away_goals_total: result.awayGoalsTotal,
          home_penalties: result.homePenalties ?? null,
          away_penalties: result.awayPenalties ?? null,
          winner_team_id: result.winnerTeamId ?? null,
          result_checked_at: new Date().toISOString(),
        })
        .eq("id", match.id);

      if (updateResult.error) {
        throw updateResult.error;
      }

      const applyResult = await supabase.rpc("worldcup_apply_match_points", {
        target_match_id: match.id,
      });

      if (applyResult.error) {
        throw applyResult.error;
      }

      processed.push({
        matchNumber: match.match_number,
        action: "fetched_result_and_applied",
        awardedRows: applyResult.data ?? 0,
      });
    } catch (error) {
      processed.push({
        matchNumber: match.match_number,
        action: "error",
        error: getErrorMessage(error),
      });
    }
  }

  // Fill in any knockout participants that the new results unlocked.
  let bracketAdvanced = 0;
  try {
    bracketAdvanced = (await advanceBracket(supabase)).assigned;
  } catch {
    // Non-fatal; bracket advancement retries on the next run.
  }

  return NextResponse.json({ processed, bracketAdvanced });
}

export async function GET(request: Request) {
  return runResultCron(request);
}

export async function POST(request: Request) {
  return runResultCron(request);
}
