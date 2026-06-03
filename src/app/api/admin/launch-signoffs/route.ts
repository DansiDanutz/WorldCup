import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import {
  attachLaunchSignoffEvidenceStatuses,
  getVerifiedDepositEvidenceStatus,
  getVerifiedWithdrawalEvidenceStatus,
} from "@/lib/launch-signoff-evidence";
import {
  buildLaunchSignoffAuditContext,
  getCurrentLegalApprovalEvidenceNoteRequirement,
  getLaunchSignoffEvidenceNoteRequirement,
  getLaunchSignoffEvidenceUrlRequirement,
  isApprovalEvidenceUrlRequiredLaunchSignoffKey,
  isCurrentLegalApprovalEvidenceNote,
  isLaunchSignoffEvidenceUrl,
  isNonWaivableLaunchSignoffKey,
  isPaymentLaunchSignoffKey,
  isLaunchSignoffKey,
  loadLaunchSignoffs,
  normalizeLaunchSignoffStatus,
  requiresLaunchSignoffEvidenceNote,
} from "@/lib/launch-signoffs";
import {
  getOperatorPolicyLaunchReadiness,
  loadOperatorPolicy,
  type OperatorPolicy,
} from "@/lib/operator-policy";
import { createServiceSupabaseClient } from "@/lib/supabase";

const DEPOSIT_PAYMENT_SIGNOFFS: Record<string, { network: "trc20" | "erc20"; label: string }> = {
  real_usdt_trc20_deposit_test: { network: "trc20", label: "TRC20 deposit sign-off" },
  real_usdt_erc20_deposit_test: { network: "erc20", label: "ERC20 deposit sign-off" },
};

const WITHDRAWAL_PAYMENT_SIGNOFF_KEY = "real_usdt_withdrawal_payout_test";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const signoffs = await attachLaunchSignoffEvidenceStatuses(
    supabase,
    await loadLaunchSignoffs(supabase),
  );

  return NextResponse.json({ signoffs });
}

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

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return jsonError("Request body must be an object.", 400);
  }

  const input = body as {
    key?: unknown;
    status?: unknown;
    evidenceNote?: unknown;
    evidenceUrl?: unknown;
  };
  const key = typeof input.key === "string" ? input.key.trim() : "";

  if (!isLaunchSignoffKey(key)) {
    return jsonError("Unknown launch sign-off key.", 400);
  }

  const status = normalizeLaunchSignoffStatus(input.status);
  const evidenceNote =
    typeof input.evidenceNote === "string" ? input.evidenceNote.trim() : "";
  const evidenceUrl =
    typeof input.evidenceUrl === "string" ? input.evidenceUrl.trim() : "";

  if (requiresLaunchSignoffEvidenceNote(status) && !evidenceNote) {
    return jsonError(getLaunchSignoffEvidenceNoteRequirement(), 400);
  }

  if (status === "waived" && isNonWaivableLaunchSignoffKey(key)) {
    return jsonError(getNonWaivableSignoffMessage(key), 400);
  }

  if (evidenceUrl && !isLaunchSignoffEvidenceUrl(evidenceUrl)) {
    return jsonError(getLaunchSignoffEvidenceUrlRequirement(), 400);
  }

  if (
    status === "completed" &&
    isApprovalEvidenceUrlRequiredLaunchSignoffKey(key) &&
    !evidenceUrl
  ) {
    return jsonError(
      "Evidence URL is required for completed operator, legal, and compliance approval sign-offs.",
      400,
    );
  }

  if (
    key === "legal_compliance_review" &&
    status === "completed" &&
    !isCurrentLegalApprovalEvidenceNote(evidenceNote)
  ) {
    return jsonError(getCurrentLegalApprovalEvidenceNoteRequirement(), 400);
  }

  let operatorPolicy: OperatorPolicy | null = null;

  if (key === "operator_policy_review" && status === "completed") {
    operatorPolicy = await loadOperatorPolicy(supabase);
    const policyReadiness = getOperatorPolicyLaunchReadiness(operatorPolicy);

    if (!policyReadiness.ready) {
      return jsonError(
        `Operator policy review cannot be completed until ${policyReadiness.missing.join(", ")} ${policyReadiness.missing.length === 1 ? "is" : "are"} configured.`,
        400,
      );
    }
  }

  let paymentEvidenceStatus: { evidenceReady: boolean; evidenceStatus: string } | null = null;

  if (status === "completed") {
    paymentEvidenceStatus = await getPaymentSignoffEvidenceStatus(supabase, key);

    if (
      paymentEvidenceStatus &&
      !paymentEvidenceStatus.evidenceReady &&
      paymentEvidenceStatus.evidenceStatus.startsWith("Could not verify")
    ) {
      return jsonError(paymentEvidenceStatus.evidenceStatus, 500);
    }

    if (paymentEvidenceStatus && !paymentEvidenceStatus.evidenceReady) {
      return jsonError(paymentEvidenceStatus.evidenceStatus, 400);
    }
  }

  const updatedAt = new Date().toISOString();
  const result = await supabase
    .from("worldcup_launch_signoffs")
    .upsert(
      {
        key,
        status,
        evidence_note: evidenceNote || null,
        evidence_url: evidenceUrl || null,
        updated_at: updatedAt,
        updated_by: auth.adminEmail ?? "break-glass-admin",
        raw: buildLaunchSignoffAuditContext({
          key,
          status,
          via: auth.via,
          capturedAt: updatedAt,
          paymentEvidenceStatus,
          operatorPolicy,
        }),
      },
      { onConflict: "key" },
    )
    .select("key")
    .single();

  if (result.error) {
    return jsonError("Could not save the launch sign-off.", 500);
  }

  const signoffs = await attachLaunchSignoffEvidenceStatuses(
    supabase,
    await loadLaunchSignoffs(supabase),
  );

  return NextResponse.json({ signoffs });
}

function getNonWaivableSignoffMessage(key: string) {
  if (isPaymentLaunchSignoffKey(key)) {
    return "Real USDT payment test sign-offs cannot be waived. Complete the live test evidence instead.";
  }

  if (key === "operator_policy_review") {
    return "Operator policy review cannot be waived for production launch. Complete the policy gate and record approval evidence instead.";
  }

  return "Legal and compliance review cannot be waived for production launch. Record completed approval evidence instead.";
}

async function getPaymentSignoffEvidenceStatus(
  supabase: any,
  key: string,
): Promise<{ evidenceReady: boolean; evidenceStatus: string } | null> {
  const depositRequirement = DEPOSIT_PAYMENT_SIGNOFFS[key];

  if (depositRequirement) {
    return getVerifiedDepositEvidenceStatus(
      supabase,
      depositRequirement.network,
      depositRequirement.label,
    );
  }

  if (key === WITHDRAWAL_PAYMENT_SIGNOFF_KEY) {
    return getVerifiedWithdrawalEvidenceStatus(supabase);
  }

  return null;
}
