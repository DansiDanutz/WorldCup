import type { SupabaseClient } from "@supabase/supabase-js";

import type { DepositClaimLimitConfig } from "@/lib/deposits";
import { getDepositClaimLimitConfig } from "@/lib/deposits";
import { parseCountryList } from "@/lib/geo-eligibility";
import { ValidationError } from "@/lib/validation";
import type { WithdrawalRequestLimitConfig } from "@/lib/withdrawals";
import { getWithdrawalRequestLimitConfig } from "@/lib/withdrawals";

export type OperatorPolicy = {
  allowedCountries: string[];
  blockedCountries: string[];
  maxDepositClaimAmount: number | null;
  maxDailyDepositClaimAmount: number | null;
  maxWithdrawalRequestAmount: number | null;
  maxDailyWithdrawalRequestAmount: number | null;
  updatedAt: string | null;
  updatedBy: string | null;
  source: "database" | "environment";
};

export type OperatorPolicyInput = {
  allowedCountries?: unknown;
  blockedCountries?: unknown;
  maxDepositClaimAmount?: unknown;
  maxDailyDepositClaimAmount?: unknown;
  maxWithdrawalRequestAmount?: unknown;
  maxDailyWithdrawalRequestAmount?: unknown;
};

export type OperatorPolicyPaidAction = "deposit" | "ticket" | "entry" | "withdrawal";

type OperatorPolicyRow = {
  allowed_countries: string[] | null;
  blocked_countries: string[] | null;
  max_deposit_claim_amount: string | number | null;
  max_daily_deposit_claim_amount: string | number | null;
  max_withdrawal_request_amount: string | number | null;
  max_daily_withdrawal_request_amount: string | number | null;
  updated_at: string | null;
  updated_by: string | null;
};

type Env = Record<string, string | undefined>;

export function getEnvironmentOperatorPolicy(env: Env = process.env): OperatorPolicy {
  const depositLimits = getDepositClaimLimitConfig(env);
  const withdrawalLimits = getWithdrawalRequestLimitConfig(env);

  return {
    allowedCountries: Array.from(parseCountryList(env.WORLDCUP_ALLOWED_COUNTRIES)).sort(),
    blockedCountries: Array.from(parseCountryList(env.WORLDCUP_BLOCKED_COUNTRIES)).sort(),
    maxDepositClaimAmount: depositLimits.maxPerClaimAmount,
    maxDailyDepositClaimAmount: depositLimits.maxDailyClaimAmount,
    maxWithdrawalRequestAmount: withdrawalLimits.maxPerRequestAmount,
    maxDailyWithdrawalRequestAmount: withdrawalLimits.maxDailyRequestAmount,
    updatedAt: null,
    updatedBy: null,
    source: "environment",
  };
}

export async function loadOperatorPolicy(
  supabase: SupabaseClient,
  env: Env = process.env,
): Promise<OperatorPolicy> {
  const fallback = getEnvironmentOperatorPolicy(env);
  const result = await supabase
    .from("worldcup_operator_policy")
    .select(
      "allowed_countries,blocked_countries,max_deposit_claim_amount,max_daily_deposit_claim_amount,max_withdrawal_request_amount,max_daily_withdrawal_request_amount,updated_at,updated_by",
    )
    .eq("singleton_id", true)
    .maybeSingle();

  if (result.error || !result.data) {
    return fallback;
  }

  return normalizeOperatorPolicyRow(result.data as OperatorPolicyRow, fallback);
}

export function normalizeOperatorPolicyInput(input: OperatorPolicyInput) {
  return {
    allowedCountries: normalizeCountryCodes(input.allowedCountries),
    blockedCountries: normalizeCountryCodes(input.blockedCountries),
    maxDepositClaimAmount: parseOptionalPolicyAmount(input.maxDepositClaimAmount),
    maxDailyDepositClaimAmount: parseOptionalPolicyAmount(input.maxDailyDepositClaimAmount),
    maxWithdrawalRequestAmount: parseOptionalPolicyAmount(input.maxWithdrawalRequestAmount),
    maxDailyWithdrawalRequestAmount: parseOptionalPolicyAmount(input.maxDailyWithdrawalRequestAmount),
  };
}

