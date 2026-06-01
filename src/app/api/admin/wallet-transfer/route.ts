import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { normalizeMoneyAmount } from "@/lib/economy";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  optionalString,
  requirePositiveAmount,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

const TRANSFER_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  INSUFFICIENT_FUNDS: { status: 400, message: "Source account does not have enough funds." },
  SAME_ACCOUNT: { status: 400, message: "Choose two different accounts." },
  INVALID_AMOUNT: { status: 400, message: "Transfer amount must be higher than zero." },
};

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "admin", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  let fromUserId: string;
  let toUserId: string;
  let amount: number;
  let note: string | null;

  try {
    const body = requireObject(await request.json());
    fromUserId = requireString(body.fromUserId, "Source account", { max: 64 });
    toUserId = requireString(body.toUserId, "Destination account", { max: 64 });
    amount = normalizeMoneyAmount(requirePositiveAmount(body.amount, "Amount"));
    note = optionalString(body.note, "Note", 200);
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  if (fromUserId === toUserId) {
    return jsonError("Choose two different accounts.", 400);
  }

  if (amount <= 0) {
    return jsonError("Transfer amount must be higher than zero.", 400);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const profiles = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id")
    .in("user_id", [fromUserId, toUserId]);

  if (profiles.error) {
    return jsonError(profiles.error.message, 500);
  }

  if ((profiles.data ?? []).length !== 2) {
    return jsonError("Both accounts must exist before transfer.", 400);
  }

  const transfer = await supabase.rpc("worldcup_wallet_transfer", {
    p_tournament_id: tournament.data.id,
    p_from_user_id: fromUserId,
    p_to_user_id: toUserId,
    p_amount: amount,
    p_note: note,
    p_created_by: auth.via === "email" ? auth.adminEmail : "admin",
  });

  if (transfer.error) {
    const code = transfer.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = TRANSFER_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not save transfer.", 500);
  }

  return NextResponse.json({ transferId: transfer.data });
}
