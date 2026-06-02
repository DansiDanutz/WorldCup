import { createHmac } from "node:crypto";

import {
  KUCOIN_CHAIN,
  normalizeDepositTxHash,
  normalizeDepositAddress,
  normalizeNetwork,
  type DepositNetwork,
} from "@/lib/deposits";
import { normalizeLedgerAmount } from "@/lib/economy";

// KuCoin Broker (ND) adapter.
//
// The request signing here is the documented KuCoin v2 scheme and is unit
// tested. Broker sub-account creation and deposit-list reconciliation are
// aligned with the current public docs. The sub-account deposit-address path is
// isolated so it can be live-credential checked before going to production.
//
// All secrets are read from server env and never logged.

const KUCOIN_ENDPOINTS = {
  createSubAccount: "/api/v1/broker/nd/account",
  subAccountDepositAddress: "/api/v1/broker/nd/deposit/address",
  brokerDepositList: "/api/v1/asset/ndbroker/deposit/list",
  mainAccounts: "/api/v1/accounts",
  mainDeposits: "/api/v1/deposits",
} as const;

const DEFAULT_KUCOIN_BROKER_BASE_URL = "https://api-broker.kucoin.com";
const DEFAULT_KUCOIN_SPOT_BASE_URL = "https://api.kucoin.com";

export type KucoinConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
  brokerName: string;
  brokerKey: string;
};

export type KucoinMainConfig = Omit<KucoinConfig, "brokerName" | "brokerKey">;

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function readRequiredEnvValue(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === "..." || trimmed.toLowerCase().startsWith("replace-with-")) {
    return null;
  }

  return trimmed;
}

function getKucoinBrokerBaseUrl(): string {
  const configured = process.env.KUCOIN_BROKER_API_BASE || process.env.KUCOIN_API_BASE;

  if (!configured || normalizeBaseUrl(configured) === DEFAULT_KUCOIN_SPOT_BASE_URL) {
    return DEFAULT_KUCOIN_BROKER_BASE_URL;
  }

  return normalizeBaseUrl(configured);
}

function getKucoinMainBaseUrl(): string {
  const configured = process.env.KUCOIN_MAIN_API_BASE || process.env.KUCOIN_API_BASE;

  if (!configured || normalizeBaseUrl(configured) === DEFAULT_KUCOIN_BROKER_BASE_URL) {
    return DEFAULT_KUCOIN_SPOT_BASE_URL;
  }

  return normalizeBaseUrl(configured);
}

export function getKucoinConfig(): KucoinConfig | null {
  const apiKey = readRequiredEnvValue(process.env.KUCOIN_API_KEY);
  const apiSecret = readRequiredEnvValue(process.env.KUCOIN_API_SECRET);
  const apiPassphrase = readRequiredEnvValue(process.env.KUCOIN_API_PASSPHRASE);
  const brokerName = readRequiredEnvValue(process.env.KUCOIN_BROKER_NAME);
  const brokerKey = readRequiredEnvValue(process.env.KUCOIN_BROKER_KEY);

  if (!apiKey || !apiSecret || !apiPassphrase || !brokerName || !brokerKey) {
    return null;
  }

  return {
    baseUrl: getKucoinBrokerBaseUrl(),
    apiKey,
    apiSecret,
    apiPassphrase,
    brokerName,
    brokerKey,
  };
}

export function isKucoinConfigured(): boolean {
  return getKucoinConfig() !== null;
}

export function getKucoinMainConfig(): KucoinMainConfig | null {
  const apiKey =
    readRequiredEnvValue(process.env.KUCOIN_MAIN_API_KEY) ??
    readRequiredEnvValue(process.env.KUCOIN_API_KEY);
  const apiSecret =
    readRequiredEnvValue(process.env.KUCOIN_MAIN_API_SECRET) ??
    readRequiredEnvValue(process.env.KUCOIN_API_SECRET);
  const apiPassphrase =
    readRequiredEnvValue(process.env.KUCOIN_MAIN_API_PASSPHRASE) ??
    readRequiredEnvValue(process.env.KUCOIN_API_PASSPHRASE);

  if (!apiKey || !apiSecret || !apiPassphrase) {
    return null;
  }

  return {
    baseUrl: getKucoinMainBaseUrl(),
    apiKey,
    apiSecret,
    apiPassphrase,
  };
}

