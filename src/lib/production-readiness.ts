import type { SupabaseClient } from "@supabase/supabase-js";

import { getAdminEmailAllowlist } from "@/lib/admin-auth";
import { CURRENT_TERMS_VERSION } from "@/lib/consent";
import { getConfiguredMainDepositAddresses, SUPPORTED_NETWORKS } from "@/lib/deposits";
import {
  getEnvironmentOperatorPolicy,
  loadOperatorPolicy,
  type OperatorPolicy,
} from "@/lib/operator-policy";
import { getLaunchSignoffEvidenceStatus } from "@/lib/launch-signoff-evidence";
import {
  isApprovalEvidenceUrlRequiredLaunchSignoffKey,
  isNonWaivableLaunchSignoffKey,
  isPaymentLaunchSignoffKey,
  loadLaunchSignoffs,
  type LaunchSignoffRow,
} from "@/lib/launch-signoffs";

export type ReadinessStatus = "pass" | "warning" | "fail";

export type ReadinessCheck = {
  id: string;
  label: string;
  category: "auth" | "database" | "payments" | "operations" | "compliance";
  status: ReadinessStatus;
  detail: string;
  action?: string;
};

export type ReadinessActionTarget = "readiness" | "policy" | "payments" | "signoffs";

export type ReadinessNextAction = {
  label: string;
  detail: string;
  action: string;
  status: Exclude<ReadinessStatus, "pass">;
  target: ReadinessActionTarget;
  ctaLabel: string;
};

export type ReadinessReport = {
  generatedAt: string;
  overallStatus: ReadinessStatus;
  summary: Record<ReadinessStatus, number>;
  checks: ReadinessCheck[];
  nextActions: ReadinessNextAction[];
};

type Env = Record<string, string | undefined>;

const REQUIRED_TABLES: Array<{ table: string; column: string; label: string }> = [
  { table: "worldcup_tournaments", column: "id", label: "Tournament table" },
  { table: "worldcup_teams", column: "id", label: "Teams table" },
  { table: "worldcup_matches", column: "id", label: "Matches table" },
  { table: "worldcup_entries", column: "id", label: "Entries table" },
  { table: "worldcup_referral_profiles", column: "user_id", label: "Referral profiles table" },
  { table: "worldcup_wallet_transactions", column: "id", label: "Wallet ledger table" },
  { table: "worldcup_deposit_claims", column: "id", label: "Deposit claims table" },
  { table: "worldcup_responsible_play_settings", column: "user_id", label: "Responsible play table" },
  { table: "worldcup_withdrawal_requests", column: "id", label: "Withdrawal requests table" },
  { table: "worldcup_operator_policy", column: "singleton_id", label: "Operator policy table" },
  { table: "worldcup_launch_signoffs", column: "key", label: "Launch sign-offs table" },
];

