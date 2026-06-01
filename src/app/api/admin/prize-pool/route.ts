import { NextResponse } from "next/server";

import { isValidAdminSecret } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { AdminPrizePoolPayload } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as AdminPrizePoolPayload;

  if (!isValidAdminSecret(payload.adminSecret)) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const grossAmount = Number(payload.prizePoolAmount);

  if (!Number.isFinite(grossAmount) || grossAmount < 0) {
    return NextResponse.json({ error: "Prize pool amount must be zero or higher." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
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
    return NextResponse.json(
      { error: updateResult.error?.message ?? "Could not save prize pool." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    prizePoolAmount: updateResult.data.prize_pool_amount,
    prizePoolFeePercent: updateResult.data.prize_pool_fee_percent,
  });
}
