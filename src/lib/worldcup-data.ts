import { createPublicSupabaseClient } from "@/lib/supabase";
import type {
  DueMatch,
  LeaderboardRow,
  MatchTeamPoints,
  WorldCupMatch,
  WorldCupStage,
  WorldCupTeam,
} from "@/lib/types";

export async function getDashboardData() {
  const supabase = createPublicSupabaseClient();

  const [teamsResult, stagesResult, matchesResult, leaderboardResult, dueResult] =
    await Promise.all([
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
      supabase
        .from("worldcup_awarded_leaderboard")
        .select("entry_id,tournament_id,display_name,total_points,teams,leaderboard_rank")
        .order("leaderboard_rank", { ascending: true })
        .limit(50),
      supabase
        .from("worldcup_matches_due_for_result_check")
        .select(
          "id,tournament_id,match_number,stage_id,home_slot,away_slot,kickoff_at,result_check_after,result_checked_at,status,points_applied_at",
        )
        .order("result_check_after", { ascending: true })
        .limit(20),
    ]);

  for (const result of [
    teamsResult,
    stagesResult,
    matchesResult,
    leaderboardResult,
    dueResult,
  ]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    teams: (teamsResult.data ?? []) as WorldCupTeam[],
    stages: (stagesResult.data ?? []) as WorldCupStage[],
    matches: (matchesResult.data ?? []) as WorldCupMatch[],
    leaderboard: (leaderboardResult.data ?? []) as LeaderboardRow[],
    dueMatches: (dueResult.data ?? []) as DueMatch[],
  };
}

export async function getTeamCoefficientData() {
  const supabase = createPublicSupabaseClient();
  const result = await supabase
    .from("worldcup_teams")
    .select("id,name,confederation,group_code,winner_odds,reward_coefficient")
    .order("reward_coefficient", { ascending: true })
    .order("name", { ascending: true });

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []) as WorldCupTeam[];
}

export async function getTournamentSchemaData() {
  const supabase = createPublicSupabaseClient();
  const [teamsResult, stagesResult, matchesResult, pointsResult] = await Promise.all([
    supabase
      .from("worldcup_teams")
      .select("id,name,confederation,group_code,winner_odds,reward_coefficient")
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
    supabase
      .from("worldcup_match_team_points")
      .select(
        "match_id,tournament_id,match_number,stage_id,team_id,team_name,team_coefficient,stage_coefficient,result_base_points,goal_bonus_points,clean_sheet_bonus_points,base_points,final_points",
      )
      .order("match_number", { ascending: true }),
  ]);

  for (const result of [teamsResult, stagesResult, matchesResult, pointsResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    teams: (teamsResult.data ?? []) as WorldCupTeam[],
    stages: (stagesResult.data ?? []) as WorldCupStage[],
    matches: (matchesResult.data ?? []) as WorldCupMatch[],
    matchTeamPoints: (pointsResult.data ?? []) as MatchTeamPoints[],
  };
}