export function buildEnvironmentReadinessChecks(
  env: Env = process.env,
  policy: OperatorPolicy = getEnvironmentOperatorPolicy(env),
): ReadinessCheck[] {
  const checks: ReadinessCheck[] = [];
  const adminEmails = getAdminEmailAllowlist(env);
  const sharedAddresses = getConfiguredMainDepositAddresses(env);
  const brokerConfigured = hasAllEnv(env, [
    "KUCOIN_API_KEY",
    "KUCOIN_API_SECRET",
    "KUCOIN_API_PASSPHRASE",
    "KUCOIN_BROKER_NAME",
    "KUCOIN_BROKER_KEY",
  ]);
  const mainKucoinConfigured =
    hasAllEnv(env, ["KUCOIN_MAIN_API_KEY", "KUCOIN_MAIN_API_SECRET", "KUCOIN_MAIN_API_PASSPHRASE"]) ||
    hasAllEnv(env, ["KUCOIN_API_KEY", "KUCOIN_API_SECRET", "KUCOIN_API_PASSPHRASE"]);
  const allowedCountries = new Set(policy.allowedCountries);
  const blockedCountries = new Set(policy.blockedCountries);

  checks.push({
    id: "supabase-public-env",
    label: "Supabase public config",
    category: "database",
    status: hasAllEnv(env, ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) ? "pass" : "fail",
    detail: "Required for browser auth and public reads.",
    action: hasAllEnv(env, ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"])
      ? undefined
      : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
  });
  checks.push({
    id: "supabase-service-env",
    label: "Supabase service role",
    category: "database",
    status: hasAllEnv(env, ["SUPABASE_SERVICE_ROLE_KEY"]) ? "pass" : "fail",
    detail: "Required for admin, wallet, deposit, withdrawal, and cron writes.",
    action: hasAllEnv(env, ["SUPABASE_SERVICE_ROLE_KEY"])
      ? undefined
      : "Set SUPABASE_SERVICE_ROLE_KEY in Vercel production environment variables.",
  });
  checks.push({
    id: "admin-allowlist",
    label: "Admin email allowlist",
    category: "auth",
    status: adminEmails.length > 0 ? "pass" : "fail",
    detail: `${adminEmails.length} allowlisted admin email${adminEmails.length === 1 ? "" : "s"}.`,
    action: adminEmails.length > 0
      ? undefined
      : "Set ADMIN_EMAILS with the Google accounts allowed to manage production.",
  });
  checks.push({
    id: "admin-break-glass",
    label: "Admin break-glass secret",
    category: "auth",
    status: hasAllEnv(env, ["ADMIN_RESULT_SECRET"]) ? "pass" : "fail",
    detail: "Required for emergency admin access and production smoke checks.",
    action: hasAllEnv(env, ["ADMIN_RESULT_SECRET"])
      ? undefined
      : "Set ADMIN_RESULT_SECRET and keep it restricted to trusted operators.",
  });
  checks.push({
    id: "cron-secret",
    label: "Cron secret",
    category: "operations",
    status: hasAllEnv(env, ["CRON_SECRET"]) ? "pass" : "fail",
    detail: "Required to protect scheduled result ingestion endpoints.",
    action: hasAllEnv(env, ["CRON_SECRET"])
      ? undefined
      : "Set CRON_SECRET before enabling scheduled result ingestion.",
  });
  checks.push({
    id: "usdt-addressing",
    label: "USDT receive addresses",
    category: "payments",
    status: sharedAddresses.length === SUPPORTED_NETWORKS.length || brokerConfigured ? "pass" : "fail",
    detail:
      sharedAddresses.length === SUPPORTED_NETWORKS.length
        ? "Shared TRC20 and ERC20 receive addresses are configured."
        : brokerConfigured
          ? "KuCoin broker credentials are configured for per-user deposit addresses."
          : "Configure shared TRC20/ERC20 receive addresses or complete KuCoin broker credentials.",
    action: sharedAddresses.length === SUPPORTED_NETWORKS.length || brokerConfigured
      ? undefined
      : "Set both shared USDT receive addresses or complete KuCoin broker API credentials.",
  });
  checks.push({
    id: "kucoin-main-readonly",
    label: "KuCoin read-only verification",
    category: "payments",
    status: mainKucoinConfigured ? "pass" : "warning",
    detail: mainKucoinConfigured
      ? "Main-account read-only credentials are configured for admin deposit verification."
      : "Admins can still verify manually in KuCoin, but in-app KuCoin verification is not configured.",
    action: mainKucoinConfigured
      ? undefined
      : "Set KUCOIN_MAIN_API_KEY, KUCOIN_MAIN_API_SECRET, and KUCOIN_MAIN_API_PASSPHRASE for in-app verification.",
  });
  checks.push({
    id: "geo-policy",
    label: "Paid-action country policy",
    category: "compliance",
    status: allowedCountries.size > 0 || blockedCountries.size > 0 ? "pass" : "warning",
    detail:
      allowedCountries.size > 0 || blockedCountries.size > 0
        ? `${allowedCountries.size} allowed countr${allowedCountries.size === 1 ? "y" : "ies"}, ${blockedCountries.size} blocked (${policy.source}).`
        : "No country allowlist/blocklist is configured; new paid actions remain paused until Operator policy has a paid-action country policy.",
    action: allowedCountries.size > 0 || blockedCountries.size > 0
      ? undefined
      : "Open Operator policy and set allowed or blocked country codes.",
  });
  checks.push({
    id: "deposit-limits",
    label: "Deposit claim limits",
    category: "compliance",
    status:
      policy.maxDepositClaimAmount !== null || policy.maxDailyDepositClaimAmount !== null
        ? "pass"
        : "warning",
    detail:
      policy.maxDepositClaimAmount !== null || policy.maxDailyDepositClaimAmount !== null
        ? `Deposit guardrails are configured (${policy.source}).`
        : "No deposit claim cap is configured; USDT deposits remain paused until either a per-claim or rolling 24-hour deposit cap is set in Operator policy.",
    action:
      policy.maxDepositClaimAmount !== null || policy.maxDailyDepositClaimAmount !== null
        ? undefined
        : "Open Operator policy and set either max deposit claim or daily deposit cap.",
  });
  checks.push({
    id: "withdrawal-limits",
    label: "Withdrawal request limits",
    category: "compliance",
    status:
      policy.maxWithdrawalRequestAmount !== null || policy.maxDailyWithdrawalRequestAmount !== null
        ? "pass"
        : "warning",
    detail:
      policy.maxWithdrawalRequestAmount !== null || policy.maxDailyWithdrawalRequestAmount !== null
        ? `Withdrawal guardrails are configured (${policy.source}).`
        : "No withdrawal request cap is configured; withdrawal requests remain paused until either a per-request or rolling 24-hour withdrawal cap is set in Operator policy.",
    action:
      policy.maxWithdrawalRequestAmount !== null || policy.maxDailyWithdrawalRequestAmount !== null
        ? undefined
        : "Open Operator policy and set either max withdrawal request or daily withdrawal cap.",
  });

  return checks;
}

export async function buildProductionReadinessReport(
  supabase: SupabaseClient,
  env: Env = process.env,
): Promise<ReadinessReport> {
  const operatorPolicy = await loadOperatorPolicy(supabase, env);
  const checks = [
    ...buildEnvironmentReadinessChecks(env, operatorPolicy),
    ...(await buildDatabaseReadinessChecks(supabase)),
    ...(await buildLaunchSignoffReadinessChecks(supabase)),
    await buildSupabaseAuthReadinessCheck(env),
  ];
  const summary = countStatuses(checks);

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: summarizeReadiness(checks),
    summary,
    checks,
    nextActions: buildReadinessNextActions(checks, summary),
  };
}

