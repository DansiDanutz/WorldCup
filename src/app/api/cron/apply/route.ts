import { NextResponse } from "next/server";

import { advanceBracket } from "@/lib/bracket-advance";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { requireEnv } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase";

async function runApplyCron(request: Request) {
  requireEnv("CRON_SECRET");
  const authorization = request.headers.get("authorization");

  if (!authorization || !isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const result = await supabase.rpc("worldcup_apply_completed_match_points");

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  let bracketAdvanced = 0;
  try {
    bracketAdvanced = (await advanceBracket(supabase)).assigned;
  } catch {
    // Non-fatal; advancement retries on the next run.
  }

  return NextResponse.json({ awardedRows: result.data ?? 0, bracketAdvanced });
}

export async function GET(request: Request) {
  return runApplyCron(request);
}

export async function POST(request: Request) {
  return runApplyCron(request);
}
