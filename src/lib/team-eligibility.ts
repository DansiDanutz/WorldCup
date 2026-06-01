export type TeamGroupMatch = {
  stage_id?: string;
  home_team_id: string | null;
  away_team_id: string | null;
  kickoff_at: string;
};

export type TeamEligibility = {
  available: boolean;
  secondKickoff: number | null;
};

function getSecondGroupKickoff(teamId: string, matches: TeamGroupMatch[]) {
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

  const secondGroupMatch = teamMatches[1] ?? null;

  return secondGroupMatch ? new Date(secondGroupMatch.kickoff_at).getTime() : null;
}

export function getTeamEligibility(
  teamIds: string[],
  matches: TeamGroupMatch[],
  now = Date.now(),
) {
  return new Map<string, TeamEligibility>(
    teamIds.map((teamId) => {
      const secondKickoff = getSecondGroupKickoff(teamId, matches);

      return [
        teamId,
        {
          available: secondKickoff === null || now < secondKickoff,
          secondKickoff,
        },
      ];
    }),
  );
}

export function getLockedTeamIds(
  teamIds: string[],
  matches: TeamGroupMatch[],
  now = Date.now(),
) {
  const eligibility = getTeamEligibility(teamIds, matches, now);

  return teamIds.filter((teamId) => eligibility.get(teamId)?.available === false);
}
