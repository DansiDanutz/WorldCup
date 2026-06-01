import { NextResponse } from "next/server";

import { requireEnv } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { AdminTicketAssignPayload, AdminTicketPricePayload } from "@/lib/types";

type TicketPayload = Partial<AdminTicketAssignPayload & AdminTicketPricePayload> & {
  action?: "assign" | "set_price";
};

export async function POST(request: Request) {
  const payload = (await request.json()) as TicketPayload;

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

  if (payload.action === "set_price") {
    const ticketPriceAmount = Number(payload.ticketPriceAmount);

    if (!Number.isFinite(ticketPriceAmount) || ticketPriceAmount < 0) {
      return NextResponse.json({ error: "Ticket price must be zero or higher." }, { status: 400 });
    }

    const updateResult = await supabase
      .from("worldcup_tournaments")
      .update({ ticket_price_amount: ticketPriceAmount, updated_at: new Date().toISOString() })
      .eq("id", tournament.data.id)
      .select("ticket_price_amount")
      .single();

    if (updateResult.error || !updateResult.data) {
      return NextResponse.json(
        { error: updateResult.error?.message ?? "Could not save ticket price." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ticketPriceAmount: updateResult.data.ticket_price_amount });
  }

  if (payload.action === "assign") {
    const quantity = Number(payload.quantity);

    if (!payload.userId) {
      return NextResponse.json({ error: "Target account is required." }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
      return NextResponse.json({ error: "Ticket quantity must be between 1 and 100." }, { status: 400 });
    }

    const profile = await supabase
      .from("worldcup_referral_profiles")
      .select("user_id")
      .eq("user_id", payload.userId)
      .maybeSingle();

    if (profile.error || !profile.data) {
      return NextResponse.json({ error: "Account was not found." }, { status: 404 });
    }

    const rows = Array.from({ length: quantity }, () => ({
      tournament_id: tournament.data.id,
      user_id: payload.userId,
      price_amount: tournament.data.ticket_price_amount,
    }));
    const insertResult = await supabase.from("worldcup_tickets").insert(rows).select("id");

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      assignedTickets: insertResult.data?.length ?? quantity,
      ticketPriceAmount: tournament.data.ticket_price_amount,
    });
  }

  return NextResponse.json({ error: "Unsupported ticket action." }, { status: 400 });
}
