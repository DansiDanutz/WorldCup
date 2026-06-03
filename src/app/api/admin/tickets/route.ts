import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { getResponsiblePlayRestriction, loadResponsiblePlayStatus } from "@/lib/responsible-play";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  requireEnum,
  requireInteger,
  requireNonNegativeAmount,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

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
      ticketPriceAmount = requireNonNegativeAmount(body.ticketPriceAmount, "Ticket price");
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

    return NextResponse.json({ ticketPriceAmount: updateResult.data.ticket_price_amount });
  }

  let userId: string;
  let quantity: number;

  try {
    userId = requireString(body.userId, "Target account", { max: 64 });
    quantity = requireInteger(body.quantity, "Ticket quantity", { min: 1, max: 100 });
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid ticket assignment.", 400);
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

  const rows = Array.from({ length: quantity }, () => ({
    tournament_id: tournament.data.id,
    user_id: userId,
    price_amount: tournament.data.ticket_price_amount,
    assigned_by: auth.via === "email" ? auth.adminEmail : "admin",
  }));
  const insertResult = await supabase.from("worldcup_tickets").insert(rows).select("id");

  if (insertResult.error) {
    return jsonError("Could not assign tickets.", 500);
  }

  return NextResponse.json({
    assignedTickets: insertResult.data?.length ?? quantity,
    ticketPriceAmount: tournament.data.ticket_price_amount,
  });
}
