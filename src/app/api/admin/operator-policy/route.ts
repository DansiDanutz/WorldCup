import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import {
  formatOperatorPolicy,
  loadOperatorPolicy,
  validateOperatorPolicyInput,
} from "@/lib/operator-policy";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, ValidationError } from "@/lib/validation";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  return NextResponse.json({ policy: formatOperatorPolicy(await loadOperatorPolicy(supabase)) });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  let input;
  try {
    input = validateOperatorPolicyInput(requireObject(await request.json()));
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const actor = auth.via === "email" ? auth.adminEmail : "admin";
  const update = await supabase
    .from("worldcup_operator_policy")
    .upsert(
      {
        singleton_id: true,
        allowed_countries: input.allowedCountries,
        blocked_countries: input.blockedCountries,
        max_deposit_claim_amount: input.maxDepositClaimAmount,
        max_daily_deposit_claim_amount: input.maxDailyDepositClaimAmount,
        max_withdrawal_request_amount: input.maxWithdrawalRequestAmount,
        max_daily_withdrawal_request_amount: input.maxDailyWithdrawalRequestAmount,
        updated_by: actor,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "singleton_id" },
    );

  if (update.error) {
    return jsonError("Could not save operator policy.", 500);
  }

  return NextResponse.json({ policy: formatOperatorPolicy(await loadOperatorPolicy(supabase)) });
}
