import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { resolveAdminUserIdentity } from "@/lib/admin-user";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { getResponsiblePlayRestriction, loadResponsiblePlayStatus } from "@/lib/responsible-play";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  requireEnum,
  requireInteger,
  requirePositiveAmount,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";
import { normalizeWorldCupTicketPriceAmount } from "@/lib/worldcup-ticket-price";

const TICKET_ASSIGN_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  ADMIN_ACCOUNT_REQUIRED: { status: 403, message: "Admin account profile was not found." },
  INVALID_PAYMENT_METHOD: { status: 400, message: "Payment method must be cash or USDT." },
  INVALID_QUANTITY: { status: 400, message: "Ticket quantity must be between 1 and 1000." },
  INSUFFICIENT_ADMIN_CODES: { status: 409, message: "Not enough tickets in admin inventory. Request tickets first." },
  RECIPIENT_NOT_FOUND: { status: 404, message: "Account was not found." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
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

  let body: Record<string, unknown>;
  let action: "assign" | "set_price";

  try {
    body = requireObject(await request.json());
    action = requireEnum(body.action, "Action", ["assign", "set_price"] as const);
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,ticket_price_amount")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  if (action === "set_price") {
    let ticketPriceAmount: number;

    try {
      ticketPriceAmount = requirePositiveAmount(body.ticketPriceAmount, "Ticket price");
    } catch (error) {
      return jsonError(error instanceof ValidationError ? error.message : "Invalid ticket price.", 400);
    }

    const updateResult = await supabase
      .from("worldcup_tournaments")
      .update({ ticket_price_amount: ticketPriceAmount, updated_at: new Date().toISOString() })
      .eq("id", tournament.data.id)
      .select("ticket_price_amount")
      .single();

    if (updateResult.error || !updateResult.data) {
      return jsonError(updateResult.error?.message ?? "Could not save ticket price.", 500);
    }

    return NextResponse.json({
      ticketPriceAmount: normalizeWorldCupTicketPriceAmount(updateResult.data.ticket_price_amount),
    });
  }

  let userId: string;
  let quantity: number;
  let paymentMethod: "cash" | "usdt";

  try {
    userId = requireString(body.userId, "Target account", { max: 64 });
    quantity = requireInteger(body.quantity, "Ticket quantity", { min: 1, max: 100 });
    paymentMethod = requireEnum(body.paymentMethod ?? "cash", "Payment method", ["cash", "usdt"] as const);
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid ticket assignment.", 400);
  }
  const note = typeof body.note === "string" ? body.note.slice(0, 500) : "";

  const adminIdentity = await resolveAdminUserIdentity(supabase, auth.via === "email" ? auth.adminEmail : null);
  if (!adminIdentity) {
    return jsonError("Admin account profile was not found. Sign in once with the owner Google account.", 403);
  }

  const profile = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile.error || !profile.data) {
    return jsonError("Account was not found.", 404);
  }

  const responsiblePlay = await loadResponsiblePlayStatus(supabase, userId, {
    tournamentId: tournament.data.id,
  });
  if ("error" in responsiblePlay) {
    return jsonError(responsiblePlay.error, 500);
  }

  const responsiblePlayRestriction = getResponsiblePlayRestriction(responsiblePlay.status, "ticket", {
    requestedTickets: quantity,
  });
  if (responsiblePlayRestriction) {
    return jsonError(`Responsible play blocks this assignment. ${responsiblePlayRestriction}`, 403);
  }

  const assignResult = await supabase.rpc("worldcup_admin_assign_user_ticket", {
    p_tournament_id: tournament.data.id,
    p_admin_user_id: adminIdentity.userId,
    p_to_user_id: userId,
    p_quantity: quantity,
    p_payment_method: paymentMethod,
    p_created_by: auth.via === "email" ? auth.adminEmail : adminIdentity.email,
    p_note: note,
  });

  if (assignResult.error) {
    const errorCode = assignResult.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = TICKET_ASSIGN_ERROR_MESSAGES[errorCode];
    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }
    return jsonError("Could not assign tickets.", 500);
  }

  return NextResponse.json(assignResult.data);
}
