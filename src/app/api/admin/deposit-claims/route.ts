import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { normalizeNetwork, parseDepositAmount } from "@/lib/deposits";
import { normalizeLedgerAmount } from "@/lib/economy";
import { enforceRateLimit, jsonError } from "@/lib/http";
import {
  findMatchingMainDeposit,
  getKucoinMainConfig,
  listMainAccountDeposits,
} from "@/lib/kucoin";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  optionalString,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

type DepositClaimRow = {
  id: string;
  tournament_id: string;
  user_id: string;
  user_email: string | null;
  display_name: string | null;
  network: string;
  address: string;
  amount: string;
  currency: string;
  tx_hash: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  credited_at: string | null;
  credited_by: string | null;
  worldcup_deposit_id: string | null;
};

type ClaimKucoinVerification =
  | {
      status: "matched";
      amount: string;
      amountMatchesClaim: boolean;
      amountMatchesCredit: boolean | null;
      address: string;
      chain: string;
      currency: string;
      network: string;
      walletTxId: string | null;
      createdAt: number;
      verifiedAt: string;
    }
  | {
      status: "missing" | "unavailable";
      message: string;
      verifiedAt: string;
    };

const CLAIM_SELECT =
  "id,tournament_id,user_id,user_email,display_name,network,address,amount,currency,tx_hash,status,admin_note,created_at,credited_at,credited_by,worldcup_deposit_id";

