import type { ResultPayload } from "@/lib/types";

type FinishMethod = ResultPayload["finishMethod"];
type NormalizedResult = Omit<ResultPayload, "adminSecret" | "matchId">;
type WinnerSide = "home" | "away" | "draw";

export type ResultMatchContext = {
  matchNumber: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
};

const finishMethods = new Set<FinishMethod>(["90", "extra_time", "penalties"]);
const winnerSides = new Set<WinnerSide>(["home", "away", "draw"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFinishMethod(payload: Record<string, unknown>): FinishMethod {
  const value = payload.finishMethod;

  if (typeof value === "string" && finishMethods.has(value as FinishMethod)) {
    return value as FinishMethod;
  }

  throw new Error("Result provider returned an invalid finishMethod.");
}

function readScore(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Result provider returned an invalid ${key}.`);
  }

  return value as number;
}

function readOptionalScore(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Result provider returned an invalid ${key}.`);
  }

  return value as number;
}

function readWinnerSide(payload: Record<string, unknown>) {
  const value = payload.winner;

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" && winnerSides.has(value as WinnerSide)) {
    return value as WinnerSide;
  }

  throw new Error("Result provider returned an invalid winner.");
}

function resolveWinnerTeamId(
  payload: Record<string, unknown>,
  winnerSide: WinnerSide | null,
  context: ResultMatchContext,
) {
  const explicitWinnerTeamId = payload.winnerTeamId;

  if (typeof explicitWinnerTeamId === "string" && explicitWinnerTeamId.length > 0) {
    const knownTeams = [context.homeTeamId, context.awayTeamId].filter(Boolean);

    if (knownTeams.length > 0 && !knownTeams.includes(explicitWinnerTeamId)) {
      throw new Error("Result provider winnerTeamId is not one of the match teams.");
    }

    return explicitWinnerTeamId;
  }

  if (explicitWinnerTeamId !== undefined && explicitWinnerTeamId !== null) {
    throw new Error("Result provider returned an invalid winnerTeamId.");
  }

  if (winnerSide === "home") {
    if (!context.homeTeamId) {
      throw new Error("Cannot resolve home winner before the match home team is assigned.");
    }

    return context.homeTeamId;
  }

  if (winnerSide === "away") {
    if (!context.awayTeamId) {
      throw new Error("Cannot resolve away winner before the match away team is assigned.");
    }

    return context.awayTeamId;
  }

  return null;
}

function getScoreWinnerSide(homeScore: number, awayScore: number): WinnerSide {
  if (homeScore > awayScore) {
    return "home";
  }

  if (awayScore > homeScore) {
    return "away";
  }

  return "draw";
}

export function normalizeResultPayload(
  rawPayload: unknown,
  context: ResultMatchContext,
): NormalizedResult {
  if (!isRecord(rawPayload)) {
    throw new Error("Result provider returned a non-object payload.");
  }

  const finishMethod = readFinishMethod(rawPayload);
  const homeGoals90 = readScore(rawPayload, "homeGoals90");
  const awayGoals90 = readScore(rawPayload, "awayGoals90");
  const homeGoalsTotal = readScore(rawPayload, "homeGoalsTotal");
  const awayGoalsTotal = readScore(rawPayload, "awayGoalsTotal");
  const homePenalties = readOptionalScore(rawPayload, "homePenalties");
  const awayPenalties = readOptionalScore(rawPayload, "awayPenalties");
  const providedWinnerSide = readWinnerSide(rawPayload);

  if (homeGoalsTotal < homeGoals90 || awayGoalsTotal < awayGoals90) {
    throw new Error("Result provider total goals cannot be lower than 90-minute goals.");
  }

  if (finishMethod === "90" && (homeGoals90 !== homeGoalsTotal || awayGoals90 !== awayGoalsTotal)) {
    throw new Error("90-minute results must have matching 90-minute and total goals.");
  }

  if (finishMethod === "penalties") {
    if (homeGoalsTotal !== awayGoalsTotal) {
      throw new Error("Penalty results must be tied before the shootout.");
    }

    if (homePenalties === null || awayPenalties === null || homePenalties === awayPenalties) {
      throw new Error("Penalty results must include a shootout winner.");
    }
  }

  if (finishMethod !== "penalties" && (homePenalties !== null || awayPenalties !== null)) {
    throw new Error("Penalty scores are only valid for penalty results.");
  }

  if (finishMethod === "extra_time" && homeGoalsTotal === awayGoalsTotal) {
    throw new Error("Extra-time results must have a winner.");
  }

  const scoreWinnerSide =
    finishMethod === "penalties" && homePenalties !== null && awayPenalties !== null
      ? getScoreWinnerSide(homePenalties, awayPenalties)
      : getScoreWinnerSide(homeGoalsTotal, awayGoalsTotal);
  const winnerSide = providedWinnerSide ?? scoreWinnerSide;

  if (providedWinnerSide && providedWinnerSide !== scoreWinnerSide) {
    throw new Error("Result provider winner conflicts with the score.");
  }

  const winnerTeamId = resolveWinnerTeamId(rawPayload, winnerSide, context);

  if (winnerSide === "draw" && winnerTeamId !== null) {
    throw new Error("Draw results cannot include a winnerTeamId.");
  }

  if (winnerSide !== "draw" && winnerTeamId === null && homeGoalsTotal !== awayGoalsTotal) {
    throw new Error("Non-draw results must identify the winning team.");
  }

  if (winnerTeamId === context.homeTeamId && homeGoalsTotal < awayGoalsTotal) {
    throw new Error("Home winner conflicts with the total score.");
  }

  if (winnerTeamId === context.awayTeamId && awayGoalsTotal < homeGoalsTotal) {
    throw new Error("Away winner conflicts with the total score.");
  }

  if (
    finishMethod === "penalties" &&
    winnerTeamId === context.homeTeamId &&
    homePenalties !== null &&
    awayPenalties !== null &&
    homePenalties < awayPenalties
  ) {
    throw new Error("Home winner conflicts with the penalty score.");
  }

  if (
    finishMethod === "penalties" &&
    winnerTeamId === context.awayTeamId &&
    homePenalties !== null &&
    awayPenalties !== null &&
    awayPenalties < homePenalties
  ) {
    throw new Error("Away winner conflicts with the penalty score.");
  }

  return {
    finishMethod,
    homeGoals90,
    awayGoals90,
    homeGoalsTotal,
    awayGoalsTotal,
    homePenalties,
    awayPenalties,
    winnerTeamId,
  };
}
