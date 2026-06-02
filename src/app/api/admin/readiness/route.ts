import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { buildProductionReadinessReport } from "@/lib/production-readiness";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const report = await buildProductionReadinessReport(supabase);

  return NextResponse.json(report);
}
