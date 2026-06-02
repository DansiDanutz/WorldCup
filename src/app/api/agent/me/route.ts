import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "agent", { limit: 30, windowMs: 60_000 });
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

  const agent = await supabase
    .from("worldcup_agents")
    .select("paid_tickets,commission_tickets,active")
    .eq("tournament_id", tournament.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (agent.error) {
    return jsonError("Could not load agent status.", 500);
  }
  if (!agent.data || !agent.data.active) {
    return NextResponse.json({ isAgent: false });
  }

  const codes = await supabase
    .from("worldcup_ticket_codes")
    .select("code,status,kind")
    .eq("tournament_id", tournament.data.id)
    .eq("agent_user_id", user.id)
    .order("assigned_at", { ascending: true });
  if (codes.error) {
    return jsonError("Could not load your ticket codes.", 500);
  }

  const all = codes.data ?? [];
  const available = all.filter((entry) => entry.status === "assigned");
  const redeemed = all.filter((entry) => entry.status === "redeemed").length;
  const paid = agent.data.paid_tickets as number;

  return NextResponse.json({
    isAgent: true,
    paidTickets: paid,
    commissionTickets: agent.data.commission_tickets as number,
    totalCodes: all.length,
    availableCount: available.length,
    redeemedCount: redeemed,
    progressInCycle: paid % 10,
    availableCodes: available.map((entry) => ({ code: entry.code as string, kind: entry.kind as string })),
  });
}
