import type { SupabaseClient } from "@supabase/supabase-js";

import { CURRENT_TERMS_VERSION } from "@/lib/consent";
import type { OperatorPolicy } from "@/lib/operator-policy";

export const LAUNCH_SIGNOFF_STATUSES = ["pending", "completed", "waived"] as const;

export type LaunchSignoffStatus = (typeof LAUNCH_SIGNOFF_STATUSES)[number];

export type LaunchSignoffDefinition = {
  key: string;
  label: string;
  category: "payments" | "operations" | "compliance";
  detail: string;
};

export type LaunchSignoffEvidenceTarget =
  | "deposit_claims"
  | "withdrawal_requests"
  | "operator_policy"
  | "legal_review";

export type LaunchSignoffEvidenceGuidance = {
  evidenceTarget: LaunchSignoffEvidenceTarget;
  evidenceActionLabel: string;
  evidenceRequirement: string;
};

export type LaunchSignoffRow = LaunchSignoffDefinition & {
  evidenceTarget: LaunchSignoffEvidenceTarget;
  evidenceActionLabel: string;
  evidenceRequirement: string;
  status: LaunchSignoffStatus;
  evidenceNote: string | null;
  evidenceUrl: string | null;
  updatedAt: string | null;
  updatedBy: string;
  raw: Record<string, unknown>;
  evidenceReady?: boolean;
  evidenceStatus?: string;
};

export type LaunchSignoffAuditContextInput = {
  key: string;
  status: LaunchSignoffStatus;
  via: string;
  capturedAt: string;
  paymentEvidenceStatus?: { evidenceReady: boolean; evidenceStatus: string } | null;
  operatorPolicy?: OperatorPolicy | null;
};

type StoredLaunchSignoff = {
  key: string;
  status: string | null;
  evidence_note: string | null;
  evidence_url: string | null;
  updated_at: string | null;
  updated_by: string | null;
  raw: Record<string, unknown> | null;
};

export const REQUIRED_LAUNCH_SIGNOFFS: LaunchSignoffDefinition[] = [
  {
    key: "real_usdt_trc20_deposit_test",
    label: "Real USDT TRC20 deposit test",
    category: "payments",
    detail: "Send a small real TRC20 USDT deposit, submit the claim, verify it, and credit the wallet.",
  },
  {
    key: "real_usdt_erc20_deposit_test",
    label: "Real USDT ERC20 deposit test",
    category: "payments",
    detail: "Send a small real ERC20 USDT deposit, submit the claim, verify it, and credit the wallet.",
  },
  {
    key: "real_usdt_withdrawal_payout_test",
    label: "Real USDT withdrawal payout test",
    category: "payments",
    detail: "Request a small payout, approve it, send the external transfer, and record the payout hash.",
  },
  {
    key: "operator_policy_review",
    label: "Operator policy review",
    category: "operations",
    detail: "Confirm country policy plus deposit and withdrawal caps are ready for launch.",
  },
  {
    key: "legal_compliance_review",
    label: "Legal and compliance review",
    category: "compliance",
    detail: "Confirm Terms, Privacy, eligibility, and operational compliance are approved for production.",
  },
];

export const PAYMENT_LAUNCH_SIGNOFF_KEYS = [
  "real_usdt_trc20_deposit_test",
  "real_usdt_erc20_deposit_test",
  "real_usdt_withdrawal_payout_test",
] as const;

export const NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS = [
  ...PAYMENT_LAUNCH_SIGNOFF_KEYS,
  "operator_policy_review",
  "legal_compliance_review",
] as const;

export const APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS = [
  "operator_policy_review",
  "legal_compliance_review",
] as const;

const requiredByKey = new Map(REQUIRED_LAUNCH_SIGNOFFS.map((definition) => [definition.key, definition]));
const paymentSignoffKeys = new Set<string>(PAYMENT_LAUNCH_SIGNOFF_KEYS);
const nonWaivableSignoffKeys = new Set<string>(NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS);
const approvalEvidenceUrlRequiredSignoffKeys = new Set<string>(
  APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS,
);

export function isLaunchSignoffKey(key: string): boolean {
  return requiredByKey.has(key);
}

export function isPaymentLaunchSignoffKey(key: string): boolean {
  return paymentSignoffKeys.has(key);
}

export function isNonWaivableLaunchSignoffKey(key: string): boolean {
  return nonWaivableSignoffKeys.has(key);
}

export function isApprovalEvidenceUrlRequiredLaunchSignoffKey(key: string): boolean {
  return approvalEvidenceUrlRequiredSignoffKeys.has(key);
}

export function normalizeLaunchSignoffStatus(value: unknown): LaunchSignoffStatus {
  return LAUNCH_SIGNOFF_STATUSES.includes(value as LaunchSignoffStatus)
    ? (value as LaunchSignoffStatus)
    : "pending";
}

export function requiresLaunchSignoffEvidenceNote(status: LaunchSignoffStatus): boolean {
  return status === "completed" || status === "waived";
}

export function getLaunchSignoffEvidenceNoteRequirement(): string {
  return "Evidence note is required for completed or waived launch sign-offs.";
}

export function isLaunchSignoffEvidenceUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function getLaunchSignoffEvidenceUrlRequirement(): string {
  return "Evidence URL must be a valid https:// URL.";
}

export function isCurrentLegalApprovalEvidenceNote(evidenceNote: string): boolean {
  return evidenceNote.includes(CURRENT_TERMS_VERSION);
}

export function getCurrentLegalApprovalEvidenceNoteRequirement(): string {
  return `Evidence note must include Terms/Privacy version ${CURRENT_TERMS_VERSION}.`;
}

export function getLaunchSignoffEvidenceGuidance(key: string): LaunchSignoffEvidenceGuidance {
  if (key === "real_usdt_trc20_deposit_test") {
    return {
      evidenceTarget: "deposit_claims",
      evidenceActionLabel: "Open Deposit Claims",
      evidenceRequirement:
        "A credited TRC20 deposit claim linked to a KuCoin-verified wallet deposit, with claim id, deposit id, tx hash, credited amount, and credited time.",
    };
  }

  if (key === "real_usdt_erc20_deposit_test") {
    return {
      evidenceTarget: "deposit_claims",
      evidenceActionLabel: "Open Deposit Claims",
      evidenceRequirement:
        "A credited ERC20 deposit claim linked to a KuCoin-verified wallet deposit, with claim id, deposit id, tx hash, credited amount, and credited time.",
    };
  }

  if (key === "real_usdt_withdrawal_payout_test") {
    return {
      evidenceTarget: "withdrawal_requests",
      evidenceActionLabel: "Open Withdrawal Requests",
      evidenceRequirement:
        "A paid withdrawal request marked as real launch payout evidence, with withdrawal id, wallet debit id, payout tx hash, amount, and paid time.",
    };
  }

  if (key === "operator_policy_review") {
    return {
      evidenceTarget: "operator_policy",
      evidenceActionLabel: "Open Operator Policy",
      evidenceRequirement:
        "Saved operator policy with country rules, deposit cap, withdrawal cap, reviewer note, and HTTPS approval evidence URL.",
    };
  }

  return {
    evidenceTarget: "legal_review",
    evidenceActionLabel: "Open Legal Evidence",
    evidenceRequirement: `Manual legal/compliance approval for Terms/Privacy version ${CURRENT_TERMS_VERSION}, with HTTPS evidence URL and a note that includes that version.`,
  };
}

export function buildLaunchSignoffAuditContext({
  key,
  status,
  via,
  capturedAt,
  paymentEvidenceStatus,
  operatorPolicy,
}: LaunchSignoffAuditContextInput): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    via,
    capturedAt,
  };

  if (status !== "completed") {
    return raw;
  }

  if (paymentEvidenceStatus) {
    raw.launchEvidence = {
      kind: "payment",
      status: paymentEvidenceStatus.evidenceStatus,
    };
  }

  if (key === "operator_policy_review" && operatorPolicy) {
    raw.launchEvidence = {
      kind: "operator_policy",
      policy: {
        allowedCountries: operatorPolicy.allowedCountries,
        blockedCountries: operatorPolicy.blockedCountries,
        maxDepositClaimAmount: operatorPolicy.maxDepositClaimAmount,
        maxDailyDepositClaimAmount: operatorPolicy.maxDailyDepositClaimAmount,
        maxWithdrawalRequestAmount: operatorPolicy.maxWithdrawalRequestAmount,
        maxDailyWithdrawalRequestAmount: operatorPolicy.maxDailyWithdrawalRequestAmount,
        source: operatorPolicy.source,
        updatedAt: operatorPolicy.updatedAt,
        updatedBy: operatorPolicy.updatedBy,
      },
    };
  }

  if (key === "legal_compliance_review") {
    raw.launchEvidence = {
      kind: "legal_compliance",
      termsVersion: CURRENT_TERMS_VERSION,
    };
  }

  return raw;
}

export function formatLaunchSignoff(
  definition: LaunchSignoffDefinition,
  row?: StoredLaunchSignoff,
): LaunchSignoffRow {
  return {
    ...definition,
    ...getLaunchSignoffEvidenceGuidance(definition.key),
    status: normalizeLaunchSignoffStatus(row?.status),
    evidenceNote: row?.evidence_note ?? null,
    evidenceUrl: row?.evidence_url ?? null,
    updatedAt: row?.updated_at ?? null,
    updatedBy: row?.updated_by ?? "system",
    raw: row?.raw ?? {},
  };
}

export async function loadLaunchSignoffs(supabase: SupabaseClient): Promise<LaunchSignoffRow[]> {
  const keys = REQUIRED_LAUNCH_SIGNOFFS.map((definition) => definition.key);
  const result = await supabase
    .from("worldcup_launch_signoffs")
    .select("key,status,evidence_note,evidence_url,updated_at,updated_by,raw")
    .in("key", keys);

  if (result.error) {
    throw result.error;
  }

  const rowsByKey = new Map(
    ((result.data ?? []) as StoredLaunchSignoff[]).map((row) => [row.key, row]),
  );

  return REQUIRED_LAUNCH_SIGNOFFS.map((definition) =>
    formatLaunchSignoff(definition, rowsByKey.get(definition.key)),
  );
}
