import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider, getOrCreateReferralProfile } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

const AGENT_TRANSFER_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  SAME_ACCOUNT: { status: 400, message: "Choose a different user account." },
  RECIPIENT_NOT_FOUND: { status: 404, message: "No signed-in account was found for that email." },
  AGENT_NOT_FOUND: { status: 403, message: "Your agent account is not active." },
  AGENT_PROFILE_NOT_FOUND: { status: 500, message: "Could not load your agent referral profile." },
  AGENT_NO_TICKETS: { status: 409, message: "You do not have available agent tickets to transfer." },
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "agent-ticket-transfer", {
    limit: 12,
    windowMs: 60_000,
  });
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

  let recipientEmail: string;
  let confirm: boolean;
  try {
    const body = requireObject(await request.json());
    recipientEmail = requireString(body.email, "User email", { min: 5, max: 200 }).toLowerCase().trim();
    confirm = body.confirm === true;
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipientEmail)) {
    return jsonError("Enter a valid email address.", 400);
  }

  const agentProfile = await getOrCreateReferralProfile(supabase, user);
  if ((agentProfile.email ?? "").toLowerCase() === recipientEmail) {
    return jsonError("Choose a different user account.", 400);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const recipient = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id,display_name,email")
    .eq("email", recipientEmail)
    .maybeSingle();
  if (recipient.error) {
    return jsonError("Could not verify that email.", 500);
  }
  if (!recipient.data) {
    return jsonError("No signed-in account was found for that email.", 404);
  }
  if (recipient.data.user_id === user.id) {
    return jsonError("Choose a different user account.", 400);
  }

  const recipientPayload = {
    userId: recipient.data.user_id as string,
    displayName: recipient.data.display_name as string | null,
    email: recipient.data.email as string | null,
  };

  if (!confirm) {
    return NextResponse.json({
      recipient: recipientPayload,
      requiresConfirmation: true,
    });
  }

  const transfer = await supabase.rpc("worldcup_agent_transfer_ticket", {
    p_tournament_id: tournament.data.id,
    p_agent_user_id: user.id,
    p_to_user_id: recipient.data.user_id,
  });

  if (transfer.error) {
    const code = transfer.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = AGENT_TRANSFER_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not transfer agent ticket.", 500);
  }

  const transferPayload =
    transfer.data && typeof transfer.data === "object" && !Array.isArray(transfer.data)
      ? transfer.data
      : {};

  return NextResponse.json({
    ...transferPayload,
    recipient: recipientPayload,
  });
}
