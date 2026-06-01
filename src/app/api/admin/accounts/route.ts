import { NextResponse } from "next/server";

import { calculateWalletBalance } from "@/lib/economy";
import { requireEnv } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { AdminReferralReportPayload } from "@/lib/types";

type WalletTransaction = {
  from_user_id: string | null;
  to_user_id: string | null;
  amount: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as AdminReferralReportPayload;

  if (payload.adminSecret !== requireEnv("ADMIN_RESULT_SECRET")) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,ticket_price_amount")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  const [profiles, transactions, tickets] = await Promise.all([
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id,display_name,email,referral_code")
      .order("display_name", { ascending: true }),
    supabase
      .from("worldcup_wallet_transactions")
      .select("from_user_id,to_user_id,amount")
      .eq("tournament_id", tournament.data.id),
    supabase
      .from("worldcup_tickets")
      .select("user_id,consumed_at")
      .eq("tournament_id", tournament.data.id),
  ]);

  for (const result of [profiles, transactions, tickets]) {
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
  }

  const walletTransactions = (transactions.data ?? []) as WalletTransaction[];

  return NextResponse.json({
    ticketPriceAmount: tournament.data.ticket_price_amount,
    accounts: (profiles.data ?? []).map((profile) => {
      const userTickets = (tickets.data ?? []).filter((ticket) => ticket.user_id === profile.user_id);

      return {
        userId: profile.user_id,
        displayName: profile.display_name ?? "WorldCup player",
        email: profile.email ?? null,
        referralCode: profile.referral_code,
        walletBalance: calculateWalletBalance(profile.user_id, walletTransactions).toFixed(2),
        ticketsAssigned: userTickets.length,
        ticketsAvailable: userTickets.filter((ticket) => !ticket.consumed_at).length,
      };
    }),
  });
}
