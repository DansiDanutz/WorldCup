import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

const ACCEPT_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  REQUEST_NOT_FOUND: { status: 404, message: "Agent Call request was not found." },
  REQUEST_NOT_FOR_AGENT: { status: 403, message: "This Agent Call request is not assigned to you." },
  REQUEST_NOT_PENDING: { status: 409, message: "This Agent Call request is no longer pending." },
  REQUEST_EXPIRED: { status: 409, message: "This Agent Call request expired after 24 hours." },
  AGENT_NOT_FOUND: { status: 403, message: "Your agent account is not active." },
  AGENT_NO_TICKETS: {
    status: 409,
    message: "You do not have available agent tickets. The request stays pending until it expires.",
  },
};

export async function POST(
  request: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const limited = await enforceRateLimit(request, "agent-ticket-request-accept", {
    limit: 20,
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

  const { requestId } = await context.params;
  const accepted = await supabase.rpc("worldcup_accept_agent_ticket_request", {
    p_request_id: requestId,
    p_agent_user_id: user.id,
  });

  if (accepted.error) {
    const code = accepted.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = ACCEPT_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not accept Agent Call request.", 500);
  }

  return NextResponse.json(accepted.data);
}
