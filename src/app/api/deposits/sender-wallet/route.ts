import { NextResponse } from "next/server";

import {
  buildFrozenSenderWalletUpdate,
  getDepositNetworkShortLabel,
  getSavedSenderWalletForNetwork,
  getSavedSenderWalletUpdatedAtForNetwork,
  getSenderWalletLockMismatchMessage,
  normalizeDepositAddress,
  normalizeNetwork,
} from "@/lib/deposits";
import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  getAuthProvider,
  getOrCreateReferralProfile,
} from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "deposit-sender-wallet", {
    limit: 10,
    windowMs: 60_000,
  });
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

  let network;
  let senderWalletAddress: string | null = null;

  try {
    const body = requireObject(await request.json());
    network = normalizeNetwork(requireString(body.network, "Network", { max: 16 }));
    if (!network) {
      return jsonError("Choose TRC20 or ERC20.", 400);
    }

    senderWalletAddress = normalizeDepositAddress(
      network,
      requireString(body.senderWalletAddress, "Sender wallet address", {
        min: 20,
        max: 128,
      }),
    );
    if (!senderWalletAddress) {
      return jsonError(
        `Sender wallet address must be a valid ${getDepositNetworkShortLabel(network)} address.`,
        400,
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const profile = await getOrCreateReferralProfile(supabase, user);
  const savedSenderWallet = getSavedSenderWalletForNetwork(profile, network);

  if (savedSenderWallet && savedSenderWallet !== senderWalletAddress) {
    return jsonError(getSenderWalletLockMismatchMessage(network), 409);
  }

  if (!savedSenderWallet) {
    const now = new Date().toISOString();
    const update = await supabase
      .from("worldcup_referral_profiles")
      .update(buildFrozenSenderWalletUpdate(profile, network, senderWalletAddress, now))
      .eq("user_id", user.id);

    if (update.error) {
      if (update.error.message?.includes("SENDER_WALLET_LOCKED")) {
        return jsonError(getSenderWalletLockMismatchMessage(network), 409);
      }

      return jsonError(`Could not lock your ${getDepositNetworkShortLabel(network)} sender wallet.`, 500);
    }
  }

  const finalProfile = {
    ...profile,
    ...(network === "trc20"
      ? {
          usdt_sender_wallet_trc20_address: savedSenderWallet ?? senderWalletAddress,
          usdt_sender_wallet_trc20_updated_at:
            getSavedSenderWalletUpdatedAtForNetwork(profile, "trc20") ?? new Date().toISOString(),
        }
      : {
          usdt_sender_wallet_erc20_address: savedSenderWallet ?? senderWalletAddress,
          usdt_sender_wallet_erc20_updated_at:
            getSavedSenderWalletUpdatedAtForNetwork(profile, "erc20") ?? new Date().toISOString(),
        }),
  };

  return NextResponse.json({
    network,
    senderWalletAddress: savedSenderWallet ?? senderWalletAddress,
    locked: true,
    senderWallets: {
      trc20Address: getSavedSenderWalletForNetwork(finalProfile, "trc20"),
      trc20UpdatedAt: getSavedSenderWalletUpdatedAtForNetwork(finalProfile, "trc20"),
      erc20Address: getSavedSenderWalletForNetwork(finalProfile, "erc20"),
      erc20UpdatedAt: getSavedSenderWalletUpdatedAtForNetwork(finalProfile, "erc20"),
    },
  });
}
