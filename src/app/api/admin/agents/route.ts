import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  requireEnum,
  requireInteger,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

const ASSIGN_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  AGENT_NOT_FOUND: { status: 404, message: "Agent was not found." },
  INVALID_QUANTITY: { status: 400, message: "Quantity must be between 1 and 1000." },
  INSUFFICIENT_CODES: { status: 409, message: "Not enough unassigned ticket codes left in the pool." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
};

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

async function getTournament(supabase: ServiceClient) {
  return supabase.from("worldcup_tournaments").select("id").eq("slug", "fifa-world-cup-2026").single();
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);
  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const tournament = await getTournament(supabase);
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const [agents, codes] = await Promise.all([
    supabase
      .from("worldcup_agents")
      .select("user_id,email,display_name,paid_tickets,commission_tickets,active,created_at")
      .eq("tournament_id", tournament.data.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("worldcup_ticket_codes")
      .select("agent_user_id,status")
      .eq("tournament_id", tournament.data.id),
  ]);

  if (agents.error || codes.error) {
    return jsonError("Could not load agents.", 500);
  }

  const pool = { total: 0, available: 0, assigned: 0, redeemed: 0 };
  const perAgent = new Map<string, { available: number; redeemed: number }>();
  for (const entry of codes.data ?? []) {
    pool.total += 1;
    if (entry.status === "available") pool.available += 1;
    else if (entry.status === "assigned") pool.assigned += 1;
    else if (entry.status === "redeemed") pool.redeemed += 1;

    const owner = entry.agent_user_id as string | null;
    if (!owner) continue;
    const stats = perAgent.get(owner) ?? { available: 0, redeemed: 0 };
    if (entry.status === "assigned") stats.available += 1;
    else if (entry.status === "redeemed") stats.redeemed += 1;
    perAgent.set(owner, stats);
  }

  return NextResponse.json({
    pool,
    agents: (agents.data ?? []).map((agent) => ({
      userId: agent.user_id,
      email: agent.email,
      displayName: agent.display_name,
      paidTickets: agent.paid_tickets,
      commissionTickets: agent.commission_tickets,
      availableCodes: perAgent.get(agent.user_id as string)?.available ?? 0,
      redeemedCodes: perAgent.get(agent.user_id as string)?.redeemed ?? 0,
      active: agent.active,
    })),
  });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);
  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  let body: Record<string, unknown>;
  let action: "add" | "assign";
  try {
    body = requireObject(await request.json());
    action = requireEnum(body.action, "Action", ["add", "assign"] as const);
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const tournament = await getTournament(supabase);
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const createdBy = auth.via === "email" ? auth.adminEmail : "admin";

  if (action === "add") {
    let email: string;
    try {
      email = requireString(body.email, "Agent email", { max: 200 }).toLowerCase().trim();
    } catch (error) {
      return jsonError(error instanceof ValidationError ? error.message : "Invalid email.", 400);
    }

    const profile = await supabase
      .from("worldcup_referral_profiles")
      .select("user_id,display_name,email")
      .eq("email", email)
      .maybeSingle();
    if (profile.error) {
      return jsonError("Could not look up that account.", 500);
    }
    if (!profile.data) {
      return jsonError("No account with that email has signed in yet.", 404);
    }

    const upsert = await supabase
      .from("worldcup_agents")
      .upsert(
        {
          tournament_id: tournament.data.id,
          user_id: profile.data.user_id,
          email: profile.data.email ?? email,
          display_name: profile.data.display_name,
          active: true,
          created_by: createdBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tournament_id,user_id" },
      )
      .select("user_id")
      .single();
    if (upsert.error || !upsert.data) {
      return jsonError(upsert.error?.message ?? "Could not save agent.", 500);
    }

    return NextResponse.json({ ok: true, userId: upsert.data.user_id });
  }

  let agentUserId: string;
  let quantity: number;
  try {
    agentUserId = requireString(body.agentUserId, "Agent account", { max: 64 });
    quantity = requireInteger(body.quantity, "Quantity", { min: 1, max: 1000 });
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid assignment.", 400);
  }

  const assign = await supabase.rpc("worldcup_agent_assign_codes", {
    p_agent_user_id: agentUserId,
    p_tournament_id: tournament.data.id,
    p_quantity: quantity,
    p_created_by: createdBy,
  });

  if (assign.error) {
    const errorCode = assign.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = ASSIGN_ERROR_MESSAGES[errorCode];
    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }
    return jsonError("Could not assign codes.", 500);
  }

  return NextResponse.json(assign.data);
}
