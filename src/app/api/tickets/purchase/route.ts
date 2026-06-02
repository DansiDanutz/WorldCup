import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

const PURCHASE_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  INSUFFICIENT_FUNDS: { status: 402, message: "Not enough wallet balance. Deposit USDT first." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "ticket-purchase", { limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Sign in with Google first.", 401);
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return jsonError("Invalid session.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const purchase = await supabase.rpc("worldcup_purchase_ticket", {
    p_user_id: user.id,
    p_tournament_id: tournament.data.id,
  });

  if (purchase.error) {
    const code = purchase.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = PURCHASE_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not purchase ticket.", 500);
  }

  return NextResponse.json({ ticketId: purchase.data });
}
