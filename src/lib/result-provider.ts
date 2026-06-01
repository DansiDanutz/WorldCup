import type { ResultPayload } from "@/lib/types";

type ProviderResult =
  | { status: "not_found" }
  | {
      status: "completed";
      result: Omit<ResultPayload, "adminSecret" | "matchId">;
    };

export async function fetchExternalResult(matchNumber: number): Promise<ProviderResult> {
  const resultApiUrl = process.env.RESULT_API_URL;

  if (!resultApiUrl) {
    return { status: "not_found" };
  }

  const url = new URL(resultApiUrl);
  url.searchParams.set("match_number", String(matchNumber));

  const response = await fetch(url, {
    headers: process.env.RESULT_API_KEY
      ? { Authorization: `Bearer ${process.env.RESULT_API_KEY}` }
      : undefined,
    cache: "no-store",
  });

  if (response.status === 404) {
    return { status: "not_found" };
  }

  if (!response.ok) {
    throw new Error(`Result API failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    finishMethod: "90" | "extra_time" | "penalties";
    homeGoals90: number;
    awayGoals90: number;
    homeGoalsTotal: number;
    awayGoalsTotal: number;
    homePenalties?: number | null;
    awayPenalties?: number | null;
    winnerTeamId?: string | null;
  };

  return {
    status: "completed",
    result: payload,
  };
}