export function buildReadinessNextActions(
  checks: ReadinessCheck[],
  summary: Record<ReadinessStatus, number> = countStatuses(checks),
): ReadinessNextAction[] {
  const openChecks = checks.filter((check) => check.status !== "pass");
  const openIds = new Set(openChecks.map((check) => check.id));
  const actions: ReadinessNextAction[] = [];

  if (openChecks.some((check) => check.status === "fail")) {
    actions.push({
      label: "Fix launch blockers",
      detail: `${summary.fail} blocker${summary.fail === 1 ? "" : "s"} must be fixed before any paid-action launch review.`,
      action: "Resolve every Fix row in Production readiness, then run Check again.",
      status: "fail",
      target: "readiness",
      ctaLabel: "Run Check",
    });
  }

  if (
    openIds.has("geo-policy") ||
    openIds.has("deposit-limits") ||
    openIds.has("withdrawal-limits") ||
    openIds.has("launch-signoff-operator_policy_review")
  ) {
    actions.push({
      label: "Complete Operator policy",
      detail:
        "Set country rules plus deposit and withdrawal caps, then record the operator review evidence URL.",
      action:
        "Load Policy, save the launch values, run Check, then complete Operator policy review with an evidence note and URL.",
      status: "warning",
      target: "policy",
      ctaLabel: "Load Policy",
    });
  }

  if (
    openIds.has("launch-signoff-real_usdt_trc20_deposit_test") ||
    openIds.has("launch-signoff-real_usdt_erc20_deposit_test") ||
    openIds.has("launch-signoff-real_usdt_withdrawal_payout_test")
  ) {
    actions.push({
      label: "Run real USDT tests",
      detail: "Prove TRC20 deposit, ERC20 deposit, and withdrawal payout with live wallet evidence.",
      action: "Use Wallet for the test user, verify in Deposit claims and Withdrawal requests, then load Sign-offs.",
      status: "warning",
      target: "payments",
      ctaLabel: "Load Payment Queues",
    });
  }

  if (openIds.has("launch-signoff-legal_compliance_review")) {
    actions.push({
      label: "Record legal approval",
      detail: `Terms/Privacy version ${CURRENT_TERMS_VERSION}, eligibility, and operating compliance need manual production approval evidence.`,
      action:
        `Complete the review for Terms/Privacy version ${CURRENT_TERMS_VERSION}, then save Legal and compliance review with an evidence note and URL.`,
      status: "warning",
      target: "signoffs",
      ctaLabel: "Load Sign-offs",
    });
  }

  return actions;
}

