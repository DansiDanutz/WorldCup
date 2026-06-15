import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { runResultsSweep } from "@/lib/run-results";
import { createServiceSupabaseClient } from "@/lib/supabase";

// Manual trigger for the same sweep the daily cron runs: fetch live results,
// apply points, advance the bracket. Admin-authed so it never needs CRON_SECRET
// in the browser.
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  try {
    const summary = await runResultsSweep();
    const applied = summary.processed.filter(
      (entry) => entry.action === "fetched_result_and_applied" || entry.action === "applied_existing_result",
    ).length;
    const errors = summary.processed.filter((entry) => entry.action === "error").length;
    return NextResponse.json({ ...summary, applied, errors, checked: summary.processed.length });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Result sweep failed.", 500);
  }
}
