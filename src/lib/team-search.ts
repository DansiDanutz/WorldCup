import type { WorldCupTeam } from "@/lib/types";

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function searchRank(team: WorldCupTeam, normalizedQuery: string) {
  const teamName = team.name.toLowerCase();
  const groupCode = team.group_code?.toLowerCase() ?? "";
  const groupLabel = groupCode ? `group ${groupCode}` : "";
  const confederation = team.confederation.toLowerCase();

  if (teamName.startsWith(normalizedQuery)) {
    return 0;
  }

  if (teamName.includes(normalizedQuery)) {
    return 1;
  }

  if (groupLabel && (groupLabel.includes(normalizedQuery) || normalizedQuery === groupCode)) {
    return 2;
  }

  if (
    normalizedQuery.length >= 3 &&
    (confederation.startsWith(normalizedQuery) || normalizedQuery === confederation)
  ) {
    return 3;
  }

  return null;
}

export function filterAndSortTeamsBySearch(teams: WorldCupTeam[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return teams;
  }

  return teams
    .map((team) => ({ rank: searchRank(team, normalizedQuery), team }))
    .filter((entry): entry is { rank: number; team: WorldCupTeam } => entry.rank !== null)
    .sort((first, second) => {
      if (first.rank !== second.rank) {
        return first.rank - second.rank;
      }

      return first.team.name.localeCompare(second.team.name);
    })
    .map((entry) => entry.team);
}
