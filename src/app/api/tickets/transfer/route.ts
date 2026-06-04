import { NextResponse } from "next/server";

import { enforceGeoEligibility, enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getPolicyGeoEnv, loadOperatorPolicy } from "@/lib/operator-policy";
import { getUserPaidActionGate, isPaidActionLaunchTestAdmin } from "@/lib/paid-action-gates";
import { getAuthProvider, getOrCreateReferralProfile } from "@/lib/referrals";
import { getResponsiblePlayRestriction, loadResponsiblePlayStatus } from "@/lib/responsible-play";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

const TRANSFER_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  SAME_ACCOUNT: { status: 400, message: "Choose a different account." },
  RECIPIENT_NOT_FOUND: { status: 404, message: "No signed-in account was found for that email." },
  SENDER_NOT_FOUND: { status: 500, message: "Could not load your referral profile." },
  NO_AVAILABLE_TICKET: { status: 409, message: "You do not have an available ticket to transfer." },
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "ticket-transfer", { limit: 10, windowMs: 60_000 });
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
    recipientEmail = requireString(body.email, "Friend email", { min: 5, max: 200 }).toLowerCase().trim();
    confirm = body.confirm === true;
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipientEmail)) {
    return jsonError("Enter a valid email address.", 400);
  }

  const senderProfile = await getOrCreateReferralProfile(supabase, user);
  if ((senderProfile.email ?? "").toLowerCase() === recipientEmail) {
    return jsonError("Choose a different account.", 400);
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

  if (!confirm) {
    return NextResponse.json({
      recipient: {
        userId: recipient.data.user_id as string,
        displayName: recipient.data.display_name as string | null,
        email: recipient.data.email as string | null,
      },
      requiresConfirmation: true,
    });
  }

  const operatorPolicy = await loadOperatorPolicy(supabase);
  if (!isPaidActionLaunchTestAdmin(user.email)) {
    const geoRestricted = enforceGeoEligibility(request, getPolicyGeoEnv(operatorPolicy));
    if (geoRestricted) {
      return geoRestricted;
    }
  }

  const paidActionGate = await getUserPaidActionGate(supabase, "ticket", { userEmail: user.email });
  if (!paidActionGate.allowed) {
    return jsonError(paidActionGate.message ?? "Ticket transfers are paused until launch approvals are complete.", 403);
  }

  const responsiblePlay = await loadResponsiblePlayStatus(supabase, user.id, {
    tournamentId: tournament.data.id,
  });
  if ("error" in responsiblePlay) {
    return jsonError(responsiblePlay.error, 500);
  }

  const responsiblePlayRestriction = getResponsiblePlayRestriction(responsiblePlay.status, "ticket");
  if (responsiblePlayRestriction) {
    return jsonError(responsiblePlayRestriction, 403);
  }

  const transfer = await supabase.rpc("worldcup_transfer_ticket", {
    p_tournament_id: tournament.data.id,
    p_from_user_id: user.id,
    p_to_user_id: recipient.data.user_id,
  });

  if (transfer.error) {
    const code = transfer.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = TRANSFER_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not transfer ticket.", 500);
  }

  return NextResponse.json({
    ticketId: transfer.data,
    recipient: {
      userId: recipient.data.user_id as string,
      displayName: recipient.data.display_name as string | null,
      email: recipient.data.email as string | null,
    },
  });
}
