import type { WorldCupMatch, WorldCupStage, WorldCupTeam } from "@/lib/types";

export function groupTeamsById(teams: WorldCupTeam[]) {
  return new Map(teams.map((team) => [team.id, team]));
}

export function groupStagesById(stages: WorldCupStage[]) {
  return new Map(stages.map((stage) => [stage.id, stage]));
}

export function formatCoefficient(value: string | number) {
  return Number(value).toFixed(2);
}

export function formatPoints(value: string | number) {
  return Number(value).toFixed(2);
}

export function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function getMatchScore(match: WorldCupMatch) {
  if (match.status !== "completed") {
    return "Scheduled";
  }

  const totalScore =
    match.home_goals_total !== null && match.away_goals_total !== null
      ? `${match.home_goals_total}-${match.away_goals_total}`
      : `${match.home_goals_90 ?? 0}-${match.away_goals_90 ?? 0}`;

  if (match.finish_method === "penalties") {
    return `${totalScore} (${match.home_penalties ?? 0}-${match.away_penalties ?? 0} pens)`;
  }

  if (match.finish_method === "extra_time") {
    return `${totalScore} AET`;
  }

  return totalScore;
}

export function getTeamDisplayName(teamId: string | null, fallback: string, teamsById: Map<string, WorldCupTeam>) {
  if (!teamId) {
    return fallback;
  }

  return teamsById.get(teamId)?.name ?? fallback;
}
