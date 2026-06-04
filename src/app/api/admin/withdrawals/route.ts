import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { isAgeVerified, loadAgeVerification } from "@/lib/age-verification";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  optionalString,
  requireEnum,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";
import { normalizeWithdrawalTxHash } from "@/lib/withdrawals";

type WithdrawalAction = "list" | "approve" | "reject" | "mark_paid";

type WithdrawalRequestRow = {
  id: string;
  tournament_id: string;
  user_id: string;
  user_email: string | null;
  display_name: string | null;
  network: string;
  address: string;
  amount: string;
  currency: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  external_tx_hash: string | null;
  wallet_transaction_id: string | null;
  raw: Record<string, unknown> | null;
};

const WITHDRAWAL_SELECT =
  "id,tournament_id,user_id,user_email,display_name,network,address,amount,currency,status,admin_note,created_at,reviewed_at,reviewed_by,paid_at,paid_by,external_tx_hash,wallet_transaction_id,raw";

const WITHDRAWAL_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  INSUFFICIENT_FUNDS: { status: 402, message: "Account does not have enough wallet balance." },
  INVALID_AMOUNT: { status: 400, message: "Withdrawal amount must be higher than zero." },
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

  let action: WithdrawalAction;
  let withdrawalId: string | null = null;
  let adminNote: string | null = null;
  let externalTxHash: string | null = null;
  let launchEvidence = false;

  try {
    const body = requireObject(await request.json());
    action = requireEnum(body.action, "Action", ["list", "approve", "reject", "mark_paid"] as const);

    if (action !== "list") {
      withdrawalId = requireString(body.withdrawalId, "Withdrawal request", { max: 80 });
      adminNote = optionalString(body.adminNote, "Admin note", 300);
    }

    if (action === "mark_paid") {
      externalTxHash = optionalString(body.externalTxHash, "External transaction hash", 120);
      launchEvidence = body.launchEvidence === true;
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const actor = auth.via === "email" ? auth.adminEmail : "admin";

  if (action === "list") {
    return listWithdrawals(supabase);
  }

  if (!withdrawalId) {
    return jsonError("Withdrawal request is required.", 400);
  }

  if (action === "approve") {
    return approveWithdrawal(supabase, withdrawalId, adminNote, actor);
  }

  if (action === "reject") {
    return rejectWithdrawal(supabase, withdrawalId, adminNote, actor);
  }

  return markWithdrawalPaid(supabase, withdrawalId, adminNote, externalTxHash, actor, launchEvidence);
}

async function listWithdrawals(supabase: any) {
  const withdrawals = await supabase
    .from("worldcup_withdrawal_requests")
    .select(WITHDRAWAL_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);

  if (withdrawals.error) {
    return jsonError("Could not load withdrawal requests.", 500);
  }

  return NextResponse.json({ withdrawals: (withdrawals.data ?? []).map(formatWithdrawal) });
}

async function approveWithdrawal(
  supabase: any,
  withdrawalId: string,
  adminNote: string | null,
  actor: string,
) {
  if (!adminNote) {
    return jsonError("Admin note is required before approving a withdrawal request.", 400);
  }

  const reserved = await supabase
    .from("worldcup_withdrawal_requests")
    .update({
      status: "approved",
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
      reviewed_by: actor,
    })
    .eq("id", withdrawalId)
    .eq("status", "submitted")
    .select(WITHDRAWAL_SELECT)
    .maybeSingle();

  if (reserved.error) {
    return jsonError("Could not reserve withdrawal request for approval.", 500);
  }

  if (!reserved.data) {
    return stateConflictResponse(supabase, withdrawalId, "approve");
  }

  const row = reserved.data as WithdrawalRequestRow;

  // Backstop: never debit/approve a payout for an account that is not
  // age-verified (18+), even if the request predates verification. Release the
  // reservation so the request stays actionable after the player verifies.
  const ageVerification = await loadAgeVerification(supabase, row.user_id);
  if ("error" in ageVerification) {
    await releaseApprovedWithdrawal(supabase, withdrawalId, adminNote, actor);
    return jsonError("Could not confirm the account's age verification status.", 500);
  }
  if (!isAgeVerified(ageVerification.verification.status)) {
    await releaseApprovedWithdrawal(supabase, withdrawalId, adminNote, actor);
    return jsonError(
      "This account is not age-verified (18+). Confirm the player in Age verification before approving the payout.",
      403,
    );
  }

  const note = `Withdrawal approved for ${row.network.toUpperCase()} ${row.address}. ${adminNote}`;
  const record = await supabase.rpc("worldcup_record_withdrawal", {
    p_withdrawal_request_id: row.id,
    p_tournament_id: row.tournament_id,
    p_user_id: row.user_id,
    p_amount: row.amount,
    p_note: note,
    p_created_by: actor,
  });

  if (record.error) {
    await releaseApprovedWithdrawal(supabase, withdrawalId, adminNote, actor);
    const code = record.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = WITHDRAWAL_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    return jsonError("Could not record withdrawal wallet debit.", 500);
  }

  const finalized = await supabase
    .from("worldcup_withdrawal_requests")
    .update({ wallet_transaction_id: record.data })
    .eq("id", withdrawalId)
    .eq("status", "approved")
    .select(WITHDRAWAL_SELECT)
    .single();

  if (finalized.error || !finalized.data) {
    return jsonError("Withdrawal was approved, but the request could not be linked to its wallet transaction.", 500);
  }

  return NextResponse.json({ withdrawal: formatWithdrawal(finalized.data as WithdrawalRequestRow) });
}

async function rejectWithdrawal(
  supabase: any,
  withdrawalId: string,
  adminNote: string | null,
  actor: string,
) {
  if (!adminNote) {
    return jsonError("Admin note is required before rejecting a withdrawal request.", 400);
  }

  const rejected = await supabase
    .from("worldcup_withdrawal_requests")
    .update({
      status: "rejected",
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
      reviewed_by: actor,
    })
    .eq("id", withdrawalId)
    .eq("status", "submitted")
    .select(WITHDRAWAL_SELECT)
    .maybeSingle();

  if (rejected.error) {
    return jsonError("Could not reject withdrawal request.", 500);
  }

  if (!rejected.data) {
    return stateConflictResponse(supabase, withdrawalId, "reject");
  }

  return NextResponse.json({ withdrawal: formatWithdrawal(rejected.data as WithdrawalRequestRow) });
}

async function markWithdrawalPaid(
  supabase: any,
  withdrawalId: string,
  adminNote: string | null,
  externalTxHash: string | null,
  actor: string,
  launchEvidence: boolean,
) {
  const current = await loadWithdrawal(supabase, withdrawalId);

  if (!current.ok) {
    return current.response;
  }

  const row = current.row;
  if (row.status !== "approved") {
    return stateConflictResponse(supabase, withdrawalId, "mark_paid");
  }

  const normalizedTxHash = normalizeWithdrawalTxHash(row.network, externalTxHash);
  if (!normalizedTxHash) {
    return jsonError("External transaction hash does not match the withdrawal network.", 400);
  }

  const note = adminNote ?? row.admin_note;
  if (!note) {
    return jsonError("Admin note is required before marking a withdrawal paid.", 400);
  }

  const paidAt = new Date().toISOString();
  const paid = await supabase
    .from("worldcup_withdrawal_requests")
    .update({
      status: "paid",
      admin_note: note,
      paid_at: paidAt,
      paid_by: actor,
      external_tx_hash: normalizedTxHash,
      raw: {
        ...(row.raw ?? {}),
        payoutEvidence: {
          launchReady: launchEvidence,
          source: "manual_external_transfer",
          withdrawalId: row.id,
          walletTransactionId: row.wallet_transaction_id,
          network: row.network,
          amount: row.amount,
          currency: row.currency,
          externalTxHash: normalizedTxHash,
          recordedAt: paidAt,
          recordedBy: actor,
        },
      },
    })
    .eq("id", withdrawalId)
    .eq("status", "approved")
    .select(WITHDRAWAL_SELECT)
    .maybeSingle();

  if (paid.error) {
    return jsonError("Could not mark withdrawal as paid.", 500);
  }

  if (!paid.data) {
    return stateConflictResponse(supabase, withdrawalId, "mark_paid");
  }

  return NextResponse.json({ withdrawal: formatWithdrawal(paid.data as WithdrawalRequestRow) });
}

async function releaseApprovedWithdrawal(
  supabase: any,
  withdrawalId: string,
  adminNote: string,
  actor: string,
) {
  await supabase
    .from("worldcup_withdrawal_requests")
    .update({
      status: "submitted",
      admin_note: adminNote,
      reviewed_at: null,
      reviewed_by: actor,
    })
    .eq("id", withdrawalId)
    .eq("status", "approved");
}

async function stateConflictResponse(supabase: any, withdrawalId: string, action: WithdrawalAction) {
  const current = await loadWithdrawal(supabase, withdrawalId);

  if (!current.ok) {
    return current.response;
  }

  return jsonError(getStateConflictMessage(current.row.status, action), 409);
}

async function loadWithdrawal(
  supabase: any,
  withdrawalId: string,
): Promise<{ ok: true; row: WithdrawalRequestRow } | { ok: false; response: NextResponse }> {
  const withdrawal = await supabase
    .from("worldcup_withdrawal_requests")
    .select(WITHDRAWAL_SELECT)
    .eq("id", withdrawalId)
    .maybeSingle();

  if (withdrawal.error) {
    return { ok: false, response: jsonError("Could not load withdrawal request.", 500) };
  }

  if (!withdrawal.data) {
    return { ok: false, response: jsonError("Withdrawal request was not found.", 404) };
  }

  return { ok: true, row: withdrawal.data as WithdrawalRequestRow };
}

function getStateConflictMessage(status: string, action: WithdrawalAction) {
  if (status === "approved" && action === "approve") {
    return "Withdrawal request is already approved.";
  }

  if (status === "rejected") {
    return "Withdrawal request is already rejected.";
  }

  if (status === "paid") {
    return "Withdrawal request is already paid.";
  }

  if (action === "mark_paid") {
    return "Only approved withdrawal requests can be marked paid.";
  }

  return `Only submitted withdrawal requests can be ${action === "approve" ? "approved" : "rejected"}.`;
}

function formatWithdrawal(row: WithdrawalRequestRow) {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    displayName: row.display_name ?? "WorldCup player",
    network: row.network,
    address: row.address,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    paidAt: row.paid_at,
    paidBy: row.paid_by,
    externalTxHash: row.external_tx_hash,
    walletTransactionId: row.wallet_transaction_id,
    payoutEvidenceReady:
      row.raw?.payoutEvidence &&
      typeof row.raw.payoutEvidence === "object" &&
      "launchReady" in row.raw.payoutEvidence
        ? Boolean((row.raw.payoutEvidence as { launchReady?: unknown }).launchReady)
        : false,
  };
}
