import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCurrentLegalApprovalEvidenceNoteRequirement,
  getLaunchSignoffEvidenceNoteRequirement,
  getLaunchSignoffEvidenceUrlRequirement,
  isApprovalEvidenceUrlRequiredLaunchSignoffKey,
  isCurrentLegalApprovalEvidenceNote,
  isLaunchSignoffEvidenceUrl,
  requiresLaunchSignoffEvidenceNote,
  type LaunchSignoffRow,
} from "@/lib/launch-signoffs";
import { CURRENT_TERMS_VERSION } from "@/lib/consent";
import {
  getOperatorPolicyLaunchReadiness,
  loadOperatorPolicy,
} from "@/lib/operator-policy";
import {
  normalizeWithdrawalNetwork,
  normalizeWithdrawalTxHash,
  parseWithdrawalAmount,
} from "@/lib/withdrawals";

export type LaunchSignoffEvidenceStatus = {
  evidenceReady: boolean;
  evidenceStatus: string;
};

type DepositEvidenceRequirement = {
  network: "trc20" | "erc20";
  label: string;
};

const DEPOSIT_PAYMENT_SIGNOFFS: Record<string, DepositEvidenceRequirement> = {
  real_usdt_trc20_deposit_test: { network: "trc20", label: "TRC20 deposit" },
  real_usdt_erc20_deposit_test: { network: "erc20", label: "ERC20 deposit" },
};

const WITHDRAWAL_PAYMENT_SIGNOFF_KEY = "real_usdt_withdrawal_payout_test";

export async function attachLaunchSignoffEvidenceStatuses(
  supabase: SupabaseClient,
  signoffs: LaunchSignoffRow[],
): Promise<LaunchSignoffRow[]> {
  const statuses = await Promise.all(
    signoffs.map((signoff) => getLaunchSignoffEvidenceStatus(supabase, signoff)),
  );

  return signoffs.map((signoff, index) => ({
    ...signoff,
    ...statuses[index],
  }));
}

export async function getLaunchSignoffEvidenceStatus(
  supabase: SupabaseClient,
  signoff: LaunchSignoffRow,
): Promise<LaunchSignoffEvidenceStatus> {
  const evidenceNoteStatus = getMissingEvidenceNoteStatus(signoff);
  const evidenceUrlStatus = getInvalidEvidenceUrlStatus(signoff);
  const depositRequirement = DEPOSIT_PAYMENT_SIGNOFFS[signoff.key];

  if (evidenceUrlStatus) {
    return evidenceUrlStatus;
  }

  if (depositRequirement) {
    if (evidenceNoteStatus) {
      return evidenceNoteStatus;
    }

    return getDepositEvidenceStatus(supabase, depositRequirement.network, depositRequirement.label);
  }

  if (signoff.key === WITHDRAWAL_PAYMENT_SIGNOFF_KEY) {
    if (evidenceNoteStatus) {
      return evidenceNoteStatus;
    }

    return getWithdrawalEvidenceStatus(supabase);
  }

  if (signoff.key === "operator_policy_review") {
    const policyReadiness = getOperatorPolicyLaunchReadiness(await loadOperatorPolicy(supabase));

    if (signoff.status === "completed" && !signoff.evidenceUrl) {
      return {
        evidenceReady: false,
        evidenceStatus: "Operator approval evidence URL must be recorded.",
      };
    }

    if (!policyReadiness.ready) {
      return {
        evidenceReady: false,
        evidenceStatus: `Operator policy is missing ${policyReadiness.missing.join(", ")}.`,
      };
    }

    if (evidenceNoteStatus) {
      return evidenceNoteStatus;
    }

    return {
      evidenceReady: true,
      evidenceStatus: signoff.status === "completed"
        ? "Operator policy launch gate and approval evidence URL are ready."
        : "Operator policy launch gate is ready.",
    };
  }

  if (signoff.key === "legal_compliance_review") {
    if (signoff.status === "completed" && !signoff.evidenceUrl) {
      return {
        evidenceReady: false,
        evidenceStatus: `Approval evidence URL must be recorded for Terms/Privacy version ${CURRENT_TERMS_VERSION}.`,
      };
    }

    if (signoff.status === "completed") {
      if (evidenceNoteStatus) {
        return evidenceNoteStatus;
      }

      if (!isCurrentLegalApprovalEvidenceNote(signoff.evidenceNote ?? "")) {
        return {
          evidenceReady: false,
          evidenceStatus: getCurrentLegalApprovalEvidenceNoteRequirement(),
        };
      }

      return {
        evidenceReady: true,
        evidenceStatus: `Manual legal approval evidence note and URL are recorded for Terms/Privacy version ${CURRENT_TERMS_VERSION}.`,
      };
    }

    return {
      evidenceReady: false,
      evidenceStatus: `Manual legal approval evidence must be recorded by an operator for Terms/Privacy version ${CURRENT_TERMS_VERSION}.`,
    };
  }

  if (
    signoff.status === "completed" &&
    isApprovalEvidenceUrlRequiredLaunchSignoffKey(signoff.key) &&
    !signoff.evidenceUrl
  ) {
    return {
      evidenceReady: false,
      evidenceStatus: "Approval evidence URL must be recorded.",
    };
  }

  if (evidenceNoteStatus) {
    return evidenceNoteStatus;
  }

  if (signoff.status === "completed" || signoff.status === "waived") {
    return {
      evidenceReady: true,
      evidenceStatus: "Manual approval evidence note and URL are recorded.",
    };
  }

  return {
    evidenceReady: false,
    evidenceStatus: "Manual approval evidence must be recorded by an operator.",
  };
}

