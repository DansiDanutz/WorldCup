import type { MatchTeamPoints, WorldCupMatch, WorldCupTeam } from "@/lib/types";

export type GroupStanding = {
  team: WorldCupTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type GroupPaths = {
  winner: string | null;
  runnerUp: string | null;
  thirdPlace: string | null;
};

export type GroupDraw = {
  code: string;
  teams: GroupStanding[];
  paths: GroupPaths;
};

export function groupPointsByMatch(points: MatchTeamPoints[]) {
  const grouped = new Map<string, MatchTeamPoints[]>();

  for (const point of points) {
    grouped.set(point.match_id, [...(grouped.get(point.match_id) ?? []), point]);
  }

  return grouped;
}

export function groupMatchesByStage(matches: WorldCupMatch[]) {
  const grouped = new Map<string, WorldCupMatch[]>();

  for (const match of matches) {
    grouped.set(match.stage_id, [...(grouped.get(match.stage_id) ?? []), match]);
  }

  return grouped;
}

export function buildGroupDraw(teams: WorldCupTeam[], matches: WorldCupMatch[]): GroupDraw[] {
  const groupMatches = matches.filter((match) => match.stage_id === "group_stage");

  return [...new Set(teams.map((team) => team.group_code).filter(Boolean))]
    .toSorted()
    .map((groupCode) => {
      const code = groupCode as string;
      const groupTeams = teams
        .filter((team) => team.group_code === code)
        .map((team) => calculateGroupStanding(team, groupMatches))
        .toSorted(compareGroupStanding);

      return {
        code,
        teams: groupTeams,
        paths: getGroupPaths(code, matches),
      };
    });
}

export function calculateGroupStanding(
  team: WorldCupTeam,
  groupMatches: WorldCupMatch[],
): GroupStanding {
  const standing: GroupStanding = {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };

  for (const match of groupMatches) {
    const isHome = match.home_team_id === team.id;
    const isAway = match.away_team_id === team.id;

    if (match.status !== "completed" || (!isHome && !isAway)) {
      continue;
    }

    const goalsFor = isHome ? match.home_goals_90 : match.away_goals_90;
    const goalsAgainst = isHome ? match.away_goals_90 : match.home_goals_90;

    if (goalsFor === null || goalsAgainst === null) {
      continue;
    }

    standing.played += 1;
    standing.goalsFor += goalsFor;
    standing.goalsAgainst += goalsAgainst;

    if (goalsFor > goalsAgainst) {
      standing.won += 1;
      standing.points += 3;
    } else if (goalsFor === goalsAgainst) {
      standing.drawn += 1;
      standing.points += 1;
    } else {
      standing.lost += 1;
    }
  }

  standing.goalDifference = standing.goalsFor - standing.goalsAgainst;

  return standing;
}

export function compareGroupStanding(first: GroupStanding, second: GroupStanding) {
  return (
    second.points - first.points ||
    second.goalDifference - first.goalDifference ||
    second.goalsFor - first.goalsFor ||
    first.team.name.localeCompare(second.team.name)
  );
}

export function getGroupPaths(groupCode: string, matches: WorldCupMatch[]): GroupPaths {
  const winner = findSlotPath(matches, `Group ${groupCode} winners`);
  const runnerUp = findSlotPath(matches, `Group ${groupCode} runners-up`);
  const thirdPlace = matches
    .filter((match) =>
      [match.home_slot, match.away_slot].some((slot) => thirdPlaceSlotIncludesGroup(slot, groupCode)),
    )
    .map((match) => {
      const slot = thirdPlaceSlotIncludesGroup(match.home_slot, groupCode)
        ? match.home_slot
        : match.away_slot;

      return describePathMatch(match, slot);
    })
    .join(" or ");

  return {
    winner,
    runnerUp,
    thirdPlace: thirdPlace || null,
  };
}

export function thirdPlaceSlotIncludesGroup(slot: string, groupCode: string) {
  const match = slot.match(/^Group ([A-L/]+) third place$/);

  if (!match) {
    return false;
  }

  return match[1].split("/").includes(groupCode);
}

export function formatGoalDifference(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function findSlotPath(matches: WorldCupMatch[], slotName: string) {
  const match = matches.find(
    (candidate) => candidate.home_slot === slotName || candidate.away_slot === slotName,
  );

  return match ? describePathMatch(match, slotName) : null;
}

function describePathMatch(match: WorldCupMatch, slotName: string) {
  const opponent = match.home_slot === slotName ? match.away_slot : match.home_slot;

  return `Match #${match.match_number} vs ${opponent}`;
}