async function buildDatabaseReadinessChecks(supabase: SupabaseClient): Promise<ReadinessCheck[]> {
  const checks = await Promise.all(
    REQUIRED_TABLES.map(async ({ table, column, label }) => {
      const result = await supabase.from(table).select(column).limit(1);

      return {
        id: `table-${table}`,
        label,
        category: "database" as const,
        status: (result.error ? "fail" : "pass") as ReadinessStatus,
        detail: result.error ? `Could not read ${table}.` : `${table} is reachable.`,
        action: result.error ? `Apply the Supabase migration that creates ${table}.` : undefined,
      };
    }),
  );

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,status")
    .eq("slug", "fifa-world-cup-2026")
    .maybeSingle();

  checks.push({
    id: "tournament-seed",
    label: "WorldCup 2026 tournament seed",
    category: "database",
    status: tournament.error || !tournament.data ? "fail" : "pass",
    detail:
      tournament.error || !tournament.data
        ? "Tournament slug fifa-world-cup-2026 was not found."
        : `Tournament row exists with status ${tournament.data.status}.`,
    action:
      tournament.error || !tournament.data
        ? "Run the WorldCup seed or migration that creates the fifa-world-cup-2026 tournament row."
        : undefined,
  });

  return checks;
}

async function buildLaunchSignoffReadinessChecks(
  supabase: SupabaseClient,
): Promise<ReadinessCheck[]> {
  try {
    const signoffs = await loadLaunchSignoffs(supabase);
    const evidenceStatuses = await Promise.all(
      signoffs.map((signoff) => getLaunchSignoffEvidenceStatus(supabase, signoff)),
    );

    return signoffs.map((signoff, index) => {
      const evidenceStatus = evidenceStatuses[index];

      return {
        id: `launch-signoff-${signoff.key}`,
        label: signoff.label,
        category: signoff.category,
        status: launchSignoffReadinessStatus(signoff, evidenceStatus),
        detail: launchSignoffReadinessDetail(signoff, evidenceStatus),
        action: launchSignoffReadinessAction(signoff, evidenceStatus),
      };
    });
  } catch {
    return [
      {
        id: "launch-signoffs-load",
        label: "Launch sign-offs",
        category: "operations",
        status: "fail",
        detail: "Could not read worldcup_launch_signoffs.",
        action: "Apply the launch sign-offs migration and reload /admin.",
      },
    ];
  }
}

function launchSignoffReadinessStatus(
  signoff: LaunchSignoffRow,
  evidenceStatus: { evidenceReady: boolean },
): ReadinessStatus {
  if (signoff.status === "waived" && isPaymentLaunchSignoffKey(signoff.key)) {
    return "warning";
  }

  if (signoff.status === "waived" && isNonWaivableLaunchSignoffKey(signoff.key)) {
    return "warning";
  }

  if (signoff.status === "completed" && !evidenceStatus.evidenceReady) {
    return "warning";
  }

  return signoff.status === "pending" ? "warning" : "pass";
}

function launchSignoffReadinessDetail(
  signoff: LaunchSignoffRow,
  evidenceStatus: { evidenceReady: boolean; evidenceStatus: string },
): string {
  if (signoff.status === "pending") {
    return `${signoff.detail} Evidence is still pending. ${evidenceStatus.evidenceStatus}`;
  }

  if (signoff.status === "waived" && isPaymentLaunchSignoffKey(signoff.key)) {
    return `${signoff.detail} Real USDT payment tests cannot be waived for production launch.`;
  }

  if (signoff.status === "waived" && isNonWaivableLaunchSignoffKey(signoff.key)) {
    return `${signoff.detail} This launch sign-off cannot be waived for production launch.`;
  }

  if (!evidenceStatus.evidenceReady) {
    return `${signoff.detail} Saved sign-off needs attention. ${evidenceStatus.evidenceStatus}`;
  }

  const statusLabel = signoff.status === "waived" ? "Waived" : "Completed";
  const evidence = signoff.evidenceNote ? ` Evidence: ${signoff.evidenceNote}` : "";
  const updatedAt = signoff.updatedAt ? ` Updated ${new Date(signoff.updatedAt).toISOString()}.` : "";

  return `${statusLabel} by ${signoff.updatedBy}.${updatedAt}${evidence} ${evidenceStatus.evidenceStatus}`;
}

