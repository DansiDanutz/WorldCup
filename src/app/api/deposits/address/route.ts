import { NextResponse } from "next/server";

import { NETWORK_LABELS, SUPPORTED_NETWORKS, subAccountName } from "@/lib/deposits";
import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  createBrokerSubAccount,
  getKucoinConfig,
  getSubAccountDepositAddress,
} from "@/lib/kucoin";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

type AddressRow = {
  network: string;
  address: string;
  memo: string | null;
  provider_account_id: string | null;
};

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "deposits", { limit: 20, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Sign in with Google first.", 401);
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return jsonError("Invalid session.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  const existing = await supabase
    .from("worldcup_deposit_addresses")
    .select("network,address,memo,provider_account_id")
    .eq("user_id", user.id);

  if (existing.error) {
    return jsonError("Could not load deposit addresses.", 500);
  }

  const byNetwork = new Map<string, AddressRow>(
    (existing.data ?? []).map((row) => [row.network, row as AddressRow]),
  );
  const missing = SUPPORTED_NETWORKS.filter((network) => !byNetwork.has(network));

  if (missing.length > 0) {
    const config = getKucoinConfig();

    if (!config) {
      // Deposits not wired yet: report any addresses we have and tell the UI
      // the processor is not configured, rather than erroring.
      return NextResponse.json({ configured: false, addresses: formatAddresses(byNetwork) });
    }

    try {
      let accountId =
        (existing.data ?? []).map((row) => row.provider_account_id).find(Boolean) ?? null;

      if (!accountId) {
        accountId = (await createBrokerSubAccount(config, subAccountName(user.id))).accountId;
      }

      for (const network of missing) {
        const address = await getSubAccountDepositAddress(config, { accountId, network });
        const insert = await supabase
          .from("worldcup_deposit_addresses")
          .insert({
            user_id: user.id,
            network,
            address: address.address,
            memo: address.memo,
            provider: "kucoin",
            provider_account_id: accountId,
          })
          .select("network,address,memo,provider_account_id")
          .single();

        if (!insert.error && insert.data) {
          byNetwork.set(network, insert.data as AddressRow);
        }
      }
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : "Could not provision deposit address.",
        502,
      );
    }
  }

  return NextResponse.json({ configured: true, addresses: formatAddresses(byNetwork) });
}

function formatAddresses(byNetwork: Map<string, AddressRow>) {
  return SUPPORTED_NETWORKS.filter((network) => byNetwork.has(network)).map((network) => {
    const row = byNetwork.get(network)!;
    return {
      network,
      label: NETWORK_LABELS[network],
      address: row.address,
      memo: row.memo,
    };
  });
}
