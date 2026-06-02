import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { CANONICAL_ORIGIN } from "@/lib/canonical-url";
import { CURRENT_TERMS_VERSION } from "@/lib/consent";
import { getDeploymentEvidence } from "@/lib/deployment-evidence";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { attachLaunchSignoffEvidenceStatuses } from "@/lib/launch-signoff-evidence";
import { loadLaunchSignoffs } from "@/lib/launch-signoffs";
import { formatOperatorPolicy, loadOperatorPolicy } from "@/lib/operator-policy";
import { getPaidActionLaunchEvidenceProbe } from "@/lib/paid-action-gates";
import { buildProductionReadinessReport } from "@/lib/production-readiness";
import { createServiceSupabaseClient } from "@/lib/supabase";

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

  const [readiness, operatorPolicy, signoffs, paidActionEvidence] = await Promise.all([
    buildProductionReadinessReport(supabase),
    loadOperatorPolicy(supabase),
    attachLaunchSignoffEvidenceStatuses(supabase, await loadLaunchSignoffs(supabase)),
    getPaidActionLaunchEvidenceProbe(supabase),
  ]);

  const warnings = readiness.checks
    .filter((check) => check.status === "warning")
    .map(({ id, label, category, detail, action }) => ({ id, label, category, detail, action }));
  const failures = readiness.checks
    .filter((check) => check.status === "fail")
    .map(({ id, label, category, detail, action }) => ({ id, label, category, detail, action }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    generatedBy: auth.adminEmail ?? "break-glass-admin",
    deployment: getDeploymentEvidence(),
    readiness: {
      generatedAt: readiness.generatedAt,
      overallStatus: readiness.overallStatus,
      summary: readiness.summary,
      warnings,
      failures,
      nextActions: readiness.nextActions,
    },
    operatorPolicy: formatOperatorPolicy(operatorPolicy),
    paidActionEvidence,
    legal: {
      currentTermsVersion: CURRENT_TERMS_VERSION,
      termsUrl: `${CANONICAL_ORIGIN}/terms`,
      privacyUrl: `${CANONICAL_ORIGIN}/privacy`,
    },
    signoffs: signoffs.map((signoff) => ({
      key: signoff.key,
      label: signoff.label,
      category: signoff.category,
      status: signoff.status,
      evidenceReady: Boolean(signoff.evidenceReady),
      evidenceStatus: signoff.evidenceStatus ?? null,
      evidenceRequirement: signoff.evidenceRequirement,
      evidenceActionLabel: signoff.evidenceActionLabel,
      evidenceTarget: signoff.evidenceTarget,
      evidenceNotePresent: Boolean(signoff.evidenceNote?.trim()),
      evidenceUrlPresent: Boolean(signoff.evidenceUrl?.trim()),
      evidenceUrl: signoff.evidenceUrl ?? null,
      updatedAt: signoff.updatedAt,
      updatedBy: signoff.updatedBy,
    })),
  });
}