function getMissingEvidenceNoteStatus(signoff: LaunchSignoffRow): LaunchSignoffEvidenceStatus | null {
  if (!requiresLaunchSignoffEvidenceNote(signoff.status) || signoff.evidenceNote?.trim()) {
    return null;
  }

  return {
    evidenceReady: false,
    evidenceStatus: getLaunchSignoffEvidenceNoteRequirement(),
  };
}

function getInvalidEvidenceUrlStatus(signoff: LaunchSignoffRow): LaunchSignoffEvidenceStatus | null {
  if (!signoff.evidenceUrl || isLaunchSignoffEvidenceUrl(signoff.evidenceUrl)) {
    return null;
  }

  return {
    evidenceReady: false,
    evidenceStatus: getLaunchSignoffEvidenceUrlRequirement(),
  };
}

export async function getVerifiedDepositEvidenceStatus(
  supabase: SupabaseClient,
  network: "trc20" | "erc20",
  label: string,
): Promise<LaunchSignoffEvidenceStatus> {
  const claims = await supabase
    .from("worldcup_deposit_claims")
    .select("id,amount,currency,tx_hash,credited_at,worldcup_deposit_id")
    .eq("network", network)
    .eq("status", "credited")
    .not("credited_at", "is", null)
    .not("worldcup_deposit_id", "is", null)
    .neq("tx_hash", "")
    .order("credited_at", { ascending: false })
    .limit(50);

  if (claims.error) {
    return {
      evidenceReady: false,
      evidenceStatus: `Could not verify ${label} sign-off evidence.`,
    };
  }

  const depositIds = Array.from(
    new Set(
      ((claims.data ?? []) as Array<{ worldcup_deposit_id: string | null }>)
        .map((claim) => claim.worldcup_deposit_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (depositIds.length === 0) {
    return {
      evidenceReady: false,
      evidenceStatus: `No credited ${network.toUpperCase()} deposit claim linked to a wallet deposit exists yet.`,
    };
  }

  const proof = await supabase
    .from("worldcup_deposits")
    .select("id,amount,currency,credited_at,external_id,raw")
    .in("id", depositIds)
    .eq("provider", "kucoin")
    .eq("status", "credited")
    .eq("raw->kucoinMainVerification->>status", "matched")
    .eq("raw->kucoinMainVerification->>network", network)
    .order("credited_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (proof.error) {
    return {
      evidenceReady: false,
      evidenceStatus: `Could not verify server-side KuCoin evidence for ${label}.`,
    };
  }

  if (!proof.data) {
    return {
      evidenceReady: false,
      evidenceStatus: `A credited ${network.toUpperCase()} deposit claim exists, but its linked wallet deposit does not have server-side KuCoin verification yet.`,
    };
  }

  const proofDeposit = proof.data as {
    id: string;
    amount: string | number;
    currency: string | null;
    credited_at: string | null;
    external_id: string | null;
    raw: Record<string, unknown> | null;
  };
  const proofClaim = ((claims.data ?? []) as Array<{
    id: string;
    amount: string | number;
    currency: string | null;
    tx_hash: string;
    credited_at: string | null;
    worldcup_deposit_id: string | null;
  }>).find((claim) => claim.worldcup_deposit_id === proofDeposit.id);

  if (!proofClaim) {
    return {
      evidenceReady: false,
      evidenceStatus: `Server-side KuCoin evidence for ${label} is missing the linked deposit claim.`,
    };
  }

  const proofCurrency = String(proofDeposit.currency ?? "").toUpperCase();
  const claimCurrency = String(proofClaim.currency ?? "").toUpperCase();

  if (proofCurrency !== "USDT" || claimCurrency !== "USDT") {
    return {
      evidenceReady: false,
      evidenceStatus: `Server-side KuCoin evidence for ${label} must be denominated in USDT.`,
    };
  }

  if (proofDeposit.external_id !== proofClaim.tx_hash) {
    return {
      evidenceReady: false,
      evidenceStatus: `Server-side KuCoin evidence for ${label} does not match the credited claim transaction hash.`,
    };
  }

  if (
    proofDeposit.raw?.source !== "manual_shared_address_claim" ||
    proofDeposit.raw?.claimId !== proofClaim.id ||
    !amountsMatch(proofDeposit.raw?.amountCredited, proofDeposit.amount)
  ) {
    return {
      evidenceReady: false,
      evidenceStatus: `Server-side KuCoin evidence for ${label} is missing the deposit claim audit link.`,
    };
  }

  const amount = proofDeposit.amount;
  const currency = proofDeposit.currency ?? "USDT";
  const creditedAt = proofClaim.credited_at ?? proofDeposit.credited_at;
  const txHash = proofClaim.tx_hash;
  const claimPart = `claim ${proofClaim.id}`;
  const creditedPart = creditedAt ? ` credited ${creditedAt}` : "";

  return {
    evidenceReady: true,
    evidenceStatus: `Credited ${network.toUpperCase()} deposit proof ready: ${claimPart}, deposit ${proofDeposit.id}, ${amount} ${currency}, tx ${txHash}.${creditedPart}`,
  };
}

function amountsMatch(left: unknown, right: unknown): boolean {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  return Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
    ? Math.round(leftNumber * 1e8) === Math.round(rightNumber * 1e8)
    : false;
}

async function getDepositEvidenceStatus(
  supabase: SupabaseClient,
  network: "trc20" | "erc20",
  label: string,
): Promise<LaunchSignoffEvidenceStatus> {
  return getVerifiedDepositEvidenceStatus(supabase, network, label);
}

export async function getVerifiedWithdrawalEvidenceStatus(
  supabase: SupabaseClient,
): Promise<LaunchSignoffEvidenceStatus> {
  const proof = await supabase
    .from("worldcup_withdrawal_requests")
    .select("id,network,amount,currency,paid_at,external_tx_hash,wallet_transaction_id,raw")
    .eq("status", "paid")
    .not("paid_at", "is", null)
    .not("external_tx_hash", "is", null)
    .not("wallet_transaction_id", "is", null)
    .neq("external_tx_hash", "")
    .eq("raw->payoutEvidence->>launchReady", "true")
    .eq("raw->payoutEvidence->>source", "manual_external_transfer")
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (proof.error) {
    return {
      evidenceReady: false,
      evidenceStatus: "Could not verify withdrawal payout sign-off evidence.",
    };
  }

  if (!proof.data) {
    return {
      evidenceReady: false,
      evidenceStatus: "No paid withdrawal request marked as real launch payout evidence exists yet.",
    };
  }

  const withdrawal = proof.data as {
    id: string;
    network: string;
    amount: string | number;
    currency: string | null;
    paid_at: string | null;
    external_tx_hash: string;
    wallet_transaction_id: string | null;
    raw: Record<string, unknown> | null;
  };
  const network = normalizeWithdrawalNetwork(withdrawal.network);
  const normalizedTxHash = network
    ? normalizeWithdrawalTxHash(network, withdrawal.external_tx_hash)
    : null;

  if (!network) {
    return {
      evidenceReady: false,
      evidenceStatus: "Withdrawal payout evidence must use a supported USDT network.",
    };
  }

  if (!normalizedTxHash || normalizedTxHash !== withdrawal.external_tx_hash) {
    return {
      evidenceReady: false,
      evidenceStatus: `Withdrawal payout evidence for ${network.toUpperCase()} must include a normalized network-valid transaction hash.`,
    };
  }

  if (String(withdrawal.currency ?? "").toUpperCase() !== "USDT") {
    return {
      evidenceReady: false,
      evidenceStatus: "Withdrawal payout evidence must be denominated in USDT.",
    };
  }

  if (parseWithdrawalAmount(withdrawal.amount) === null) {
    return {
      evidenceReady: false,
      evidenceStatus: "Withdrawal payout evidence must include a positive USDT amount.",
    };
  }

  const payoutEvidence =
    withdrawal.raw?.payoutEvidence && typeof withdrawal.raw.payoutEvidence === "object"
      ? (withdrawal.raw.payoutEvidence as Record<string, unknown> & {
          source?: unknown;
          recordedAt?: unknown;
          recordedBy?: unknown;
        })
      : null;

  if (
    payoutEvidence?.source !== "manual_external_transfer" ||
    typeof payoutEvidence.recordedAt !== "string" ||
    typeof payoutEvidence.recordedBy !== "string"
  ) {
    return {
      evidenceReady: false,
      evidenceStatus: "Withdrawal payout evidence is missing the admin payout audit link.",
    };
  }

  if (
    !payoutEvidenceMatchesWithdrawal(payoutEvidence, {
      id: withdrawal.id,
      walletTransactionId: withdrawal.wallet_transaction_id,
      network,
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      externalTxHash: withdrawal.external_tx_hash,
    })
  ) {
    return {
      evidenceReady: false,
      evidenceStatus: "Withdrawal payout evidence does not match the paid withdrawal audit fields.",
    };
  }

  const paidPart = withdrawal.paid_at ? ` paid ${withdrawal.paid_at}` : "";

  return {
    evidenceReady: true,
    evidenceStatus: `Paid ${network.toUpperCase()} withdrawal proof ready: withdrawal ${withdrawal.id}, wallet debit ${withdrawal.wallet_transaction_id}, ${withdrawal.amount} ${withdrawal.currency ?? "USDT"}, tx ${withdrawal.external_tx_hash}.${paidPart}`,
  };
}

async function getWithdrawalEvidenceStatus(
  supabase: SupabaseClient,
): Promise<LaunchSignoffEvidenceStatus> {
  return getVerifiedWithdrawalEvidenceStatus(supabase);
}

function payoutEvidenceMatchesWithdrawal(
  payoutEvidence: Record<string, unknown>,
  withdrawal: {
    id: string;
    walletTransactionId: string | null;
    network: "trc20" | "erc20";
    amount: string | number;
    currency: string | null;
    externalTxHash: string;
  },
): boolean {
  return (
    payoutEvidence.withdrawalId === withdrawal.id &&
    payoutEvidence.walletTransactionId === withdrawal.walletTransactionId &&
    payoutEvidence.network === withdrawal.network &&
    amountsMatch(payoutEvidence.amount, withdrawal.amount) &&
    String(payoutEvidence.currency ?? "").toUpperCase() ===
      String(withdrawal.currency ?? "").toUpperCase() &&
    payoutEvidence.externalTxHash === withdrawal.externalTxHash
  );
}
