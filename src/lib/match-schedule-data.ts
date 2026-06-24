import { createServerReadSupabaseClient } from "@/lib/supabase";
import type { WorldCupMatch, WorldCupStage, WorldCupTeam } from "@/lib/types";

export async function getMatchScheduleData() {
  const supabase = createServerReadSupabaseClient();

  const [teamsResult, stagesResult, matchesResult] = await Promise.all([
    supabase
      .from("worldcup_teams")
      .select("id,name,confederation,group_code,winner_odds,reward_coefficient")
      .order("reward_coefficient", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("worldcup_stages")
      .select("id,name,sort_order,stage_coefficient")
      .order("sort_order", { ascending: true }),
    supabase
      .from("worldcup_matches")
      .select(
        "id,match_number,stage_id,group_code,match_date,local_kickoff_time,kickoff_at,result_check_after,venue,city,home_team_id,away_team_id,home_slot,away_slot,status,finish_method,home_goals_90,away_goals_90,home_goals_total,away_goals_total,home_penalties,away_penalties,winner_team_id,points_applied_at",
      )
      .order("match_number", { ascending: true }),
  ]);

  for (const result of [teamsResult, stagesResult, matchesResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    teams: (teamsResult.data ?? []) as WorldCupTeam[],
    stages: (stagesResult.data ?? []) as WorldCupStage[],
    matches: (matchesResult.data ?? []) as WorldCupMatch[],
  };
}
