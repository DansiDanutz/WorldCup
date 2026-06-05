import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { calculateWalletBalance } from "@/lib/economy";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { normalizeWorldCupTicketPriceAmount } from "@/lib/worldcup-ticket-price";

type WalletTransaction = {
  from_user_id: string | null;
  to_user_id: string | null;
  amount: string;
};

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

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,ticket_price_amount")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const [profiles, transactions, tickets] = await Promise.all([
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id,display_name,email,referral_code,usdt_sender_wallet_address,usdt_sender_wallet_network,usdt_sender_wallet_updated_at,usdt_sender_wallet_trc20_address,usdt_sender_wallet_trc20_updated_at,usdt_sender_wallet_erc20_address,usdt_sender_wallet_erc20_updated_at")
      .order("display_name", { ascending: true }),
    supabase
      .from("worldcup_wallet_transactions")
      .select("from_user_id,to_user_id,amount")
      .eq("tournament_id", tournament.data.id),
    supabase.from("worldcup_tickets").select("user_id,consumed_at").eq("tournament_id", tournament.data.id),
  ]);

  for (const result of [profiles, transactions, tickets]) {
    if (result.error) {
      return jsonError("Could not load accounts.", 500);
    }
  }

  const walletTransactions = (transactions.data ?? []) as WalletTransaction[];
  const userIds = (profiles.data ?? []).map((profile) => profile.user_id).filter(Boolean);
  const agents = userIds.length > 0
    ? await supabase
        .from("worldcup_agents")
        .select("user_id")
        .eq("tournament_id", tournament.data.id)
        .in("user_id", userIds)
        .eq("active", true)
    : { data: [], error: null };

  if (agents.error) {
    return jsonError("Could not load account agent statuses.", 500);
  }

  const agentUserIds = new Set((agents.data ?? []).map((agent) => agent.user_id));

  return NextResponse.json({
    ticketPriceAmount: normalizeWorldCupTicketPriceAmount(tournament.data.ticket_price_amount),
    accounts: (profiles.data ?? []).map((profile) => {
      const userTickets = (tickets.data ?? []).filter((ticket) => ticket.user_id === profile.user_id);

      return {
        userId: profile.user_id,
        displayName: profile.display_name ?? "WorldCup player",
        email: profile.email ?? null,
        referralCode: profile.referral_code,
        accountRole: agentUserIds.has(profile.user_id) ? "agent" : "user",
        usdtSenderWalletAddress: profile.usdt_sender_wallet_address ?? null,
        usdtSenderWalletNetwork: profile.usdt_sender_wallet_network ?? null,
        usdtSenderWalletUpdatedAt: profile.usdt_sender_wallet_updated_at ?? null,
        usdtSenderWalletTrc20Address: profile.usdt_sender_wallet_trc20_address ?? null,
        usdtSenderWalletTrc20UpdatedAt: profile.usdt_sender_wallet_trc20_updated_at ?? null,
        usdtSenderWalletErc20Address: profile.usdt_sender_wallet_erc20_address ?? null,
        usdtSenderWalletErc20UpdatedAt: profile.usdt_sender_wallet_erc20_updated_at ?? null,
        walletBalance: calculateWalletBalance(profile.user_id, walletTransactions).toFixed(8),
        ticketsAssigned: userTickets.length,
        ticketsAvailable: userTickets.filter((ticket) => !ticket.consumed_at).length,
      };
    }),
  });
}
