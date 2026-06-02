import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";

const SETTLE_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  TOURNAMENT_NOT_FOUND: { status: 404, message: "Tournament is not available." },
  TOURNAMENT_NOT_COMPLETED: { status: 409, message: "Settle payouts only after the tournament is completed." },
  PRIZE_POOL_NOT_SET: { status: 400, message: "Set the prize pool before settling payouts." },
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin-settle", { limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const settle = await supabase.rpc("worldcup_settle_payouts", { p_tournament_id: tournament.data.id });

  if (settle.error) {
    const code = settle.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = SETTLE_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not settle payouts.", 500);
  }

  // Report the resulting payout ledger for the operator to audit.
  const payouts = await supabase
    .from("worldcup_payouts")
    .select("payout_type,rank,user_id,amount")
    .eq("tournament_id", tournament.data.id)
    .order("rank", { ascending: true });

  return NextResponse.json({
    created: settle.data ?? 0,
    payouts: payouts.data ?? [],
  });
}