function launchSignoffReadinessAction(
  signoff: LaunchSignoffRow,
  evidenceStatus: { evidenceReady: boolean },
): string | undefined {
  if (signoff.status === "pending") {
    if (isPaymentLaunchSignoffKey(signoff.key)) {
      return evidenceStatus.evidenceReady
        ? "Open Launch sign-offs and record the evidence note for this completed real USDT test."
        : "Complete the real USDT test, then open Launch sign-offs and record the evidence.";
    }

    if (isApprovalEvidenceUrlRequiredLaunchSignoffKey(signoff.key)) {
      return evidenceStatus.evidenceReady
        ? "Open Launch sign-offs and record the approval evidence note and URL."
        : "Complete the required review, then open Launch sign-offs and record the approval evidence note and URL.";
    }

    return evidenceStatus.evidenceReady
      ? "Open Launch sign-offs and record the approval evidence note."
      : "Complete the required review, then open Launch sign-offs and record the approval evidence note.";
  }

  if (signoff.status === "waived" && isPaymentLaunchSignoffKey(signoff.key)) {
    return "Set this payment sign-off back to pending or completed with live USDT evidence.";
  }

  if (signoff.status === "waived" && isNonWaivableLaunchSignoffKey(signoff.key)) {
    return "Set this sign-off back to pending or completed with production approval evidence.";
  }

  if (!evidenceStatus.evidenceReady) {
    return isPaymentLaunchSignoffKey(signoff.key)
      ? "Complete the missing real USDT evidence, then reload Production readiness."
      : isApprovalEvidenceUrlRequiredLaunchSignoffKey(signoff.key)
        ? "Complete the missing approval evidence note and URL, then reload Production readiness."
        : "Complete the missing launch evidence note, then reload Production readiness.";
  }

  return undefined;
}

async function buildSupabaseAuthReadinessCheck(env: Env): Promise<ReadinessCheck> {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      id: "supabase-google-auth",
      label: "Supabase Google auth",
      category: "auth",
      status: "fail",
      detail: "Missing Supabase public URL or anon key.",
      action: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    };
  }

  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey },
      cache: "no-store",
    });
    const settings = (await response.json()) as {
      external?: { google?: boolean; email?: boolean };
    };
    const googleEnabled = settings.external?.google === true;
    const emailEnabled = settings.external?.email === true;

    return {
      id: "supabase-google-auth",
      label: "Supabase Google auth",
      category: "auth",
      status: googleEnabled && !emailEnabled ? "pass" : "fail",
      detail: googleEnabled
        ? emailEnabled
          ? "Google is enabled, but email provider is also enabled."
          : "Google provider is enabled and email provider is disabled."
        : "Google provider is not enabled.",
      action:
        googleEnabled && !emailEnabled
          ? undefined
          : "In Supabase Auth providers, enable Google and disable email/password login.",
    };
  } catch {
    return {
      id: "supabase-google-auth",
      label: "Supabase Google auth",
      category: "auth",
      status: "fail",
      detail: "Could not read Supabase auth settings.",
      action: "Check Supabase auth settings and verify the anon key can read /auth/v1/settings.",
    };
  }
}

function hasAllEnv(env: Env, keys: string[]) {
  return keys.every((key) => isPresentEnvValue(env[key]));
}

function hasAnyEnv(env: Env, keys: string[]) {
  return keys.some((key) => isPresentEnvValue(env[key]));
}

function isPresentEnvValue(value: string | undefined) {
  const trimmed = value?.trim();

  return Boolean(trimmed && trimmed !== "..." && !trimmed.toLowerCase().startsWith("replace-with-"));
}

function summarizeReadiness(checks: ReadinessCheck[]): ReadinessStatus {
  if (checks.some((check) => check.status === "fail")) {
    return "fail";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "warning";
  }

  return "pass";
}

function countStatuses(checks: ReadinessCheck[]): Record<ReadinessStatus, number> {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { pass: 0, warning: 0, fail: 0 },
  );
}
