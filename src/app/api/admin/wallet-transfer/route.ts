import { NextResponse } from "next/server";

import { calculateWalletBalance, normalizeMoneyAmount } from "@/lib/economy";
import { requireEnv } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { AdminWalletTransferPayload } from "@/lib/types";

type WalletTransaction = {
  from_user_id: string | null;
  to_user_id: string | null;
  amount: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as AdminWalletTransferPayload;

  if (payload.adminSecret !== requireEnv("ADMIN_RESULT_SECRET")) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const amount = normalizeMoneyAmount(payload.amount);

  if (!payload.fromUserId || !payload.toUserId) {
    return NextResponse.json({ error: "Both source and destination accounts are required." }, { status: 400 });
  }

  if (payload.fromUserId === payload.toUserId) {
    return NextResponse.json({ error: "Choose two different accounts." }, { status: 400 });
  }

  if (amount <= 0) {
    return NextResponse.json({ error: "Transfer amount must be higher than zero." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  const [profiles, transactions] = await Promise.all([
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id")
      .in("user_id", [payload.fromUserId, payload.toUserId]),
    supabase
      .from("worldcup_wallet_transactions")
      .select("from_user_id,to_user_id,amount")
      .eq("tournament_id", tournament.data.id),
  ]);

  if (profiles.error || transactions.error) {
    return NextResponse.json(
      { error: profiles.error?.message ?? transactions.error?.message ?? "Could not verify accounts." },
      { status: 500 },
    );
  }

  if ((profiles.data ?? []).length !== 2) {
    return NextResponse.json({ error: "Both accounts must exist before transfer." }, { status: 400 });
  }

  const fromBalance = calculateWalletBalance(
    payload.fromUserId,
    (transactions.data ?? []) as WalletTransaction[],
  );

  if (fromBalance < amount) {
    return NextResponse.json({ error: "Source account does not have enough funds." }, { status: 400 });
  }

  const insertResult = await supabase
    .from("worldcup_wallet_transactions")
    .insert({
      tournament_id: tournament.data.id,
      from_user_id: payload.fromUserId,
      to_user_id: payload.toUserId,
      amount,
      transaction_type: "transfer",
      note: payload.note?.trim() || null,
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    return NextResponse.json(
      { error: insertResult.error?.message ?? "Could not save transfer." },
      { status: 500 },
    );
  }

  return NextResponse.json({ transferId: insertResult.data.id });
}