export function validateOperatorPolicyInput(input: OperatorPolicyInput) {
  const allowedCountries = parsePolicyCountryCodes(input.allowedCountries, "Allowed countries", true);
  const blockedCountries = parsePolicyCountryCodes(input.blockedCountries, "Blocked countries", true);
  const overlap = allowedCountries.filter((country) => blockedCountries.includes(country));

  if (overlap.length > 0) {
    throw new ValidationError(
      `Allowed and blocked countries cannot overlap: ${overlap.join(", ")}.`,
    );
  }

  return {
    allowedCountries,
    blockedCountries,
    maxDepositClaimAmount: parsePolicyAmountForAdmin(
      input.maxDepositClaimAmount,
      "Max deposit claim",
    ),
    maxDailyDepositClaimAmount: parsePolicyAmountForAdmin(
      input.maxDailyDepositClaimAmount,
      "Daily deposit cap",
    ),
    maxWithdrawalRequestAmount: parsePolicyAmountForAdmin(
      input.maxWithdrawalRequestAmount,
      "Max withdrawal request",
    ),
    maxDailyWithdrawalRequestAmount: parsePolicyAmountForAdmin(
      input.maxDailyWithdrawalRequestAmount,
      "Daily withdrawal cap",
    ),
  };
}

export function getPolicyGeoEnv(policy: OperatorPolicy): Env {
  return {
    WORLDCUP_ALLOWED_COUNTRIES: policy.allowedCountries.join(","),
    WORLDCUP_BLOCKED_COUNTRIES: policy.blockedCountries.join(","),
  };
}

export function getDepositLimitConfigFromPolicy(policy: OperatorPolicy): DepositClaimLimitConfig {
  return {
    maxPerClaimAmount: policy.maxDepositClaimAmount,
    maxDailyClaimAmount: policy.maxDailyDepositClaimAmount,
  };
}

export function getWithdrawalLimitConfigFromPolicy(
  policy: OperatorPolicy,
): WithdrawalRequestLimitConfig {
  return {
    maxPerRequestAmount: policy.maxWithdrawalRequestAmount,
    maxDailyRequestAmount: policy.maxDailyWithdrawalRequestAmount,
  };
}

