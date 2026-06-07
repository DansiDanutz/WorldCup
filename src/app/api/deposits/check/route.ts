import { NextResponse } from "next/server";

import {
  DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS,
  getConfiguredMainDepositAddress,
  getDepositClaimLimitViolation,
  getDepositNetworkShortLabel,
  getSavedSenderWalletForNetwork,
  getSavedSenderWalletUpdatedAtForNetwork,
  normalizeDepositAddress,
  normalizeNetwork,
  parseDepositAmount,
  sumActiveDepositClaimAmounts,
} from "@/lib/deposits";
import { enforceGeoEligibility, enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  getKucoinMainConfig,
  getKucoinMainDepositExternalId,
  getKucoinMainDepositTxHash,
  listMainAccountDeposits,
  type KucoinMainDeposit,
} from "@/lib/kucoin";
import {
  getDepositLimitConfigFromPolicy,
  getPolicyGeoEnv,
  loadOperatorPolicy,
} from "@/lib/operator-policy";
import { getUserPaidActionGate, isPaidActionLaunchTestAdmin } from "@/lib/paid-action-gates";
import {
  getAuthProvider,
  getOrCreateReferralProfile,
  getUserDisplayName,
} from "@/lib/referrals";
import { getResponsiblePlayRestriction, loadResponsiblePlayStatus } from "@/lib/responsible-play";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

type DepositClaimRow = {
  id: string;
  network: string;
  address: string;
  sender_wallet_address: string | null;
  amount: string;
  currency: string;
  tx_hash: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  credited_at: string | null;
  user_id?: string;
};

type CandidateDeposit = {
  amount: number;
  deposit: KucoinMainDeposit;
  txHash: string;
};

const CLAIM_SELECT =
  "id,network,address,sender_wallet_address,amount,currency,tx_hash,status,admin_note,created_at,credited_at,user_id";
