import { createHmac } from "node:crypto";

import { KUCOIN_CHAIN, type DepositNetwork } from "@/lib/deposits";

// KuCoin Broker (ND) adapter.
//
// The request signing here is the documented KuCoin v2 scheme and is unit
// tested. The broker ENDPOINT PATHS are isolated as constants and MUST be
// verified against the current KuCoin Broker API docs with live credentials
// before going to production — they cannot be exercised from this environment.
//
// All secrets are read from server env and never logged.

const KUCOIN_ENDPOINTS = {
  createSubAccount: "/api/v1/broker/nd/account",
  // VERIFY against KuCoin Broker docs:
  subAccountDepositAddress: "/api/v1/broker/nd/deposit/address",
  brokerDepositList: "/api/v1/asset/ndbroker/deposit/list",
} as const;

export type KucoinConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
  brokerName: string;
  brokerKey: string;
};

export function getKucoinConfig(): KucoinConfig | null {
  const apiKey = process.env.KUCOIN_API_KEY;
  const apiSecret = process.env.KUCOIN_API_SECRET;
  const apiPassphrase = process.env.KUCOIN_API_PASSPHRASE;
  const brokerName = process.env.KUCOIN_BROKER_NAME;
  const brokerKey = process.env.KUCOIN_BROKER_KEY;

  if (!apiKey || !apiSecret || !apiPassphrase || !brokerName || !brokerKey) {
    return null;
  }

  return {
    baseUrl: process.env.KUCOIN_API_BASE || "https://api.kucoin.com",
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

  if (!data.address) {
    throw new Error("KuCoin deposit address response missing address.");
  }

  return { address: data.address, memo: data.memo ?? null };
}

export type KucoinBrokerDeposit = {
  uid: string;
  amount: string;
  currency: string;
  chain: string;
  address: string;
  walletTxId: string;
  status: string;
  createdAt: number;
};

export async function listBrokerDeposits(
  config: KucoinConfig,
  params: { currency?: string; startAt?: number } = {},
): Promise<KucoinBrokerDeposit[]> {
  const data = await kucoinBrokerRequest<{ items?: KucoinBrokerDeposit[] } | KucoinBrokerDeposit[]>(
    config,
    "GET",
    KUCOIN_ENDPOINTS.brokerDepositList,
    { query: { currency: params.currency ?? "USDT", startTimeStamp: params.startAt } },
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}
