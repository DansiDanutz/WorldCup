import { NextResponse } from "next/server";

import {
  getAgeVerificationContact,
  getWithdrawalAgeGateMessage,
  isAgeVerified,
  loadAgeVerification,
} from "@/lib/age-verification";
import { calculateWalletBalance } from "@/lib/economy";
import { enforceGeoEligibility, enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  getPolicyGeoEnv,
  getWithdrawalLimitConfigFromPolicy,
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
import {
  getWithdrawalLimitViolation,
  isValidWithdrawalAddress,
  normalizeWithdrawalNetwork,
  parseWithdrawalAmount,
  sumActiveWithdrawalRequestAmounts,
  WITHDRAWAL_LIMIT_WINDOW_HOURS,
} from "@/lib/withdrawals";

type WithdrawalRequestRow = {
  id: string;
  network: string;
  address: string;
  amount: string;
  currency: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  paid_at: string | null;
  external_tx_hash: string | null;
};

type WalletTransaction = {
  from_user_id: string | null;
  to_user_id: string | null;
  amount: string;
};

type SignedInUserResult =
  | { error: NextResponse }
  | {
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
  const limited = await enforceRateLimit(request, "withdrawals", {
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

  const requests = await auth.supabase
    .from("worldcup_withdrawal_requests")
    .select("id,network,address,amount,currency,status,admin_note,created_at,reviewed_at,paid_at,external_tx_hash")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (requests.error) {
    return jsonError("Could not load withdrawal requests.", 500);
  }

  const ageVerification = await loadAgeVerification(auth.supabase, auth.user.id);
  const verification = "error" in ageVerification ? null : ageVerification.verification;

  return NextResponse.json({
    withdrawals: (requests.data ?? []).map(formatWithdrawalRequest),
    ageVerification: {
      status: verification?.status ?? "unverified",
      note: verification?.note ?? null,
      submittedAt: verification?.submittedAt ?? null,
      verifiedAt: verification?.verifiedAt ?? null,
      contact: getAgeVerificationContact(),
    },
  });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "withdrawals", {
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

  const paidActionGate = await getUserPaidActionGate(auth.supabase, "withdrawal", {
    userEmail: auth.user.email,
  });
  if (!paidActionGate.allowed) {
    return jsonError(paidActionGate.message ?? "Withdrawal requests are paused until launch approvals are complete.", 403);
  }

  // Winners must prove they are 18+ before any payout. Documents are reviewed
  // off-platform and an admin records the result; the player cannot self-verify.
  const ageVerification = await loadAgeVerification(auth.supabase, auth.user.id);
  if ("error" in ageVerification) {
    return jsonError(ageVerification.error, 500);
  }
  if (!isAgeVerified(ageVerification.verification.status)) {
    return jsonError(
      getWithdrawalAgeGateMessage(ageVerification.verification.status, getAgeVerificationContact()) ??
        "Age verification is required before withdrawing.",
      403,
    );
  }

  let network;
  let address: string;
  let amount: number | null;

  try {
    const body = requireObject(await request.json());
    network = normalizeWithdrawalNetwork(body.network);
    if (!network) {
      return jsonError("Choose TRC20 or ERC20.", 400);
    }

    address = requireString(body.address, "Withdrawal address", { min: 26, max: 120 });
    if (!isValidWithdrawalAddress(network, address)) {
      return jsonError("Withdrawal address does not match the selected network.", 400);
    }

    amount = parseWithdrawalAmount(body.amount);
    if (!amount) {
      return jsonError("Amount must be a positive USDT amount.", 400);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const tournament = await auth.supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const responsiblePlay = await loadResponsiblePlayStatus(auth.supabase, auth.user.id, {
    tournamentId: tournament.data.id,
  });
  if ("error" in responsiblePlay) {
    return jsonError(responsiblePlay.error, 500);
  }

  const responsiblePlayRestriction = getResponsiblePlayRestriction(
    responsiblePlay.status,
    "withdrawal",
  );
  if (responsiblePlayRestriction) {
    return jsonError(responsiblePlayRestriction, 403);
  }

  const [transactions, recentRequests] = await Promise.all([
    auth.supabase
      .from("worldcup_wallet_transactions")
      .select("from_user_id,to_user_id,amount")
      .eq("tournament_id", tournament.data.id)
      .or(`from_user_id.eq.${auth.user.id},to_user_id.eq.${auth.user.id}`),
    auth.supabase
      .from("worldcup_withdrawal_requests")
      .select("amount,status")
      .eq("user_id", auth.user.id)
      .gte(
        "created_at",
        new Date(Date.now() - WITHDRAWAL_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
      ),
  ]);

  if (transactions.error) {
    return jsonError("Could not verify wallet balance.", 500);
  }

  if (recentRequests.error) {
    return jsonError("Could not verify withdrawal limits.", 500);
  }

  const walletBalance = calculateWalletBalance(auth.user.id, (transactions.data ?? []) as WalletTransaction[]);
  if (walletBalance < amount) {
    return jsonError("Not enough wallet balance for this withdrawal request.", 402);
  }

  const limitConfig = getWithdrawalLimitConfigFromPolicy(operatorPolicy);
  const limitViolation = getWithdrawalLimitViolation(
    amount,
    sumActiveWithdrawalRequestAmounts(recentRequests.data ?? []),
    limitConfig,
  );
  if (limitViolation) {
    return jsonError(limitViolation, 403);
  }

  const profile = await getOrCreateReferralProfile(auth.supabase, auth.user);
  const insert = await auth.supabase
    .from("worldcup_withdrawal_requests")
    .insert({
      tournament_id: tournament.data.id,
      user_id: auth.user.id,
      user_email: auth.user.email ?? profile.email ?? null,
      display_name: profile.display_name ?? getUserDisplayName(auth.user),
      network,
      address,
      amount,
      currency: "USDT",
    })
    .select("id,network,address,amount,currency,status,admin_note,created_at,reviewed_at,paid_at,external_tx_hash")
    .single();

  if (insert.error) {
    return jsonError("Could not save withdrawal request.", 500);
  }

  return NextResponse.json({ withdrawal: formatWithdrawalRequest(insert.data as WithdrawalRequestRow) });
}

function formatWithdrawalRequest(row: WithdrawalRequestRow) {
  return {
    id: row.id,
    network: row.network,
    address: row.address,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    paidAt: row.paid_at,
    externalTxHash: row.external_tx_hash,
  };
}