export function getOperatorPolicyLaunchReadiness(policy: OperatorPolicy): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (policy.allowedCountries.length === 0 && policy.blockedCountries.length === 0) {
    missing.push("paid-action country policy");
  }

  if (policy.maxDepositClaimAmount === null && policy.maxDailyDepositClaimAmount === null) {
    missing.push("deposit claim cap");
  }

  if (policy.maxWithdrawalRequestAmount === null && policy.maxDailyWithdrawalRequestAmount === null) {
    missing.push("withdrawal request cap");
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function getOperatorPolicyPaidActionGate(
  policy: OperatorPolicy,
  action: OperatorPolicyPaidAction,
): { allowed: boolean; missing: string[]; message: string | null } {
  const missing = getOperatorPolicyPaidActionMissing(policy, action);

  return {
    allowed: missing.length === 0,
    missing,
    message:
      missing.length === 0
        ? null
        : `${getPaidActionLabel(action)} are paused until ${formatMissingLaunchGateItems(missing)} configured in Operator policy.`,
  };
}

function getOperatorPolicyPaidActionMissing(
  policy: OperatorPolicy,
  action: OperatorPolicyPaidAction,
) {
  const missing: string[] = [];

  if (policy.allowedCountries.length === 0 && policy.blockedCountries.length === 0) {
    missing.push("paid-action country policy");
  }

  if (
    action === "deposit" &&
    policy.maxDepositClaimAmount === null &&
    policy.maxDailyDepositClaimAmount === null
  ) {
    missing.push("deposit claim cap");
  }

  if (
    action === "withdrawal" &&
    policy.maxWithdrawalRequestAmount === null &&
    policy.maxDailyWithdrawalRequestAmount === null
  ) {
    missing.push("withdrawal request cap");
  }

  return missing;
}

function getPaidActionLabel(action: OperatorPolicyPaidAction) {
  if (action === "deposit") {
    return "USDT deposits";
  }

  if (action === "withdrawal") {
    return "Withdrawal requests";
  }

  if (action === "ticket") {
    return "Ticket purchases";
  }

  return "Entry locking";
}

function formatMissingLaunchGateItems(items: string[]) {
  if (items.length === 1) {
    return `${items[0]} is`;
  }

  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)} are`;
}

export function formatOperatorPolicy(policy: OperatorPolicy) {
  return {
    allowedCountries: policy.allowedCountries,
    blockedCountries: policy.blockedCountries,
    maxDepositClaimAmount: formatPolicyAmount(policy.maxDepositClaimAmount),
    maxDailyDepositClaimAmount: formatPolicyAmount(policy.maxDailyDepositClaimAmount),
    maxWithdrawalRequestAmount: formatPolicyAmount(policy.maxWithdrawalRequestAmount),
    maxDailyWithdrawalRequestAmount: formatPolicyAmount(policy.maxDailyWithdrawalRequestAmount),
    updatedAt: policy.updatedAt,
    updatedBy: policy.updatedBy,
    source: policy.source,
  };
}

function normalizeOperatorPolicyRow(
  row: OperatorPolicyRow,
  fallback: OperatorPolicy,
): OperatorPolicy {
  return {
    allowedCountries: normalizeCountryCodes(row.allowed_countries).length
      ? normalizeCountryCodes(row.allowed_countries)
      : fallback.allowedCountries,
    blockedCountries: normalizeCountryCodes(row.blocked_countries).length
      ? normalizeCountryCodes(row.blocked_countries)
      : fallback.blockedCountries,
    maxDepositClaimAmount:
      parseOptionalPolicyAmount(row.max_deposit_claim_amount) ?? fallback.maxDepositClaimAmount,
    maxDailyDepositClaimAmount:
      parseOptionalPolicyAmount(row.max_daily_deposit_claim_amount) ??
      fallback.maxDailyDepositClaimAmount,
    maxWithdrawalRequestAmount:
      parseOptionalPolicyAmount(row.max_withdrawal_request_amount) ??
      fallback.maxWithdrawalRequestAmount,
    maxDailyWithdrawalRequestAmount:
      parseOptionalPolicyAmount(row.max_daily_withdrawal_request_amount) ??
      fallback.maxDailyWithdrawalRequestAmount,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    source: "database",
  };
}

function normalizeCountryCodes(value: unknown): string[] {
  return parsePolicyCountryCodes(value, "Country codes", false);
}

function parsePolicyCountryCodes(value: unknown, field: string, strict: boolean): string[] {
  const rawValues = getPolicyCountryRawValues(value, field, strict);
  const codes: string[] = [];
  const invalid: string[] = [];

  for (const rawValue of rawValues) {
    const country = rawValue.trim().toUpperCase();

    if (!country) {
      continue;
    }

    if (/^[A-Z]{2}$/.test(country)) {
      codes.push(country);
    } else if (strict) {
      invalid.push(rawValue.trim());
    }
  }

  if (invalid.length > 0) {
    throw new ValidationError(
      `${field} must use two-letter ISO country codes. Invalid: ${invalid.join(", ")}.`,
    );
  }

  return Array.from(new Set(codes)).sort();
}

function getPolicyCountryRawValues(value: unknown, field: string, strict: boolean): string[] {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    if (strict && value.some((country) => typeof country !== "string")) {
      throw new ValidationError(`${field} must be a comma-separated string or array of strings.`);
    }

    return value.filter((country): country is string => typeof country === "string");
  }

  if (typeof value === "string") {
    return value.split(",");
  }

  if (strict) {
    throw new ValidationError(`${field} must be a comma-separated string or array of strings.`);
  }

  return [];
}

function parsePolicyAmountForAdmin(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const text = typeof value === "number" ? String(value) : String(value).trim();

  if (!/^(?:\d+|\d+\.\d{1,8}|\.\d{1,8})$/.test(text)) {
    throw new ValidationError(`${field} must be a USDT amount with up to 8 decimal places.`);
  }

  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError(`${field} must be greater than zero.`);
  }

  return Math.round(parsed * 1e8) / 1e8;
}

function parseOptionalPolicyAmount(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const text = typeof value === "number" ? String(value) : String(value).trim();
  if (!/^(?:\d+|\d+\.\d{1,8}|\.\d{1,8})$/.test(text)) {
    return null;
  }

  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 1e8) / 1e8;
}

function formatPolicyAmount(value: number | null) {
  return value === null ? null : value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}
