import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { resolveAdminUserIdentity } from "@/lib/admin-user";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { normalizeWorldCupTicketPriceAmount } from "@/lib/worldcup-ticket-price";
import {
  requireEnum,
  requireInteger,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

const ASSIGN_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  ADMIN_ACCOUNT_REQUIRED: { status: 403, message: "Admin account profile was not found." },
  AGENT_NOT_FOUND: { status: 404, message: "Agent was not found." },
  INVALID_QUANTITY: { status: 400, message: "Quantity must be between 1 and 1000." },
  INVALID_PAYMENT_METHOD: { status: 400, message: "Payment method must be cash or USDT." },
  INSUFFICIENT_ADMIN_CODES: { status: 409, message: "Not enough tickets in admin inventory. Request tickets first." },
  INSUFFICIENT_CODES: { status: 409, message: "Not enough unassigned ticket codes left in the pool." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
};

const REQUEST_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  ADMIN_ACCOUNT_REQUIRED: { status: 403, message: "Admin account profile was not found." },
  INVALID_QUANTITY: { status: 400, message: "Quantity must be between 1 and 10000." },
  INSUFFICIENT_CODES: { status: 409, message: "Not enough generated tickets left in the pool." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
};

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

async function getTournament(supabase: ServiceClient) {
  return supabase
    .from("worldcup_tournaments")
    .select("id,ticket_price_amount,prize_pool_amount,fee_pool_amount")
    .eq("slug", "fifa-world-cup-2026")
    .single();
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
      .select("user_id,email,display_name,contact_name,whatsapp_number,paid_tickets,commission_tickets,active,created_at,activated_at")
      .eq("tournament_id", tournament.data.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("worldcup_ticket_codes")
      .select("agent_user_id,admin_user_id,status")
      .eq("tournament_id", tournament.data.id),
  ]);

  if (agents.error || codes.error) {
    return jsonError("Could not load agents.", 500);
  }

  const pool = { total: 0, available: 0, admin: 0, assigned: 0, redeemed: 0 };
  const perAgent = new Map<string, { available: number; redeemed: number }>();
  for (const entry of codes.data ?? []) {
    pool.total += 1;
    if (entry.status === "available") pool.available += 1;
    else if (entry.status === "admin") pool.admin += 1;
    else if (entry.status === "assigned") pool.assigned += 1;
    else if (entry.status === "redeemed") pool.redeemed += 1;

    const owner = entry.agent_user_id as string | null;
    if (!owner) continue;
    const stats = perAgent.get(owner) ?? { available: 0, redeemed: 0 };
    if (entry.status === "assigned") stats.available += 1;
    else if (entry.status === "redeemed") stats.redeemed += 1;
    perAgent.set(owner, stats);
  }

  const movements = await supabase
    .from("worldcup_ticket_financial_movements")
    .select(
      "id,movement_type,payment_method,source_admin_user_id,target_user_id,target_agent_user_id,quantity,ticket_price_amount,total_amount,note,metadata,created_by,created_at",
    )
    .eq("tournament_id", tournament.data.id)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (movements.error) {
    return jsonError("Could not load financial statement.", 500);
  }

  return NextResponse.json({
    pool,
    accounting: {
      ticketPriceAmount: normalizeWorldCupTicketPriceAmount(tournament.data.ticket_price_amount),
      prizePoolAmount: tournament.data.prize_pool_amount,
      feePoolAmount: tournament.data.fee_pool_amount ?? "0",
    },
    agents: (agents.data ?? []).map((agent) => ({
      userId: agent.user_id,
      email: agent.email,
      displayName: agent.display_name,
      contactName: agent.contact_name,
      whatsappNumber: agent.whatsapp_number,
      paidTickets: agent.paid_tickets,
      commissionTickets: agent.commission_tickets,
      availableCodes: perAgent.get(agent.user_id as string)?.available ?? 0,
      redeemedCodes: perAgent.get(agent.user_id as string)?.redeemed ?? 0,
      active: agent.active,
      activatedAt: agent.activated_at,
    })),
    financialMovements: (movements.data ?? []).map((movement) => ({
      id: movement.id,
      movementType: movement.movement_type,
      paymentMethod: movement.payment_method,
      sourceAdminUserId: movement.source_admin_user_id,
      targetUserId: movement.target_user_id,
      targetAgentUserId: movement.target_agent_user_id,
      quantity: movement.quantity,
      ticketPriceAmount: movement.ticket_price_amount,
      totalAmount: movement.total_amount,
      note: movement.note,
      metadata: movement.metadata,
      createdBy: movement.created_by,
      createdAt: movement.created_at,
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
  let action: "add" | "assign" | "request_inventory";
  try {
    body = requireObject(await request.json());
    action = requireEnum(body.action, "Action", ["add", "assign", "request_inventory"] as const);
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const tournament = await getTournament(supabase);
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const adminIdentity = await resolveAdminUserIdentity(supabase, auth.via === "email" ? auth.adminEmail : null);
  if (!adminIdentity) {
    return jsonError("Admin account profile was not found. Sign in once with the owner Google account.", 403);
  }

  const createdBy = auth.via === "email" ? auth.adminEmail : adminIdentity.email;

  if (action === "request_inventory") {
    let quantity: number;
    try {
      quantity = requireInteger(body.quantity, "Quantity", { min: 1, max: 10000 });
    } catch (error) {
      return jsonError(error instanceof ValidationError ? error.message : "Invalid request quantity.", 400);
    }

    const requestInventory = await supabase.rpc("worldcup_admin_request_ticket_inventory", {
      p_tournament_id: tournament.data.id,
      p_admin_user_id: adminIdentity.userId,
      p_quantity: quantity,
      p_created_by: createdBy,
    });

    if (requestInventory.error) {
      const errorCode = requestInventory.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
      const mapped = REQUEST_ERROR_MESSAGES[errorCode];
      if (mapped) {
        return jsonError(mapped.message, mapped.status);
      }
      return jsonError("Could not request admin tickets.", 500);
    }

    return NextResponse.json(requestInventory.data);
  }

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
          contact_name: profile.data.display_name,
          active: true,
          activated_at: new Date().toISOString(),
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
  let paymentMethod: "cash" | "usdt";
  try {
    agentUserId = requireString(body.agentUserId, "Agent account", { max: 64 });
    quantity = requireInteger(body.quantity, "Quantity", { min: 1, max: 1000 });
    paymentMethod = requireEnum(body.paymentMethod ?? "cash", "Payment method", ["cash", "usdt"] as const);
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid assignment.", 400);
  }
  const note = typeof body.note === "string" ? body.note.slice(0, 500) : "";

  const assign = await supabase.rpc("worldcup_admin_assign_agent_tickets", {
    p_tournament_id: tournament.data.id,
    p_admin_user_id: adminIdentity.userId,
    p_agent_user_id: agentUserId,
    p_quantity: quantity,
    p_payment_method: paymentMethod,
    p_created_by: createdBy,
    p_note: note,
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
