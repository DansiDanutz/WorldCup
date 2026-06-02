import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireNonNegativeAmount, requireObject, ValidationError } from "@/lib/validation";

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

  let grossAmount: number;

  try {
    const body = requireObject(await request.json());
    grossAmount = requireNonNegativeAmount(body.prizePoolAmount, "Prize pool amount");
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const updateResult = await supabase
    .from("worldcup_tournaments")
    .update({
      prize_pool_amount: grossAmount,
      prize_pool_fee_percent: 20,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", "fifa-world-cup-2026")
    .select("prize_pool_amount,prize_pool_fee_percent")
    .single();

  if (updateResult.error || !updateResult.data) {
    return jsonError(updateResult.error?.message ?? "Could not save prize pool.", 500);
  }

  return NextResponse.json({
    prizePoolAmount: updateResult.data.prize_pool_amount,
    prizePoolFeePercent: updateResult.data.prize_pool_fee_percent,
  });
}