const CLAIM_VERIFICATION_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

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

  let action = "list";
  let claimId = "";
  let adminNote: string | null = null;
  let amountOverride: number | null = null;
  let requireKucoinMatch = false;

  try {
    const body = requireObject(await request.json());
    action = optionalString(body.action, "Action", 20) ?? "list";
    claimId = action === "list" ? "" : requireString(body.claimId, "Claim ID", { max: 64 });
    adminNote = optionalString(body.adminNote, "Admin note", 300);
    requireKucoinMatch = body.requireKucoinMatch === true;
    amountOverride =
      body.amount === undefined || body.amount === null || body.amount === ""
        ? null
        : parseDepositAmount(body.amount);
    if (body.amount !== undefined && body.amount !== null && body.amount !== "" && !amountOverride) {
      return jsonError("Amount must be a positive USDT amount.", 400);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  if (action === "list") {
    return listClaims(supabase);
  }

  const actor = auth.via === "email" ? auth.adminEmail : "admin";

  if (action === "reject") {
    return rejectClaim(supabase, claimId, adminNote, actor);
  }

  if (action === "verify") {
    return verifyClaim(supabase, claimId);
  }

  if (action === "credit") {
    return creditClaim(supabase, claimId, amountOverride, adminNote, actor, requireKucoinMatch);
  }

  return jsonError("Unsupported deposit claim action.", 400);
}

async function verifyClaim(supabase: any, claimId: string) {
  const loaded = await loadClaim(supabase, claimId);
  if (!loaded.ok) {
    return loaded.response;
  }

  const verification = await getClaimKucoinVerification(loaded.claim, null);

  if (verification.status === "unavailable" && verification.message === "unsupported-network") {
    return jsonError("Deposit claim has an unsupported network.", 400);
  }

  return NextResponse.json({ verification: formatClaimKucoinVerification(verification) });
}

async function getClaimKucoinVerification(
  row: DepositClaimRow,
  creditAmount: string | number | null,
): Promise<ClaimKucoinVerification> {
  const verifiedAt = new Date().toISOString();
  const network = normalizeNetwork(row.network);

  if (!network) {
    return {
      status: "unavailable",
      message: "unsupported-network",
      verifiedAt,
    };
  }

  const config = getKucoinMainConfig();
  if (!config) {
    return {
      status: "unavailable",
      message: "KuCoin main account API is not configured.",
      verifiedAt,
    };
  }

  const claimCreatedAt = Date.parse(row.created_at);
  const startAt =
    Number.isFinite(claimCreatedAt) ? claimCreatedAt - CLAIM_VERIFICATION_WINDOW_MS : undefined;

  let deposits;
  try {
    deposits = await listMainAccountDeposits(config, {
      currency: "USDT",
      status: "SUCCESS",
      startAt,
      endAt: Date.now() + 60_000,
      pageSize: 100,
    });
  } catch {
    return {
      status: "unavailable",
      message: "Could not read KuCoin deposit history from the production server. Verify manually in KuCoin.",
      verifiedAt,
    };
  }

  const match = findMatchingMainDeposit(deposits, {
    network,
    address: row.address,
    txHash: row.tx_hash,
    amount: creditAmount,
  });

  if (!match) {
    return {
      status: "missing",
      message: creditAmount === null
        ? "No matching successful KuCoin deposit was found for this transaction hash."
        : "No matching successful KuCoin deposit was found for this transaction hash and credit amount.",
      verifiedAt,
    };
  }

  return {
    status: "matched",
    amount: match.amount,
    amountMatchesClaim: normalizeLedgerAmount(match.amount) === normalizeLedgerAmount(row.amount),
    amountMatchesCredit:
      creditAmount === null
        ? null
        : normalizeLedgerAmount(match.amount) === normalizeLedgerAmount(creditAmount),
    address: match.address,
    chain: match.chain,
    currency: match.currency,
    network,
    walletTxId: match.walletTxId ?? match.id ?? null,
    createdAt: match.createdAt,
    verifiedAt,
  };
}

function formatClaimKucoinVerification(verification: ClaimKucoinVerification) {
  if (verification.status !== "matched") {
    return {
      status: verification.status,
      message: verification.message,
    };
  }

  return {
    status: verification.status,
    amount: verification.amount,
    amountMatchesClaim: verification.amountMatchesClaim,
    address: verification.address,
    chain: verification.chain,
    currency: verification.currency,
    network: verification.network,
    walletTxId: verification.walletTxId,
    createdAt: verification.createdAt,
  };
}

async function listClaims(supabase: any) {
  const claims = await supabase
    .from("worldcup_deposit_claims")
    .select(CLAIM_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);

  if (claims.error) {
    return jsonError("Could not load deposit claims.", 500);
  }

  return NextResponse.json({ claims: (claims.data ?? []).map(formatClaim) });
}

async function rejectClaim(
  supabase: any,
  claimId: string,
  adminNote: string | null,
  actor: string,
) {
  const loaded = await loadClaim(supabase, claimId);
  if (!loaded.ok) {
    return loaded.response;
  }

  if (loaded.claim.status !== "submitted") {
    return jsonError(getProcessedClaimMessage(loaded.claim, "reject"), 409);
  }

  const update = await supabase
    .from("worldcup_deposit_claims")
    .update({
      status: "rejected",
      admin_note: adminNote,
      credited_by: actor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", claimId)
    .eq("status", "submitted")
    .select(CLAIM_SELECT)
    .maybeSingle();

  if (update.error) {
    return jsonError("Could not reject deposit claim.", 500);
  }

  if (!update.data) {
    return staleClaimResponse(supabase, claimId, "reject");
  }

  return NextResponse.json({ claim: formatClaim(update.data as DepositClaimRow) });
}

async function creditClaim(
  supabase: any,
  claimId: string,
  amountOverride: number | null,
  adminNote: string | null,
  actor: string,
  requireKucoinMatch: boolean,
) {
  const loaded = await loadClaim(supabase, claimId);
  if (!loaded.ok) {
    return loaded.response;
  }

  const row = loaded.claim;
  if (row.status !== "submitted") {
    return jsonError(getProcessedClaimMessage(row, "credit"), 409);
  }

  if (!adminNote) {
    return jsonError("Admin note is required before crediting a deposit claim.", 400);
  }

  const amount = amountOverride ?? Number(row.amount);
  const kucoinVerification = await getClaimKucoinVerification(row, amount);

  if (requireKucoinMatch && kucoinVerification.status !== "matched") {
    return jsonError(
      kucoinVerification.status === "unavailable"
        ? `${kucoinVerification.message} Uncheck the launch-evidence requirement only for manual non-launch credit.`
        : "KuCoin matched verification is required before crediting this launch-evidence deposit claim.",
      400,
    );
  }

  const reserved = await supabase
    .from("worldcup_deposit_claims")
    .update({
      status: "processing",
      admin_note: adminNote,
      credited_by: actor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("status", "submitted")
    .select(CLAIM_SELECT)
    .maybeSingle();

  if (reserved.error) {
    return jsonError("Could not reserve deposit claim for crediting.", 500);
  }

  if (!reserved.data) {
    return staleClaimResponse(supabase, claimId, "credit");
  }

  const reservedRow = reserved.data as DepositClaimRow;
  const credit = await supabase.rpc("worldcup_credit_deposit", {
    p_user_id: reservedRow.user_id,
    p_tournament_id: reservedRow.tournament_id,
    p_network: reservedRow.network,
    p_address: reservedRow.address,
    p_external_id: reservedRow.tx_hash,
    p_amount: amount,
    p_currency: reservedRow.currency,
    p_raw: {
      source: "manual_shared_address_claim",
      claimId: reservedRow.id,
      userId: reservedRow.user_id,
      userEmail: reservedRow.user_email,
      displayName: reservedRow.display_name,
      network: reservedRow.network,
      address: reservedRow.address,
      txHash: reservedRow.tx_hash,
      currency: reservedRow.currency,
      amountClaimed: reservedRow.amount,
      amountCredited: amount,
      adminNote,
      creditedBy: actor,
      kucoinMainVerification: kucoinVerification,
    },
  });

  if (credit.error) {
    await releaseProcessingClaim(supabase, reservedRow.id);
    return jsonError("Could not credit deposit claim.", 500);
  }

  if (!credit.data) {
    await releaseProcessingClaim(supabase, reservedRow.id);
    return jsonError("That transaction hash was already credited.", 409);
  }

  const update = await supabase
    .from("worldcup_deposit_claims")
    .update({
      status: "credited",
      admin_note: adminNote,
      credited_by: actor,
      credited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      worldcup_deposit_id: credit.data,
    })
    .eq("id", reservedRow.id)
    .eq("status", "processing")
    .select(CLAIM_SELECT)
    .maybeSingle();

  if (update.error) {
    return jsonError("Deposit was credited, but the claim status could not be updated.", 500);
  }

  if (!update.data) {
    return jsonError(
      "Deposit was credited, but this claim changed before its status could be updated. Reload deposit claims.",
      409,
    );
  }

  return NextResponse.json({ claim: formatClaim(update.data as DepositClaimRow) });
}

async function releaseProcessingClaim(supabase: any, claimId: string) {
  await supabase
    .from("worldcup_deposit_claims")
    .update({
      status: "submitted",
      credited_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", claimId)
    .eq("status", "processing");
}

async function loadClaim(
  supabase: any,
  claimId: string,
): Promise<
  | { ok: true; claim: DepositClaimRow }
  | { ok: false; response: NextResponse }
> {
  const claim = await supabase
    .from("worldcup_deposit_claims")
    .select(CLAIM_SELECT)
    .eq("id", claimId)
    .maybeSingle();

  if (claim.error) {
    return { ok: false, response: jsonError("Could not load deposit claim.", 500) };
  }

  if (!claim.data) {
    return { ok: false, response: jsonError("Deposit claim was not found.", 404) };
  }

  return { ok: true, claim: claim.data as DepositClaimRow };
}

async function staleClaimResponse(
  supabase: any,
  claimId: string,
  action: "credit" | "reject",
) {
  const latest = await loadClaim(supabase, claimId);

  if (!latest.ok) {
    return latest.response;
  }

  return jsonError(getProcessedClaimMessage(latest.claim, action), 409);
}

function getProcessedClaimMessage(row: DepositClaimRow, action: "credit" | "reject") {
  if (row.status === "processing") {
    return "Deposit claim is currently being credited. Reload deposit claims.";
  }

  if (row.status === "credited") {
    return "Deposit claim is already credited.";
  }

  if (row.status === "rejected") {
    return "Deposit claim is already rejected.";
  }

  return `Only submitted deposit claims can be ${action === "credit" ? "credited" : "rejected"}.`;
}

function formatClaim(row: DepositClaimRow) {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    displayName: row.display_name ?? "WorldCup player",
    network: row.network,
    address: row.address,
    amount: row.amount,
    currency: row.currency,
    txHash: row.tx_hash,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    creditedAt: row.credited_at,
    creditedBy: row.credited_by,
    worldcupDepositId: row.worldcup_deposit_id,
  };
}