// --- Pure signing (unit tested) -------------------------------------------

export function signKucoinPayload(
  secret: string,
  timestamp: string,
  method: string,
  endpoint: string,
  body: string,
): string {
  const prehash = `${timestamp}${method.toUpperCase()}${endpoint}${body}`;
  return createHmac("sha256", secret).update(prehash).digest("base64");
}

export function encryptPassphrase(secret: string, passphrase: string): string {
  return createHmac("sha256", secret).update(passphrase).digest("base64");
}

export function signBrokerPartner(
  brokerKey: string,
  timestamp: string,
  brokerName: string,
  apiKey: string,
): string {
  const prehash = `${timestamp}${brokerName}${apiKey}`;
  return createHmac("sha256", brokerKey).update(prehash).digest("base64");
}

// --- Signed request --------------------------------------------------------

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
  body?: Record<string, unknown>;
};

function buildQuery(query: RequestOptions["query"]): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function kucoinBrokerRequest<T = unknown>(
  config: KucoinConfig,
  method: "GET" | "POST",
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const timestamp = Date.now().toString();
  const bodyString = options.body ? JSON.stringify(options.body) : "";
  const endpoint = `${path}${method === "GET" ? buildQuery(options.query) : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "KC-API-KEY": config.apiKey,
    "KC-API-SIGN": signKucoinPayload(config.apiSecret, timestamp, method, endpoint, bodyString),
    "KC-API-TIMESTAMP": timestamp,
    "KC-API-PASSPHRASE": encryptPassphrase(config.apiSecret, config.apiPassphrase),
    "KC-API-KEY-VERSION": "2",
    "KC-API-PARTNER": config.brokerName,
    "KC-BROKER-NAME": config.brokerName,
    "KC-API-PARTNER-VERIFY": "true",
    "KC-API-PARTNER-SIGN": signBrokerPartner(
      config.brokerKey,
      timestamp,
      config.brokerName,
      config.apiKey,
    ),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${endpoint}`, {
      method,
      headers,
      body: method === "POST" ? bodyString : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json()) as { code?: string; msg?: string; data?: T };

  if (!response.ok || payload.code !== "200000") {
    throw new Error(`KuCoin request failed (${payload.code ?? response.status}): ${payload.msg ?? "unknown"}`);
  }

  return payload.data as T;
}

export async function kucoinMainRequest<T = unknown>(
  config: KucoinMainConfig,
  method: "GET" | "POST",
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const timestamp = Date.now().toString();
  const bodyString = options.body ? JSON.stringify(options.body) : "";
  const endpoint = `${path}${method === "GET" ? buildQuery(options.query) : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "KC-API-KEY": config.apiKey,
    "KC-API-SIGN": signKucoinPayload(config.apiSecret, timestamp, method, endpoint, bodyString),
    "KC-API-TIMESTAMP": timestamp,
    "KC-API-PASSPHRASE": encryptPassphrase(config.apiSecret, config.apiPassphrase),
    "KC-API-KEY-VERSION": "2",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${endpoint}`, {
      method,
      headers,
      body: method === "POST" ? bodyString : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json()) as { code?: string; msg?: string; data?: T };

  if (!response.ok || payload.code !== "200000") {
    throw new Error(`KuCoin request failed (${payload.code ?? response.status}): ${payload.msg ?? "unknown"}`);
  }

  return payload.data as T;
}

// --- Broker operations -----------------------------------------------------

export async function createBrokerSubAccount(
  config: KucoinConfig,
  accountName: string,
): Promise<{ accountId: string }> {
  const data = await kucoinBrokerRequest<{ accountId?: string; uid?: string }>(
    config,
    "POST",
    KUCOIN_ENDPOINTS.createSubAccount,
    { body: { accountName } },
  );

  const accountId = data.accountId ?? data.uid;
  if (!accountId) {
    throw new Error("KuCoin sub-account response missing account id.");
  }

  return { accountId };
}

