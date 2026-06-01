import { NextResponse } from "next/server";

import { requireEnv } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase";

async function runApplyCron(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${requireEnv("CRON_SECRET")}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const result = await supabase.rpc("worldcup_apply_completed_match_points");

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ awardedRows: result.data ?? 0 });
}

export async function GET(request: Request) {
  return runApplyCron(request);
}

export async function POST(request: Request) {
  return runApplyCron(request);
}
