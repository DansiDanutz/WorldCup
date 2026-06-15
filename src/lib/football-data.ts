// football-data.org results source for the WorldCup26 game.
//
// The hourly results cron (`/api/cron/results`) calls fetchExternalResult() per
// due match. When FOOTBALL_DATA_API_KEY is set we resolve that match against the
// live FIFA World Cup feed from https://www.football-data.org (v4). The full
// competition match list is fetched once and cached briefly, so a whole cron
// batch costs a single upstream request (free tier is rate-limited).
//
// We never invent results: only FINISHED matches return a result; anything else
// is treated as "not available yet" so the cron leaves the match untouched.

import { normalizeResultPayload, type ResultMatchContext } from "@/lib/result-validation";
import type { ResultPayload } from "@/lib/types";

type NormalizedResult = Omit<ResultPayload, "adminSecret" | "matchId">;

type FdTeam = { id?: number | null; name?: string | null; shortName?: string | null; tla?: string | null };
type FdScoreLine = { home?: number | null; away?: number | null } | null | undefined;
type FdMatch = {
  id?: number;
  status?: string;
  utcDate?: string;
  homeTeam?: FdTeam;
  awayTeam?: FdTeam;
  score?: {
    winner?: string | null;
    duration?: string | null;
    fullTime?: FdScoreLine;
    regularTime?: FdScoreLine;
    penalties?: FdScoreLine;
  };
};

const FD_BASE = "https://api.football-data.org/v4";
const CACHE_TTL_MS = 120_000;

// app team id -> extra normalized names the feed may use (only the ones whose
// feed name differs from the app id). Everything else matches on the id itself.
const TEAM_ALIASES: Record<string, string[]> = {
  united_states: ["unitedstates", "usa", "unitedstatesofamerica"],
  congo_dr: ["drcongo", "congodr", "democraticrepublicofcongo"],
  ir_iran: ["iran", "iriran"],
  korea_republic: ["southkorea", "korearepublic", "republicofkorea"],
  turkiye: ["turkiye", "turkey"],
  czechia: ["czechia", "czechrepublic"],
  cote_divoire: ["cotedivoire", "ivorycoast"],
  cabo_verde: ["caboverde", "capeverde"],
  bosnia_herzegovina: ["bosniaandherzegovina", "bosniaherzegovina"],
  saudi_arabia: ["saudiarabia"],
  south_africa: ["southafrica"],
  new_zealand: ["newzealand"],
};

function norm(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function teamCandidates(appTeamId: string): string[] {
  return [norm(appTeamId), ...(TEAM_ALIASES[appTeamId] ?? [])];
}

function teamMatches(appTeamId: string | null, fdTeam: FdTeam | undefined): boolean {
  if (!appTeamId || !fdTeam) return false;
  const names = new Set([norm(fdTeam.name), norm(fdTeam.shortName)]);
  return teamCandidates(appTeamId).some((candidate) => candidate.length > 0 && names.has(candidate));
}

let cache: { at: number; matches: FdMatch[] } | null = null;

async function loadCompetitionMatches(apiKey: string): Promise<FdMatch[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.matches;
  }

  const competition = process.env.FOOTBALL_DATA_COMPETITION || "WC";
  const url = `${FD_BASE}/competitions/${encodeURIComponent(competition)}/matches`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("football-data.org timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`football-data.org failed with ${response.status}`);
  }

  const body = (await response.json()) as { matches?: FdMatch[] };
  const matches = Array.isArray(body.matches) ? body.matches : [];
  cache = { at: Date.now(), matches };
  return matches;
}

function buildPayload(fd: FdMatch, swapped: boolean) {
  const score = fd.score ?? {};
  const duration = (score.duration ?? "REGULAR").toUpperCase();
  const finishMethod =
    duration === "PENALTY_SHOOTOUT" ? "penalties" : duration === "EXTRA_TIME" ? "extra_time" : "90";

  const full = score.fullTime ?? {};
  const reg = score.regularTime ?? null;
  const pens = score.penalties ?? null;

  // Orient everything to the app's home/away (swap if the feed lists them reversed).
  const pick = (line: FdScoreLine, side: "home" | "away") => {
    const home = Number(line?.home ?? 0);
    const away = Number(line?.away ?? 0);
    const want = swapped ? (side === "home" ? "away" : "home") : side;
    return want === "home" ? home : away;
  };

  const homeGoalsTotal = pick(full, "home");
  const awayGoalsTotal = pick(full, "away");
  // The feed's regularTime is the 90' score when present; for group matches
  // (always finishMethod "90") it equals fullTime.
  const homeGoals90 = reg ? pick(reg, "home") : finishMethod === "90" ? homeGoalsTotal : homeGoalsTotal;
  const awayGoals90 = reg ? pick(reg, "away") : finishMethod === "90" ? awayGoalsTotal : awayGoalsTotal;
  const homePenalties = finishMethod === "penalties" && pens ? pick(pens, "home") : null;
  const awayPenalties = finishMethod === "penalties" && pens ? pick(pens, "away") : null;

  let winner: "home" | "away" | "draw";
  if (finishMethod === "penalties") {
    winner = (homePenalties ?? 0) >= (awayPenalties ?? 0) ? "home" : "away";
  } else if (homeGoalsTotal > awayGoalsTotal) {
    winner = "home";
  } else if (homeGoalsTotal < awayGoalsTotal) {
    winner = "away";
  } else {
    winner = "draw";
  }

  return {
    finishMethod,
    homeGoals90,
    awayGoals90,
    homeGoalsTotal,
    awayGoalsTotal,
    homePenalties,
    awayPenalties,
    winner,
  };
}

/**
 * Resolve a single app match against the live football-data.org feed.
 * Returns the normalized result for a FINISHED match, or null if the match has
 * not finished / cannot be matched to a feed fixture.
 */
export async function resolveFootballDataResult(
  apiKey: string,
  context: ResultMatchContext,
): Promise<NormalizedResult | null> {
  const matches = await loadCompetitionMatches(apiKey);

  for (const fd of matches) {
    if ((fd.status ?? "").toUpperCase() !== "FINISHED") {
      continue;
    }

    const sameOrder =
      teamMatches(context.homeTeamId, fd.homeTeam) && teamMatches(context.awayTeamId, fd.awayTeam);
    const swapped =
      !sameOrder &&
      teamMatches(context.homeTeamId, fd.awayTeam) &&
      teamMatches(context.awayTeamId, fd.homeTeam);

    if (!sameOrder && !swapped) {
      continue;
    }

    return normalizeResultPayload(buildPayload(fd, swapped), context);
  }

  return null;
}

export function hasFootballDataKey(): boolean {
  return Boolean(process.env.FOOTBALL_DATA_API_KEY);
}
