import { NextResponse } from "next/server";

import {
  getConfiguredMainDepositAddresses,
  NETWORK_LABELS,
  SUPPORTED_NETWORKS,
  subAccountName,
  type DepositAddressInfo,
} from "@/lib/deposits";
import { enforceGeoEligibility, enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  createBrokerSubAccount,
  getKucoinConfig,
  getSubAccountDepositAddress,
} from "@/lib/kucoin";
import { getPolicyGeoEnv, loadOperatorPolicy } from "@/lib/operator-policy";
import { getUserPaidActionGate, isPaidActionLaunchTestAdmin } from "@/lib/paid-action-gates";
import { getAuthProvider } from "@/lib/referrals";
import { getResponsiblePlayRestriction, loadResponsiblePlayStatus } from "@/lib/responsible-play";
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

  const supabase = createServiceSupabaseClient();
  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Sign in with Google first.", 401);
  }

  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return jsonError("Invalid session.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  const operatorPolicy = await loadOperatorPolicy(supabase);
  if (!isPaidActionLaunchTestAdmin(user.email)) {
    const geoRestricted = enforceGeoEligibility(request, getPolicyGeoEnv(operatorPolicy));
    if (geoRestricted) {
      return geoRestricted;
    }
  }

  const paidActionGate = await getUserPaidActionGate(supabase, "deposit", {
    userEmail: user.email,
  });
  if (!paidActionGate.allowed) {
    return jsonError(paidActionGate.message ?? "USDT deposits are paused until launch approvals are complete.", 403);
  }

  const responsiblePlay = await loadResponsiblePlayStatus(supabase, user.id);
  if ("error" in responsiblePlay) {
    return jsonError(responsiblePlay.error, 500);
  }

  const responsiblePlayRestriction = getResponsiblePlayRestriction(
    responsiblePlay.status,
    "deposit",
  );
  if (responsiblePlayRestriction) {
    return jsonError(responsiblePlayRestriction, 403);
  }

  const mainReceiveAddresses = getConfiguredMainDepositAddresses(process.env);
  if (mainReceiveAddresses.length === SUPPORTED_NETWORKS.length) {
    return NextResponse.json({
      configured: true,
      shared: true,
      addresses: mainReceiveAddresses,
    });
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

function formatAddresses(byNetwork: Map<string, AddressRow>): DepositAddressInfo[] {
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