const DEPOSIT_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000;
const SENDER_WALLET_LOCK_BUFFER_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "deposit-check", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Sign in with Google first.", 401);
  }

  const userResult = await supabase.auth.getUser(token);
  if (userResult.error || !userResult.data.user) {
    return jsonError("Invalid session.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  let network;
  try {
    const body = requireObject(await request.json());
    network = normalizeNetwork(requireString(body.network, "Network", { max: 16 }));
    if (!network) {
      return jsonError("Choose TRC20 or ERC20.", 400);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const operatorPolicy = await loadOperatorPolicy(supabase);
  if (!isPaidActionLaunchTestAdmin(user.email)) {
    const geoRestricted = enforceGeoEligibility(request, getPolicyGeoEnv(operatorPolicy));
    if (geoRestricted) {
      return geoRestricted;
    }
  }

  const paidActionGate = await getUserPaidActionGate(supabase, "deposit", {
    userEmail: user.email,
  });
  if (!paidActionGate.allowed) {
    return jsonError(paidActionGate.message ?? "USDT deposits are unavailable right now.", 403);
  }

  const responsiblePlay = await loadResponsiblePlayStatus(supabase, user.id);
  if ("error" in responsiblePlay) {
    return jsonError(responsiblePlay.error, 500);
  }

  const responsiblePlayRestriction = getResponsiblePlayRestriction(
    responsiblePlay.status,
    "deposit",
  );
  if (responsiblePlayRestriction) {
    return jsonError(responsiblePlayRestriction, 403);
  }

  const profile = await getOrCreateReferralProfile(supabase, user);
  const senderWalletAddress = getSavedSenderWalletForNetwork(profile, network);
  if (!senderWalletAddress) {
    return jsonError(`Lock your ${getDepositNetworkShortLabel(network)} sender wallet first.`, 409);
  }

  const receiveAddress = getConfiguredMainDepositAddress(process.env, network);
  if (!receiveAddress) {
    return jsonError("Shared receive address is not configured for this network.", 503);
  }

  const config = getKucoinMainConfig();
  if (!config) {
    return jsonError("KuCoin main account API is not configured.", 503);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const savedAt = Date.parse(getSavedSenderWalletUpdatedAtForNetwork(profile, network) ?? "");
  const earliestAllowed =
    Number.isFinite(savedAt) ? savedAt - SENDER_WALLET_LOCK_BUFFER_MS : Date.now() - DEPOSIT_LOOKBACK_MS;
  const startAt = Math.max(Date.now() - DEPOSIT_LOOKBACK_MS, earliestAllowed);

  let deposits: KucoinMainDeposit[];
  try {
    deposits = await listMainAccountDeposits(config, {
      currency: "USDT",
      status: "SUCCESS",
      startAt,
      endAt: Date.now() + 60_000,
      pageSize: 100,
    });
  } catch {
    return jsonError("Could not read KuCoin deposit history from the production server.", 502);
  }

  const candidates = deposits
    .map((deposit): CandidateDeposit | null => {
      const depositNetwork = normalizeNetwork(deposit.chain);
      const depositAddress = normalizeDepositAddress(network, deposit.address);
      const txHash = getKucoinMainDepositTxHash(deposit, network);
      const amount = parseDepositAmount(deposit.amount);

      if (
        deposit.currency !== "USDT" ||
        deposit.status !== "SUCCESS" ||
        depositNetwork !== network ||
        depositAddress !== receiveAddress.address ||
        !txHash ||
        !amount ||
        deposit.createdAt < earliestAllowed
      ) {
        return null;
      }

      return { amount, deposit, txHash };
    })
    .filter((candidate): candidate is CandidateDeposit => Boolean(candidate))
    .sort((a, b) => b.deposit.createdAt - a.deposit.createdAt);

  if (candidates.length === 0) {
    return NextResponse.json({
      matched: false,
      message: `No confirmed ${getDepositNetworkShortLabel(network)} USDT deposit was found yet. Try again after KuCoin confirms it.`,
    });
  }

  const txHashes = [...new Set(candidates.map((candidate) => candidate.txHash))];
  const [existingClaims, existingDeposits] = await Promise.all([
    supabase
      .from("worldcup_deposit_claims")
      .select(CLAIM_SELECT)
      .eq("network", network)
      .in("tx_hash", txHashes),
    supabase
      .from("worldcup_deposits")
      .select("external_id")
      .eq("provider", "kucoin")
      .in("external_id", txHashes),
  ]);

  if (existingClaims.error || existingDeposits.error) {
    return jsonError("Could not check existing deposit records.", 500);
  }

  const existingClaimRows = (existingClaims.data ?? []) as DepositClaimRow[];
  const existingClaimByHash = new Map(existingClaimRows.map((claim) => [claim.tx_hash, claim]));
  const creditedExternalIds = new Set((existingDeposits.data ?? []).map((deposit) => deposit.external_id));
  const existingUserClaim = existingClaimRows.find((claim) => claim.user_id === user.id);
  if (existingUserClaim) {
    return NextResponse.json({
      matched: true,
      alreadySubmitted: true,
      claim: formatClaim(existingUserClaim),
      message: "This deposit is already waiting for admin review.",
    });
  }

  const candidate = candidates.find(
    (item) => !existingClaimByHash.has(item.txHash) && !creditedExternalIds.has(item.txHash),
  );
  if (!candidate) {
    return NextResponse.json({
      matched: false,
      message: "Confirmed deposits for this receive wallet were already submitted or credited.",
    });
  }

  const limitConfig = getDepositLimitConfigFromPolicy(operatorPolicy);
  if (limitConfig.maxPerClaimAmount !== null || limitConfig.maxDailyClaimAmount !== null) {
    let rollingDailyClaimTotal = 0;

    if (limitConfig.maxDailyClaimAmount !== null) {
      const since = new Date(Date.now() - DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
      const recentClaims = await supabase
        .from("worldcup_deposit_claims")
        .select("amount,status")
        .eq("user_id", user.id)
        .gte("created_at", since);

      if (recentClaims.error) {
        return jsonError("Could not verify deposit limits.", 500);
      }

      rollingDailyClaimTotal = sumActiveDepositClaimAmounts(recentClaims.data ?? []);
    }

    const limitViolation = getDepositClaimLimitViolation(candidate.amount, rollingDailyClaimTotal, limitConfig);
    if (limitViolation) {
      return jsonError(limitViolation, 403);
    }
  }

  const insert = await supabase
    .from("worldcup_deposit_claims")
    .insert({
      tournament_id: tournament.data.id,
      user_id: user.id,
      user_email: user.email ?? profile.email ?? null,
      display_name: profile.display_name ?? getUserDisplayName(user),
      network,
      address: receiveAddress.address,
      sender_wallet_address: senderWalletAddress,
      amount: candidate.amount,
      currency: "USDT",
      tx_hash: candidate.txHash,
    })
    .select(CLAIM_SELECT)
    .single();

  if (insert.error) {
    if (insert.error.code === "23505") {
      const existing = await supabase
        .from("worldcup_deposit_claims")
        .select(CLAIM_SELECT)
        .eq("network", network)
        .eq("tx_hash", candidate.txHash)
        .maybeSingle();
      if (!existing.error && existing.data) {
        return NextResponse.json({
          matched: true,
          alreadySubmitted: true,
          claim: formatClaim(existing.data as DepositClaimRow),
          message: "This deposit is already waiting for admin review.",
        });
      }
    }

    return jsonError("Could not save the detected deposit for admin review.", 500);
  }

  return NextResponse.json({
    matched: true,
    alreadySubmitted: false,
    providerDepositId: getKucoinMainDepositExternalId(candidate.deposit),
    claim: formatClaim(insert.data as DepositClaimRow),
    message: "Deposit found. Admin can now accept it from Incoming transfers.",
  });
}

function formatClaim(row: DepositClaimRow) {
  return {
    id: row.id,
    network: row.network,
    address: row.address,
    senderWalletAddress: row.sender_wallet_address,
    amount: row.amount,
    currency: row.currency,
    txHash: row.tx_hash,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    creditedAt: row.credited_at,
  };
}
