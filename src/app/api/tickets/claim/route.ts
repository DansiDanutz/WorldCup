import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

const CLAIM_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  INVALID_CODE: { status: 404, message: "That code is not valid." },
  ALREADY_CLAIMED: { status: 409, message: "That code has already been used." },
  CODE_NOT_ACTIVE: { status: 409, message: "That code is not active yet." },
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "ticket-claim", { limit: 10, windowMs: 60_000 });
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

  let code: string;
  try {
    const body = requireObject(await request.json());
    code = requireString(body.code, "Ticket code", { min: 4, max: 32 });
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request.", 400);
  }

  const redeem = await supabase.rpc("worldcup_redeem_ticket_code", {
    p_code: code,
    p_user_id: user.id,
  });

  if (redeem.error) {
    const errorCode = redeem.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = CLAIM_ERROR_MESSAGES[errorCode];
    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }
    return jsonError("Could not redeem that code.", 500);
  }

  return NextResponse.json({ ticketId: redeem.data });
}
