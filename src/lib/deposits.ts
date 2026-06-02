// Pure helpers for the USDT deposit flow (no I/O, unit-tested).

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
  const amount = typeof value === "string" ? Number(value) : value;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 1e8) / 1e8;
}

// Stable per-user sub-account name for the processor.
export function subAccountName(userId: string): string {
  return `wc_${userId.replace(/-/g, "").slice(0, 20)}`;
}
