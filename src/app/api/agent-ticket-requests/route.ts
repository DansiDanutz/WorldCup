import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider, getOrCreateReferralProfile } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

type AgentTicketRequestRow = {
  id: string;
  requester_user_id: string;
  requester_email: string | null;
  requester_display_name: string;
  agent_user_id: string;
  agent_email: string | null;
  agent_display_name: string | null;
  status: string;
  requested_at: string;
  expires_at: string;
  accepted_at: string | null;
  ticket_id: string | null;
};

function formatAgentTicketRequest(row: AgentTicketRequestRow) {
  return {
    id: row.id,
    requesterUserId: row.requester_user_id,
    requesterEmail: row.requester_email,
    requesterDisplayName: row.requester_display_name,
    agentUserId: row.agent_user_id,
    agentEmail: row.agent_email,
    agentDisplayName: row.agent_display_name,
    status: row.status,
    requestedAt: row.requested_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    ticketId: row.ticket_id,
  };
}

async function getSignedInGoogleUser(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: jsonError("Sign in with Google first.", 401) } as const;
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);
  if (userResult.error || !userResult.data.user) {
    return { error: jsonError("Invalid session.", 401) } as const;
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return { error: jsonError("Only Google sign-in is allowed.", 403) } as const;
  }

  return { supabase, user } as const;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "agent-ticket-requests", {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInGoogleUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  const tournament = await auth.supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const requests = await auth.supabase
    .from("worldcup_agent_ticket_requests")
    .select("id,requester_user_id,requester_email,requester_display_name,agent_user_id,agent_email,agent_display_name,status,requested_at,expires_at,accepted_at,ticket_id")
    .eq("tournament_id", tournament.data.id)
    .eq("requester_user_id", auth.user.id)
    .order("requested_at", { ascending: false })
    .limit(10);

  if (requests.error) {
    return jsonError("Could not load Agent Call requests.", 500);
  }

  return NextResponse.json({
    requests: ((requests.data ?? []) as AgentTicketRequestRow[]).map(formatAgentTicketRequest),
  });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "agent-ticket-request-create", {
    limit: 8,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInGoogleUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  let agentId: string;
  let requesterDisplayName: string;
  try {
    const body = requireObject(await request.json());
    agentId = requireString(body.agentId, "Agent code", { min: 3, max: 12 });
    requesterDisplayName = requireString(body.displayName, "Display name", { min: 2, max: 80 });
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const tournament = await auth.supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const requesterProfile = await getOrCreateReferralProfile(auth.supabase, auth.user);
  const normalizedAgentCode = agentId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalizedAgentCode !== agentId.trim().toUpperCase()) {
    return jsonError("Use the agent referral code.", 400);
  }

  const agentByCode = normalizedAgentCode
    ? await auth.supabase
        .from("worldcup_referral_profiles")
        .select("user_id,display_name,email,referral_code")
        .eq("referral_code", normalizedAgentCode)
        .maybeSingle()
    : { data: null, error: null };

  if (agentByCode.error) {
    return jsonError("Could not resolve agent.", 500);
  }

  const agentProfile = agentByCode.data;

  if (!agentProfile) {
    return jsonError("Agent was not found. Use the agent referral code.", 404);
  }

  if (agentProfile.user_id === auth.user.id) {
    return jsonError("You cannot request a ticket from yourself.", 400);
  }

  const activeAgent = await auth.supabase
    .from("worldcup_agents")
    .select("user_id,active")
    .eq("tournament_id", tournament.data.id)
    .eq("user_id", agentProfile.user_id)
    .eq("active", true)
    .maybeSingle();
  if (activeAgent.error) {
    return jsonError("Could not verify agent.", 500);
  }
  if (!activeAgent.data) {
    return jsonError("That account is not an active agent.", 404);
  }

  await auth.supabase
    .from("worldcup_agent_ticket_requests")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("tournament_id", tournament.data.id)
    .eq("requester_user_id", auth.user.id)
    .eq("status", "pending")
    .lte("expires_at", new Date().toISOString());

  const existing = await auth.supabase
    .from("worldcup_agent_ticket_requests")
    .select("id,status,expires_at")
    .eq("tournament_id", tournament.data.id)
    .eq("requester_user_id", auth.user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing.error) {
    return jsonError("Could not check existing requests.", 500);
  }
  if (existing.data) {
    return jsonError("You already have a pending Agent Call request. Wait for the agent or try again after it expires.", 409);
  }

  const created = await auth.supabase
    .from("worldcup_agent_ticket_requests")
    .insert({
      tournament_id: tournament.data.id,
      requester_user_id: auth.user.id,
      requester_email: auth.user.email ?? requesterProfile.email,
      requester_display_name: requesterDisplayName,
      agent_user_id: agentProfile.user_id,
      agent_email: agentProfile.email,
      agent_display_name: agentProfile.display_name,
    })
    .select("id,requester_user_id,requester_email,requester_display_name,agent_user_id,agent_email,agent_display_name,status,requested_at,expires_at,accepted_at,ticket_id")
    .single();

  if (created.error || !created.data) {
    return jsonError("Could not create Agent Call request.", 500);
  }

  return NextResponse.json({ request: formatAgentTicketRequest(created.data as AgentTicketRequestRow) });
}
