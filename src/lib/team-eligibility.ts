export type TeamGroupMatch = {
  stage_id?: string;
  home_team_id: string | null;
  away_team_id: string | null;
  kickoff_at: string;
};

export type TeamEligibility = {
  available: boolean;
  firstKickoff: number | null;
  lockAt: number | null;
};

function getFirstGroupKickoff(teamId: string, matches: TeamGroupMatch[]) {
  const teamMatches = matches
    .filter(
      (match) =>
        (match.stage_id === undefined || match.stage_id === "group_stage") &&
        (match.home_team_id === teamId || match.away_team_id === teamId),
    )
    .toSorted(
      (first, second) =>
        new Date(first.kickoff_at).getTime() - new Date(second.kickoff_at).getTime(),
    );

  const firstGroupMatch = teamMatches[0] ?? null;

  return firstGroupMatch ? new Date(firstGroupMatch.kickoff_at).getTime() : null;
}

export function getTeamEligibility(
  teamIds: string[],
  matches: TeamGroupMatch[],
) {
  return new Map<string, TeamEligibility>(
    teamIds.map((teamId) => {
      const firstKickoff = getFirstGroupKickoff(teamId, matches);

      return [
        teamId,
        {
          // Late entries can pick any team; scoring starts from the entry
          // signup timestamp so already-started matches do not award points.
          available: true,
          firstKickoff,
          lockAt: null,
        },
      ];
    }),
  );
}

export function getLockedTeamIds(
  teamIds: string[],
  matches: TeamGroupMatch[],
) {
  const eligibility = getTeamEligibility(teamIds, matches);

  return teamIds.filter((teamId) => eligibility.get(teamId)?.available === false);
}
