import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { advanceBracket } from "@/lib/bracket-advance";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "admin", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  try {
    const result = await advanceBracket(supabase);

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not advance bracket.", 500);
  }
}
