import type { SupabaseClient } from "@supabase/supabase-js";

import { computeBracketAssignments } from "@/lib/bracket";
import type { WorldCupMatch, WorldCupTeam } from "@/lib/types";

export type BracketAdvanceResult = {
  assigned: number;
  matches: number[];
};

/**
 * Reads the current teams and matches, computes which knockout slots are now
 * resolvable, and fills in the empty sides. Only sides that are currently null
 * are written, so it is safe to call after every result ingestion.
 */
export async function advanceBracket(supabase: SupabaseClient): Promise<BracketAdvanceResult> {
  const [teamsResult, matchesResult] = await Promise.all([
    supabase
      .from("worldcup_teams")
      .select("id,name,confederation,group_code,winner_odds,reward_coefficient"),
    supabase
      .from("worldcup_matches")
      .select(
        "id,match_number,stage_id,group_code,home_team_id,away_team_id,home_slot,away_slot,status,winner_team_id,home_goals_90,away_goals_90",
      )
      .order("match_number", { ascending: true }),
  ]);

  if (teamsResult.error) {
    throw teamsResult.error;
  }

  if (matchesResult.error) {
    throw matchesResult.error;
  }

  const teams = (teamsResult.data ?? []) as WorldCupTeam[];
  const matches = (matchesResult.data ?? []) as WorldCupMatch[];
  const assignments = computeBracketAssignments(teams, matches);
  const matchByMatchId = new Map(matches.map((match) => [match.id, match]));
  const advancedMatchNumbers: number[] = [];

  for (const assignment of assignments) {
    const update: Record<string, string> = {};

    if (assignment.homeTeamId) {
      update.home_team_id = assignment.homeTeamId;
    }

    if (assignment.awayTeamId) {
      update.away_team_id = assignment.awayTeamId;
    }

    if (Object.keys(update).length === 0) {
      continue;
    }

    let query = supabase.from("worldcup_matches").update(update).eq("id", assignment.matchId);

    // Guard against overwriting a side that was filled in concurrently.
    if (assignment.homeTeamId) {
      query = query.is("home_team_id", null);
    }

    if (assignment.awayTeamId) {
      query = query.is("away_team_id", null);
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    const matchNumber = matchByMatchId.get(assignment.matchId)?.match_number;
    if (matchNumber !== undefined) {
      advancedMatchNumbers.push(matchNumber);
    }
  }

  return { assigned: advancedMatchNumbers.length, matches: advancedMatchNumbers };
}
