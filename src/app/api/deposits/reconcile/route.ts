import { NextResponse } from "next/server";

import { parseDepositAmount } from "@/lib/deposits";
import { requireEnv } from "@/lib/env";
import { getKucoinConfig, listBrokerDeposits } from "@/lib/kucoin";
import { createServiceSupabaseClient } from "@/lib/supabase";

// Credits confirmed USDT deposits to user wallets. Idempotent: the credit RPC
// is keyed on the processor's unique deposit id, so re-running never
// double-credits. Intended to be called by cron.
async function runReconcile(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${requireEnv("CRON_SECRET")}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const config = getKucoinConfig();
  if (!config) {
    return NextResponse.json({ configured: false, processed: 0 });
  }

  const supabase = createServiceSupabaseClient();
  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  let deposits;
  try {
    deposits = await listBrokerDeposits(config, { currency: "USDT" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deposit provider failed." },
      { status: 502 },
    );
  }

  let credited = 0;
  const skipped: string[] = [];

  for (const deposit of deposits) {
    if (String(deposit.status).toUpperCase() !== "SUCCESS") {
      continue;
    }

    const amount = parseDepositAmount(deposit.amount);
    const externalId = deposit.walletTxId || `${deposit.uid}:${deposit.address}:${deposit.createdAt}`;

    if (!amount || !deposit.address) {
      skipped.push(externalId);
      continue;
    }

    const addressRow = await supabase
      .from("worldcup_deposit_addresses")
      .select("user_id,network")
      .eq("address", deposit.address)
      .maybeSingle();

    if (addressRow.error || !addressRow.data) {
      skipped.push(externalId); // deposit to an address we don't recognize
      continue;
    }

    const credit = await supabase.rpc("worldcup_credit_deposit", {
      p_user_id: addressRow.data.user_id,
      p_tournament_id: tournament.data.id,
      p_network: addressRow.data.network,
      p_address: deposit.address,
      p_external_id: externalId,
      p_amount: amount,
      p_currency: deposit.currency || "USDT",
      p_raw: deposit,
    });

    if (credit.error) {
      skipped.push(externalId);
      continue;
    }

    if (credit.data) {
      credited += 1;
    }
  }

  return NextResponse.json({ configured: true, credited, skipped: skipped.length });
}

export async function GET(request: Request) {
  return runReconcile(request);
}

export async function POST(request: Request) {
  return runReconcile(request);
}
