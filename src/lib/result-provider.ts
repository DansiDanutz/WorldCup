import type { ResultPayload } from "@/lib/types";
import { normalizeResultPayload, type ResultMatchContext } from "@/lib/result-validation";

type ProviderResult =
  | { status: "not_found" }
  | {
      status: "completed";
      result: Omit<ResultPayload, "adminSecret" | "matchId">;
    };

export async function fetchExternalResult(context: ResultMatchContext): Promise<ProviderResult> {
  const resultApiUrl = process.env.RESULT_API_URL;

  if (!resultApiUrl) {
    return { status: "not_found" };
  }

  const url = new URL(resultApiUrl);
  url.searchParams.set("match_number", String(context.matchNumber));

  // Bound the upstream call so a hanging provider cannot stall the cron run.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: process.env.RESULT_API_KEY
        ? { Authorization: `Bearer ${process.env.RESULT_API_KEY}` }
        : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Result API timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    return { status: "not_found" };
  }

  if (!response.ok) {
    throw new Error(`Result API failed with ${response.status}`);
  }

  return {
    status: "completed",
    result: normalizeResultPayload(await response.json(), context),
  };
}
