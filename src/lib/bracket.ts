import {
  calculateGroupStanding,
  compareGroupStanding,
  type GroupStanding,
} from "@/lib/schema-draw";
import type { WorldCupMatch, WorldCupTeam } from "@/lib/types";

// Resolves knockout-stage participants from completed results.
//
// Match feeder slots are seeded as human-readable text that fully encodes the
// FIFA 2026 progression rules:
//   - "Group A winners"            -> winner of group A
//   - "Group A runners-up"         -> runner-up of group A
//   - "Group A/B/C/D/F third place"-> a best-third-placed team, restricted to
//                                      the candidate groups in the slot
//   - "Winner Match 74"            -> winner of match 74
//   - "Loser Match 101"            -> loser of match 101
//
// The best-third-place allocation is the genuinely hard part of the 48-team
// format. Each third-place slot already carries the official candidate groups,
// so once the eight best thirds are known we solve a bipartite matching of
// {qualifying group -> slot whose candidate set contains it}. Group
// winner/runner-up and match winner/loser slots are fully deterministic.

export type SlotDescriptor =
  | { kind: "group_winner"; group: string }
  | { kind: "group_runner_up"; group: string }
  | { kind: "group_third"; groups: string[] }
  | { kind: "match_winner"; matchNumber: number }
  | { kind: "match_loser"; matchNumber: number }
  | { kind: "unknown" };

export type MatchTeamAssignment = {
  matchId: string;
  homeTeamId?: string;
  awayTeamId?: string;
};

export function parseSlot(slot: string): SlotDescriptor {
  const winner = slot.match(/^Group ([A-L]) winners$/);
  if (winner) {
    return { kind: "group_winner", group: winner[1] };
  }

  const runnerUp = slot.match(/^Group ([A-L]) runners-up$/);
  if (runnerUp) {
    return { kind: "group_runner_up", group: runnerUp[1] };
  }

  const third = slot.match(/^Group ([A-L/]+) third place$/);
  if (third) {
    return { kind: "group_third", groups: third[1].split("/").filter(Boolean) };
  }

  const matchWinner = slot.match(/^Winner Match (\d+)$/);
  if (matchWinner) {
    return { kind: "match_winner", matchNumber: Number(matchWinner[1]) };
  }

  const matchLoser = slot.match(/^Loser Match (\d+)$/);
  if (matchLoser) {
    return { kind: "match_loser", matchNumber: Number(matchLoser[1]) };
  }

  return { kind: "unknown" };
}

function groupCodesOf(teams: WorldCupTeam[]): string[] {
  return [...new Set(teams.map((team) => team.group_code).filter((code): code is string => Boolean(code)))].sort();
}

function groupStageMatchesOf(matches: WorldCupMatch[]): WorldCupMatch[] {
  return matches.filter((match) => match.stage_id === "group_stage");
}

export function isGroupComplete(groupCode: string, matches: WorldCupMatch[]): boolean {
  const groupMatches = groupStageMatchesOf(matches).filter((match) => match.group_code === groupCode);

  return groupMatches.length > 0 && groupMatches.every((match) => match.status === "completed");
}

export function isGroupStageComplete(teams: WorldCupTeam[], matches: WorldCupMatch[]): boolean {
  const groups = groupCodesOf(teams);

  return groups.length > 0 && groups.every((group) => isGroupComplete(group, matches));
}

function standingsForGroup(
  groupCode: string,
  teams: WorldCupTeam[],
  groupMatches: WorldCupMatch[],
): GroupStanding[] {
  return teams
    .filter((team) => team.group_code === groupCode)
    .map((team) => calculateGroupStanding(team, groupMatches))
    .toSorted(compareGroupStanding);
}

export function rankThirdPlacedTeams(
  teams: WorldCupTeam[],
  matches: WorldCupMatch[],
): Array<{ group: string; standing: GroupStanding }> {
  const groupMatches = groupStageMatchesOf(matches);

  return groupCodesOf(teams)
    .map((group) => ({ group, standing: standingsForGroup(group, teams, groupMatches)[2] }))
    .filter((entry): entry is { group: string; standing: GroupStanding } => Boolean(entry.standing))
    .toSorted((first, second) => compareGroupStanding(first.standing, second.standing));
}

type ThirdPlaceSlot = { key: string; groups: string[] };

/**
 * Assigns each qualifying third-placed group to exactly one slot whose
 * candidate set contains it (a perfect bipartite matching). Returns null if no
 * valid assignment exists (which would indicate inconsistent seed data).
 */
