// Pure helpers for the USDT deposit flow (no I/O, unit-tested).

import { formatLedgerAmount, normalizeLedgerAmount } from "@/lib/economy";

export type DepositNetwork = "trc20" | "erc20";

export const SUPPORTED_NETWORKS: readonly DepositNetwork[] = ["trc20", "erc20"] as const;

export const NETWORK_LABELS: Record<DepositNetwork, string> = {
  trc20: "USDT · TRC-20 (Tron)",
  erc20: "USDT · ERC-20 (Ethereum)",
};

// KuCoin's `chain` identifier for each network when requesting deposit
// addresses / reading deposits.
export const KUCOIN_CHAIN: Record<DepositNetwork, string> = {
  trc20: "trc20",
  erc20: "eth",
};

export type DepositAddressInfo = {
  network: DepositNetwork;
  label: string;
  address: string;
  memo: string | null;
  qrCodePath?: string;
  shared?: boolean;
};

export type DepositClaimLimitConfig = {
  maxPerClaimAmount: number | null;
  maxDailyClaimAmount: number | null;
};

const MAIN_DEPOSIT_ADDRESS_CONFIG: Record<
  DepositNetwork,
  { envKey: string; qrCodePath: string }
> = {
  trc20: {
    envKey: "KUCOIN_MAIN_USDT_TRC20_ADDRESS",
    qrCodePath: "/usdt-trc20-address-qr.svg",
  },
  erc20: {
    envKey: "KUCOIN_MAIN_USDT_ERC20_ADDRESS",
    qrCodePath: "/usdt-erc20-address-qr.svg",
  },
};

export const DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS = 24;

export function isSupportedNetwork(value: unknown): value is DepositNetwork {
  return typeof value === "string" && SUPPORTED_NETWORKS.includes(value as DepositNetwork);
}

export function normalizeNetwork(value: unknown): DepositNetwork | null {
  if (typeof value !== "string") {
    return null;
  }

  const lower = value.trim().toLowerCase();

  if (isSupportedNetwork(lower)) {
    return lower;
  }

  // Accept a few friendly aliases.
  if (lower === "tron" || lower === "trx") {
    return "trc20";
  }

  if (lower === "eth" || lower === "ethereum") {
    return "erc20";
  }

  return null;
}

// USDT carries up to 6 decimals on-chain; we store 8 for headroom. Returns a
// positive number rounded to 8 decimals, or null if the input is not a valid
// positive amount.
export function parseDepositAmount(value: unknown): number | null {
  const amount = typeof value === "string" ? parseDecimalAmountString(value) : value;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const rounded = Math.round(amount * 1e8) / 1e8;
  return rounded > 0 ? rounded : null;
}

function parseDecimalAmountString(value: string): number | null {
  const trimmed = value.trim();

  if (!/^(?:\d+(?:\.\d{1,8})?|\.\d{1,8})$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
}

export function getDepositClaimLimitConfig(
  env: Record<string, string | undefined>,
): DepositClaimLimitConfig {
  return {
    maxPerClaimAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT),
    maxDailyClaimAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT),
  };
}

export function getDepositClaimLimitViolation(
  amount: number,
  rollingDailyClaimTotal: number,
  config: DepositClaimLimitConfig,
): string | null {
  if (config.maxPerClaimAmount !== null && amount > config.maxPerClaimAmount) {
    return `Deposit claim exceeds the per-claim limit of ${formatLedgerAmount(config.maxPerClaimAmount)} USDT.`;
  }

  if (
    config.maxDailyClaimAmount !== null &&
    normalizeLedgerAmount(rollingDailyClaimTotal + amount) > config.maxDailyClaimAmount
  ) {
    return `Deposit claim exceeds the ${DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS}-hour limit of ${formatLedgerAmount(config.maxDailyClaimAmount)} USDT.`;
  }

  return null;
}

export function sumActiveDepositClaimAmounts(
  claims: Array<{ amount: string | number | null; status?: string | null }>,
): number {
  return normalizeLedgerAmount(
    claims.reduce((total, claim) => {
      if (claim.status === "rejected") {
        return total;
      }

      return total + normalizeLedgerAmount(claim.amount);
    }, 0),
  );
}

function parseOptionalLimitAmount(value: string | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }

  return parseDepositAmount(value);
}

// Stable per-user sub-account name for the processor.
export function subAccountName(userId: string): string {
  return `wc_${userId.replace(/-/g, "").slice(0, 20)}`;
}

export function getConfiguredMainDepositAddresses(
  env: Record<string, string | undefined>,
): DepositAddressInfo[] {
  const addresses = SUPPORTED_NETWORKS.map((network) => {
    const value = env[MAIN_DEPOSIT_ADDRESS_CONFIG[network].envKey]?.trim();

    if (!value || value === "..." || value.toLowerCase().startsWith("replace-with-")) {
      return null;
    }

    const address = normalizeDepositAddress(network, value);
    if (!address) {
      return null;
    }

    return {
      network,
      label: NETWORK_LABELS[network],
      address,
      memo: null,
      qrCodePath: MAIN_DEPOSIT_ADDRESS_CONFIG[network].qrCodePath,
      shared: true,
    };
  });

  return addresses.every(Boolean) ? (addresses as DepositAddressInfo[]) : [];
}

export function getConfiguredMainDepositAddress(
  env: Record<string, string | undefined>,
  network: DepositNetwork,
): DepositAddressInfo | null {
  return getConfiguredMainDepositAddresses(env).find((address) => address.network === network) ?? null;
}

export function normalizeDepositTxHash(network: DepositNetwork, value: string): string | null {
  const normalized = value.trim().toLowerCase();

  if (network === "trc20") {
    const withoutPrefix = normalized.startsWith("0x") ? normalized.slice(2) : normalized;
    return /^[a-f0-9]{64}$/.test(withoutPrefix) ? withoutPrefix : null;
  }

  const withPrefix = normalized.startsWith("0x") ? normalized : `0x${normalized}`;
  return /^0x[a-f0-9]{64}$/.test(withPrefix) ? withPrefix : null;
}

export function normalizeDepositAddress(networkValue: unknown, value: string): string | null {
  const network = normalizeNetwork(networkValue);
  const normalized = value.trim();

  if (!network || !normalized) {
    return null;
  }

  if (network === "trc20") {
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(normalized) ? normalized : null;
  }

  return /^0x[a-fA-F0-9]{40}$/.test(normalized) ? normalized : null;
}

export function getDepositExplorerTxUrl(networkValue: unknown, value: string): string | null {
  const network = normalizeNetwork(networkValue);
  if (!network) {
    return null;
  }

  const txHash = normalizeDepositTxHash(network, value);
  if (!txHash) {
    return null;
  }

  if (network === "trc20") {
    return `https://tronscan.org/#/transaction/${txHash}`;
  }

  return `https://etherscan.io/tx/${txHash}`;
}

export function getDepositExplorerAddressUrl(networkValue: unknown, address: string): string | null {
  const network = normalizeNetwork(networkValue);
  const normalizedAddress = address.trim();

  if (!network || !normalizedAddress) {
    return null;
  }

  if (network === "trc20") {
    return `https://tronscan.org/#/address/${encodeURIComponent(normalizedAddress)}`;
  }

  return `https://etherscan.io/address/${encodeURIComponent(normalizedAddress)}`;
}