export async function getSubAccountDepositAddress(
  config: KucoinConfig,
  params: { accountId: string; network: DepositNetwork },
): Promise<{ address: string; memo: string | null }> {
  const data = await kucoinBrokerRequest<{ address?: string; memo?: string | null }>(
    config,
    "GET",
    KUCOIN_ENDPOINTS.subAccountDepositAddress,
    { query: { accountId: params.accountId, currency: "USDT", chain: KUCOIN_CHAIN[params.network] } },
  );

  const address = data.address ? normalizeDepositAddress(params.network, data.address) : null;
  if (!address) {
    throw new Error("KuCoin deposit address response missing address.");
  }

  return { address, memo: data.memo ?? null };
}

export type KucoinBrokerDeposit = {
  uid: string | number;
  id?: string;
  hash?: string;
  amount: string;
  currency: string;
  chain: string;
  address: string;
  walletTxId?: string | null;
  status: string;
  createdAt: number;
};

export function getKucoinDepositExternalId(deposit: KucoinBrokerDeposit): string {
  return (
    deposit.hash ||
    deposit.id ||
    deposit.walletTxId ||
    `${deposit.uid}:${deposit.address}:${deposit.createdAt}`
  );
}

export async function listBrokerDeposits(
  config: KucoinConfig,
  params: {
    currency?: string;
    status?: "PROCESSING" | "SUCCESS" | "FAILURE";
    startAt?: number;
    endAt?: number;
    limit?: number;
  } = {},
): Promise<KucoinBrokerDeposit[]> {
  const data = await kucoinBrokerRequest<{ items?: KucoinBrokerDeposit[] } | KucoinBrokerDeposit[]>(
    config,
    "GET",
    KUCOIN_ENDPOINTS.brokerDepositList,
    {
      query: {
        currency: params.currency ?? "USDT",
        status: params.status ?? "SUCCESS",
        startTimestamp: params.startAt,
        endTimestamp: params.endAt,
        limit: params.limit ?? 100,
      },
    },
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}

export type KucoinMainDeposit = {
  id?: string;
  currency: string;
  chain: string;
  status: string;
  address: string;
  amount: string;
  walletTxId?: string | null;
  createdAt: number;
  updatedAt?: number;
  memo?: string | null;
  remark?: string | null;
};

export async function listMainAccountDeposits(
  config: KucoinMainConfig,
  params: {
    currency?: string;
    status?: "PROCESSING" | "SUCCESS" | "FAILURE";
    startAt?: number;
    endAt?: number;
    currentPage?: number;
    pageSize?: number;
  } = {},
): Promise<KucoinMainDeposit[]> {
  const data = await kucoinMainRequest<
    { items?: KucoinMainDeposit[] } | KucoinMainDeposit[]
  >(
    config,
    "GET",
    KUCOIN_ENDPOINTS.mainDeposits,
    {
      query: {
        currency: params.currency ?? "USDT",
        status: params.status ?? "SUCCESS",
        startAt: params.startAt,
        endAt: params.endAt,
        currentPage: params.currentPage ?? 1,
        pageSize: params.pageSize ?? 50,
      },
    },
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}

export function findMatchingMainDeposit(
  deposits: KucoinMainDeposit[],
  claim: {
    network: DepositNetwork;
    address: string;
    txHash: string;
    amount?: string | number | null;
  },
): KucoinMainDeposit | null {
  const claimTxHash = normalizeDepositTxHash(claim.network, claim.txHash);
  const claimAddress = normalizeDepositAddress(claim.network, claim.address);
  const claimAmount =
    claim.amount === undefined || claim.amount === null ? null : normalizeLedgerAmount(claim.amount);

  if (!claimTxHash || !claimAddress) {
    return null;
  }

  return (
    deposits.find((deposit) => {
      const depositNetwork = normalizeNetwork(deposit.chain);
      const depositAddress = normalizeDepositAddress(claim.network, deposit.address);
      const depositTxHash = normalizeDepositTxHash(claim.network, deposit.walletTxId ?? deposit.id ?? "");
      const depositAmount = normalizeLedgerAmount(deposit.amount);

      return (
        deposit.currency === "USDT" &&
        deposit.status === "SUCCESS" &&
        depositNetwork === claim.network &&
        depositAddress === claimAddress &&
        depositTxHash === claimTxHash &&
        (claimAmount === null || depositAmount === claimAmount)
      );
    }) ?? null
  );
}
