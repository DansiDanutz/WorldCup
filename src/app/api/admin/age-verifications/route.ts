import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { normalizeAgeVerificationStatus } from "@/lib/age-verification";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  optionalString,
  requireEnum,
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

type AgeVerificationAction = "list" | "verify" | "reject";

type AgeVerificationProfileRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  age_verification_status: string | null;
  age_verification_note: string | null;
  age_verification_submitted_at: string | null;
  age_verified_at: string | null;
  age_verified_by: string | null;
};

const PROFILE_SELECT =
  "user_id,email,display_name,age_verification_status,age_verification_note,age_verification_submitted_at,age_verified_at,age_verified_by";

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

  let action: AgeVerificationAction;
  let userId: string | null = null;
  let note: string | null = null;

  try {
    const body = requireObject(await request.json());
    action = requireEnum(body.action, "Action", ["list", "verify", "reject"] as const);

    if (action !== "list") {
      userId = requireString(body.userId, "Account", { max: 80 });
      note = optionalString(body.note, "Review note", 300);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  const actor = auth.via === "email" ? auth.adminEmail : "admin";

  if (action === "list") {
    return listAgeVerifications(supabase);
  }

  if (!userId) {
    return jsonError("Account is required.", 400);
  }

  if (!note) {
    return jsonError("A review note is required before recording an age verification decision.", 400);
  }

  const status = action === "verify" ? "verified" : "rejected";
  const now = new Date().toISOString();

  const updated = await supabase
    .from("worldcup_referral_profiles")
    .update({
      age_verification_status: status,
      age_verification_note: note,
      age_verified_at: now,
      age_verified_by: actor,
      updated_at: now,
    })
    .eq("user_id", userId)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (updated.error) {
    return jsonError("Could not update age verification.", 500);
  }

  if (!updated.data) {
    return jsonError("Account was not found.", 404);
  }

  return NextResponse.json({ verification: formatAgeVerificationRow(updated.data as AgeVerificationProfileRow) });
}

async function listAgeVerifications(supabase: any) {
  const rows = await supabase
    .from("worldcup_referral_profiles")
    .select(PROFILE_SELECT)
    .neq("age_verification_status", "unverified")
    .order("age_verification_submitted_at", { ascending: false, nullsFirst: false })
    .limit(200);

  if (rows.error) {
    return jsonError("Could not load age verifications.", 500);
  }

  return NextResponse.json({
    verifications: (rows.data ?? []).map((row: AgeVerificationProfileRow) => formatAgeVerificationRow(row)),
  });
}

function formatAgeVerificationRow(row: AgeVerificationProfileRow) {
  return {
    userId: row.user_id,
    email: row.email ?? null,
    displayName: row.display_name ?? "WorldCup player",
    status: normalizeAgeVerificationStatus(row.age_verification_status),
    note: row.age_verification_note ?? null,
    submittedAt: row.age_verification_submitted_at ?? null,
    verifiedAt: row.age_verified_at ?? null,
    verifiedBy: row.age_verified_by ?? null,
  };
}
