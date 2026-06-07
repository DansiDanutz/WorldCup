import { NextResponse } from "next/server";

import {
  DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS,
  buildFrozenSenderWalletUpdate,
  getConfiguredMainDepositAddress,
  getDepositClaimLimitViolation,
  getDepositNetworkShortLabel,
  getSavedSenderWalletForNetwork,
  getSenderWalletLockMismatchMessage,
  normalizeDepositAddress,
  normalizeDepositTxHash,
  normalizeNetwork,
  parseDepositAmount,
  sumActiveDepositClaimAmounts,
} from "@/lib/deposits";
import { enforceGeoEligibility, enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
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
import {
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

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
};

type SignedInUserResult =
  | { error: NextResponse }
  | {
      // Keep this boundary light; Supabase's full generic client type makes
      // route-level typechecking disproportionately expensive.
      supabase: any;
      user: any;
    };

async function getSignedInUser(request: Request): Promise<SignedInUserResult> {
  const token = getBearerToken(request);

  if (!token) {
    return { error: jsonError("Sign in with Google first.", 401) };
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return { error: jsonError("Invalid session.", 401) };
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return { error: jsonError("Only Google sign-in is allowed.", 403) };
  }

  return { supabase, user };
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "deposit-claims", {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  const claims = await auth.supabase
    .from("worldcup_deposit_claims")
    .select("id,network,address,sender_wallet_address,amount,currency,tx_hash,status,admin_note,created_at,credited_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (claims.error) {
    return jsonError("Could not load deposit claims.", 500);
  }

  return NextResponse.json({ claims: (claims.data ?? []).map(formatClaim) });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "deposit-claims", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  const operatorPolicy = await loadOperatorPolicy(auth.supabase);
  if (!isPaidActionLaunchTestAdmin(auth.user.email)) {
    const geoRestricted = enforceGeoEligibility(request, getPolicyGeoEnv(operatorPolicy));
    if (geoRestricted) {
      return geoRestricted;
    }
  }

  const paidActionGate = await getUserPaidActionGate(auth.supabase, "deposit", {
    userEmail: auth.user.email,
  });
  if (!paidActionGate.allowed) {
    return jsonError(paidActionGate.message ?? "USDT deposits are unavailable right now.", 403);
  }

  const responsiblePlay = await loadResponsiblePlayStatus(auth.supabase, auth.user.id);
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

  let network;
  let amount: number | null;
  let txHash: string | null;
  let senderWalletAddress: string | null = null;

  try {
    const body = requireObject(await request.json());
    network = normalizeNetwork(requireString(body.network, "Network", { max: 16 }));
    if (!network) {
      return jsonError("Choose TRC20 or ERC20.", 400);
    }

    amount = parseDepositAmount(body.amount);
    if (!amount) {
      return jsonError("Amount must be a positive USDT amount.", 400);
    }

    txHash = normalizeDepositTxHash(
      network,
      requireString(body.txHash, "Transaction hash", { min: 32, max: 100 }),
    );
    if (!txHash) {
      return jsonError("Transaction hash does not match the selected network.", 400);
    }

    senderWalletAddress = normalizeDepositAddress(
      network,
      requireString(body.senderWalletAddress, "Sending wallet address", { min: 20, max: 128 }),
    );
    if (!senderWalletAddress) {
      return jsonError("Sending wallet address must match the selected network.", 400);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const address = getConfiguredMainDepositAddress(process.env, network);
  if (!address) {
    return jsonError("Shared receive address is not configured for this network.", 503);
  }

  const limitConfig = getDepositLimitConfigFromPolicy(operatorPolicy);
  if (limitConfig.maxPerClaimAmount !== null || limitConfig.maxDailyClaimAmount !== null) {
    let rollingDailyClaimTotal = 0;

    if (limitConfig.maxDailyClaimAmount !== null) {
      const since = new Date(Date.now() - DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
      const recentClaims = await auth.supabase
        .from("worldcup_deposit_claims")
        .select("amount,status")
        .eq("user_id", auth.user.id)
        .gte("created_at", since);

      if (recentClaims.error) {
        return jsonError("Could not verify deposit limits.", 500);
      }

      rollingDailyClaimTotal = sumActiveDepositClaimAmounts(recentClaims.data ?? []);
    }

    const limitViolation = getDepositClaimLimitViolation(amount, rollingDailyClaimTotal, limitConfig);
    if (limitViolation) {
      return jsonError(limitViolation, 403);
    }
  }

  const tournament = await auth.supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const profile = await getOrCreateReferralProfile(auth.supabase, auth.user);
  const savedSenderWallet = getSavedSenderWalletForNetwork(profile, network);
  if (savedSenderWallet && savedSenderWallet !== senderWalletAddress) {
    return jsonError(getSenderWalletLockMismatchMessage(network), 409);
  }

  const now = new Date().toISOString();
  const senderWalletUpdateData = buildFrozenSenderWalletUpdate(
    profile,
    network,
    senderWalletAddress,
    now,
  );
  const senderWalletUpdate = await auth.supabase
    .from("worldcup_referral_profiles")
    .update(senderWalletUpdateData)
    .eq("user_id", auth.user.id);

  if (senderWalletUpdate.error) {
    if (senderWalletUpdate.error.message?.includes("SENDER_WALLET_LOCKED")) {
      return jsonError(getSenderWalletLockMismatchMessage(network), 409);
    }

    return jsonError(`Could not lock your ${getDepositNetworkShortLabel(network)} sender wallet.`, 500);
  }

  const insert = await auth.supabase
    .from("worldcup_deposit_claims")
    .insert({
      tournament_id: tournament.data.id,
      user_id: auth.user.id,
      user_email: auth.user.email ?? profile.email ?? null,
      display_name: profile.display_name ?? getUserDisplayName(auth.user),
      network,
      address: address.address,
      sender_wallet_address: senderWalletAddress,
      amount,
      currency: "USDT",
      tx_hash: txHash,
    })
    .select("id,network,address,sender_wallet_address,amount,currency,tx_hash,status,admin_note,created_at,credited_at")
    .single();

  if (insert.error) {
    if (insert.error.code === "23505") {
      return jsonError("That transaction hash was already submitted.", 409);
    }

    return jsonError("Could not save deposit claim.", 500);
  }

  return NextResponse.json({ claim: formatClaim(insert.data as DepositClaimRow) });
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