export function matchThirdPlaceSlots(
  slots: ThirdPlaceSlot[],
  qualifyingGroups: string[],
): Map<string, string> | null {
  // Assign the most constrained slots first to prune the search quickly.
  const orderedSlots = [...slots].toSorted((a, b) => a.groups.length - b.groups.length);
  const assignment = new Map<string, string>();
  const usedGroups = new Set<string>();

  function backtrack(index: number): boolean {
    if (index === orderedSlots.length) {
      return true;
    }

    const slot = orderedSlots[index];

    for (const group of slot.groups) {
      if (usedGroups.has(group) || !qualifyingGroups.includes(group)) {
        continue;
      }

      assignment.set(slot.key, group);
      usedGroups.add(group);

      if (backtrack(index + 1)) {
        return true;
      }

      assignment.delete(slot.key);
      usedGroups.delete(group);
    }

    return false;
  }

  return backtrack(0) ? assignment : null;
}

function loserOf(match: WorldCupMatch): string | null {
  if (match.status !== "completed" || !match.winner_team_id) {
    return null;
  }

  if (match.home_team_id && match.home_team_id !== match.winner_team_id) {
    return match.home_team_id;
  }

  if (match.away_team_id && match.away_team_id !== match.winner_team_id) {
    return match.away_team_id;
  }

  return null;
}

/**
 * Computes team assignments for every knockout match whose feeders are now
 * resolvable but whose team slots are still empty. Safe to call repeatedly:
 * it never overwrites an already-assigned side, so each round fills in as its
 * feeder results arrive.
 */
export function computeBracketAssignments(
  teams: WorldCupTeam[],
  matches: WorldCupMatch[],
): MatchTeamAssignment[] {
  const groupMatches = groupStageMatchesOf(matches);
  const matchByNumber = new Map(matches.map((match) => [match.match_number, match]));

  const groupStanding = new Map<string, GroupStanding[]>();
  function standings(groupCode: string): GroupStanding[] {
    if (!groupStanding.has(groupCode)) {
      groupStanding.set(groupCode, standingsForGroup(groupCode, teams, groupMatches));
    }

    return groupStanding.get(groupCode) ?? [];
  }

  // Resolve the third-place allocation up front when the whole group stage is
  // finished; the result is shared by every third-place slot.
  let thirdPlaceByGroup: Map<string, string> | null = null;
  const knockoutMatches = matches.filter((match) => match.stage_id !== "group_stage");
  const thirdSlots: ThirdPlaceSlot[] = [];

  for (const match of knockoutMatches) {
    for (const [side, slot] of [
      ["home", match.home_slot] as const,
      ["away", match.away_slot] as const,
    ]) {
      const descriptor = parseSlot(slot);

      if (descriptor.kind === "group_third") {
        thirdSlots.push({ key: `${match.id}:${side}`, groups: descriptor.groups });
      }
    }
  }

  if (thirdSlots.length > 0 && isGroupStageComplete(teams, matches)) {
    const ranked = rankThirdPlacedTeams(teams, matches);
    const qualifying = ranked.slice(0, thirdSlots.length).map((entry) => entry.group);
    const slotToGroup = matchThirdPlaceSlots(thirdSlots, qualifying);

    if (slotToGroup) {
      thirdPlaceByGroup = slotToGroup;
    }
  }

  function resolveSlot(slotKey: string, slot: string): string | null {
    const descriptor = parseSlot(slot);

    switch (descriptor.kind) {
      case "group_winner":
        return isGroupComplete(descriptor.group, matches)
          ? standings(descriptor.group)[0]?.team.id ?? null
          : null;
      case "group_runner_up":
        return isGroupComplete(descriptor.group, matches)
          ? standings(descriptor.group)[1]?.team.id ?? null
          : null;
      case "group_third": {
        const group = thirdPlaceByGroup?.get(slotKey);
        return group ? standings(group)[2]?.team.id ?? null : null;
      }
      case "match_winner": {
        const feeder = matchByNumber.get(descriptor.matchNumber);
        return feeder?.status === "completed" ? feeder.winner_team_id ?? null : null;
      }
      case "match_loser": {
        const feeder = matchByNumber.get(descriptor.matchNumber);
        return feeder ? loserOf(feeder) : null;
      }
      default:
        return null;
    }
  }

  const assignments: MatchTeamAssignment[] = [];

  for (const match of knockoutMatches) {
    const update: MatchTeamAssignment = { matchId: match.id };

    if (!match.home_team_id) {
      const resolved = resolveSlot(`${match.id}:home`, match.home_slot);
      if (resolved) {
        update.homeTeamId = resolved;
      }
    }

    if (!match.away_team_id) {
      const resolved = resolveSlot(`${match.id}:away`, match.away_slot);
      if (resolved) {
        update.awayTeamId = resolved;
      }
    }

    if (update.homeTeamId || update.awayTeamId) {
      assignments.push(update);
    }
  }

  return assignments;
}
