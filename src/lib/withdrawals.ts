import { formatLedgerAmount, normalizeLedgerAmount } from "@/lib/economy";
import {
  getDepositExplorerTxUrl,
  normalizeDepositTxHash,
  normalizeNetwork,
  parseDepositAmount,
} from "@/lib/deposits";

export const WITHDRAWAL_LIMIT_WINDOW_HOURS = 24;
export const WITHDRAWAL_STATUS = ["submitted", "approved", "rejected", "paid"] as const;

export type WithdrawalStatus = (typeof WITHDRAWAL_STATUS)[number];

export type WithdrawalRequestLimitConfig = {
  maxPerRequestAmount: number | null;
  maxDailyRequestAmount: number | null;
};

export type WithdrawalAmountRow = {
  amount: string | number;
  status?: string | null;
};

export function parseWithdrawalAmount(value: unknown) {
  return parseDepositAmount(value);
}

export function normalizeWithdrawalNetwork(value: unknown) {
  return typeof value === "string" ? normalizeNetwork(value) : null;
}

export function normalizeWithdrawalTxHash(network: string, value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedNetwork = normalizeWithdrawalNetwork(network);
  if (!normalizedNetwork) {
    return null;
  }

  return normalizeDepositTxHash(normalizedNetwork, value);
}

export function isValidWithdrawalAddress(network: string, address: string) {
  const trimmed = address.trim();

  if (network === "trc20") {
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed);
  }

  if (network === "erc20") {
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  }

  return false;
}

export function getWithdrawalExplorerTxUrl(network: string, txHash: string) {
  return getDepositExplorerTxUrl(network, txHash);
}

export function getWithdrawalRequestLimitConfig(
  env: Record<string, string | undefined>,
): WithdrawalRequestLimitConfig {
  return {
    maxPerRequestAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT),
    maxDailyRequestAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT),
  };
}

export function getWithdrawalLimitViolation(
  amount: number,
  rollingDailyRequestTotal: number,
  config: WithdrawalRequestLimitConfig,
): string | null {
  if (config.maxPerRequestAmount !== null && amount > config.maxPerRequestAmount) {
    return `Withdrawal requests are limited to ${formatLedgerAmount(config.maxPerRequestAmount)} USDT each.`;
  }

  if (
    config.maxDailyRequestAmount !== null &&
    rollingDailyRequestTotal + amount > config.maxDailyRequestAmount
  ) {
    return `Withdrawal requests are limited to ${formatLedgerAmount(config.maxDailyRequestAmount)} USDT per 24 hours.`;
  }

  return null;
}

export function sumActiveWithdrawalRequestAmounts(rows: WithdrawalAmountRow[]) {
  return rows.reduce((total, row) => {
    if (row.status === "rejected") {
      return total;
    }

    return normalizeLedgerAmount(total + normalizeLedgerAmount(row.amount));
  }, 0);
}

function parseOptionalLimitAmount(value: string | undefined) {
  if (!value || value.trim() === "") {
    return null;
  }

  return parseWithdrawalAmount(value);
}
