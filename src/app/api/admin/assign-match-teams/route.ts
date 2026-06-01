import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { optionalString, requireObject, requireString, ValidationError } from "@/lib/validation";

// Manual override so an operator can correct a knockout pairing (for example a
// best-third-place allocation) that automatic advancement could not resolve.
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  let matchId: string;
  let homeTeamId: string | null;
  let awayTeamId: string | null;

  try {
    const body = requireObject(await request.json());
    matchId = requireString(body.matchId, "Match id", { max: 64 });
    homeTeamId = optionalString(body.homeTeamId, "Home team", 64);
    awayTeamId = optionalString(body.awayTeamId, "Away team", 64);
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  if (!homeTeamId && !awayTeamId) {
    return jsonError("Provide at least one team to assign.", 400);
  }

  const match = await supabase
    .from("worldcup_matches")
    .select("id,tournament_id")
    .eq("id", matchId)
    .maybeSingle();

  if (match.error || !match.data) {
    return jsonError("Match was not found.", 404);
  }

  const teamIds = [homeTeamId, awayTeamId].filter((id): id is string => Boolean(id));
  const teams = await supabase.from("worldcup_teams").select("id").in("id", teamIds);

  if (teams.error) {
    return jsonError(teams.error.message, 500);
  }

  const knownIds = new Set((teams.data ?? []).map((team) => team.id));
  if (teamIds.some((id) => !knownIds.has(id))) {
    return jsonError("One or more teams are not valid.", 400);
  }

  const update: Record<string, string> = {};
  if (homeTeamId) {
    update.home_team_id = homeTeamId;
  }
  if (awayTeamId) {
    update.away_team_id = awayTeamId;
  }

  const result = await supabase.from("worldcup_matches").update(update).eq("id", matchId).select("id").single();

  if (result.error) {
    return jsonError(result.error.message, 500);
  }

  return NextResponse.json({ matchId: result.data.id });
}
