export type WorldCupTeam = {
  id: string;
  name: string;
  confederation: string;
  group_code: string | null;
  winner_odds: string | null;
  reward_coefficient: string;
};

export type WorldCupStage = {
  id: string;
  name: string;
  sort_order: number;
  stage_coefficient: string;
};

export type WorldCupMatch = {
  id: string;
  match_number: number;
  stage_id: string;
  group_code: string | null;
  match_date: string;
  local_kickoff_time: string;
  kickoff_at: string;
  result_check_after: string;
  venue: string;
  city: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_slot: string;
  away_slot: string;
  status: "scheduled" | "completed";
  finish_method: "90" | "extra_time" | "penalties" | null;
  home_goals_90: number | null;
  away_goals_90: number | null;
  home_goals_total: number | null;
  away_goals_total: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  winner_team_id: string | null;
  points_applied_at: string | null;
};

export type LeaderboardRow = {
  entry_id: string;
  tournament_id: string;
  display_name: string;
  total_points: string;
  teams:
    | Array<{
        team_id: string;
        team_name: string;
        team_coefficient: string;
        total_points?: string;
      }>
    | null;
  leaderboard_rank: number;
};

export type DueMatch = {
  id: string;
  tournament_id: string;
  match_number: number;
  stage_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_slot: string;
  away_slot: string;
  kickoff_at: string;
  result_check_after: string;
  result_checked_at: string | null;
  status: "scheduled" | "completed";
  points_applied_at: string | null;
};

export type MatchTeamPoints = {
  match_id: string;
  tournament_id: string;
  match_number: number;
  stage_id: string;
  team_id: string;
  team_name: string;
  team_coefficient: string;
  stage_coefficient: string;
  result_base_points: string;
  goal_bonus_points: string;
  clean_sheet_bonus_points: string;
  base_points: string;
  final_points: string;
};

export type EntryPayload = {
  displayName: string;
  teamIds: string[];
  referralCode?: string;
  referralTermsAccepted?: boolean;
};

export type ResultPayload = {
  adminSecret: string;
  matchId: string;
  finishMethod: "90" | "extra_time" | "penalties";
  homeGoals90: number;
  awayGoals90: number;
  homeGoalsTotal: number;
  awayGoalsTotal: number;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerTeamId?: string | null;
};
