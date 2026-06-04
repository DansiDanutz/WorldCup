import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider, getOrCreateReferralProfile } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "agent", { limit: 30, windowMs: 60_000 });
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

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const agent = await supabase
    .from("worldcup_agents")
    .select("paid_tickets,commission_tickets,active,contact_name,whatsapp_number,created_at,updated_at")
    .eq("tournament_id", tournament.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (agent.error) {
    return jsonError("Could not load agent status.", 500);
  }
  if (!agent.data) {
    return NextResponse.json({ isAgent: false, applicationStatus: "none" });
  }
  if (!agent.data.active) {
    return NextResponse.json({
      isAgent: false,
      applicationStatus: "pending",
      contactName: agent.data.contact_name as string | null,
      whatsappNumber: agent.data.whatsapp_number as string | null,
      registeredAt: agent.data.created_at as string,
      updatedAt: agent.data.updated_at as string,
    });
  }

  const codes = await supabase
    .from("worldcup_ticket_codes")
    .select("code,status,kind")
    .eq("tournament_id", tournament.data.id)
    .eq("agent_user_id", user.id)
    .order("assigned_at", { ascending: true });
  if (codes.error) {
    return jsonError("Could not load your ticket codes.", 500);
  }

  await supabase
    .from("worldcup_agent_ticket_requests")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("tournament_id", tournament.data.id)
    .eq("agent_user_id", user.id)
    .eq("status", "pending")
    .lte("expires_at", new Date().toISOString());

  const requests = await supabase
    .from("worldcup_agent_ticket_requests")
    .select("id,requester_email,requester_display_name,status,requested_at,expires_at,accepted_at,ticket_id")
    .eq("tournament_id", tournament.data.id)
    .eq("agent_user_id", user.id)
    .order("requested_at", { ascending: false })
    .limit(20);

  if (requests.error) {
    return jsonError("Could not load Agent Call requests.", 500);
  }

  const all = codes.data ?? [];
  const available = all.filter((entry) => entry.status === "assigned");
  const redeemed = all.filter((entry) => entry.status === "redeemed").length;
  const paid = agent.data.paid_tickets as number;

  return NextResponse.json({
    isAgent: true,
    applicationStatus: "active",
    contactName: agent.data.contact_name as string | null,
    whatsappNumber: agent.data.whatsapp_number as string | null,
    paidTickets: paid,
    commissionTickets: agent.data.commission_tickets as number,
    totalCodes: all.length,
    availableCount: available.length,
    redeemedCount: redeemed,
    progressInCycle: paid % 10,
    availableCodes: available.map((entry) => ({ code: entry.code as string, kind: entry.kind as string })),
    ticketRequests: (requests.data ?? []).map((request) => ({
      id: request.id as string,
      requesterEmail: request.requester_email as string | null,
      requesterDisplayName: request.requester_display_name as string,
      status: request.status as string,
      requestedAt: request.requested_at as string,
      expiresAt: request.expires_at as string,
      acceptedAt: request.accepted_at as string | null,
      ticketId: request.ticket_id as string | null,
    })),
  });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "agent-register", { limit: 10, windowMs: 60_000 });
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

  let contactName: string;
  let whatsappNumber: string;
  try {
    const body = requireObject(await request.json());
    contactName = requireString(body.name, "Agent name", { min: 2, max: 120 });
    whatsappNumber = requireString(body.whatsapp, "WhatsApp number", { min: 6, max: 40 });
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const profile = await getOrCreateReferralProfile(supabase, user);
  const existing = await supabase
    .from("worldcup_agents")
    .select("active")
    .eq("tournament_id", tournament.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing.error) {
    return jsonError("Could not load agent registration.", 500);
  }

  const agentPayload = {
    email: profile.email ?? user.email ?? null,
    display_name: profile.display_name,
    contact_name: contactName,
    whatsapp_number: whatsappNumber,
    updated_at: new Date().toISOString(),
  };

  const upsert = existing.data
    ? await supabase
        .from("worldcup_agents")
        .update(agentPayload)
        .eq("tournament_id", tournament.data.id)
        .eq("user_id", user.id)
        .select("active,contact_name,whatsapp_number,created_at,updated_at")
        .single()
    : await supabase
        .from("worldcup_agents")
        .insert({
          tournament_id: tournament.data.id,
          user_id: user.id,
          ...agentPayload,
          active: false,
          created_by: "self-registered",
        })
        .select("active,contact_name,whatsapp_number,created_at,updated_at")
        .single();

  if (upsert.error || !upsert.data) {
    return jsonError("Could not save agent registration.", 500);
  }

  return NextResponse.json({
    isAgent: Boolean(upsert.data.active),
    applicationStatus: upsert.data.active ? "active" : "pending",
    contactName: upsert.data.contact_name as string | null,
    whatsappNumber: upsert.data.whatsapp_number as string | null,
    registeredAt: upsert.data.created_at as string,
    updatedAt: upsert.data.updated_at as string,
  });
}
