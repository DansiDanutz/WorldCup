// Age verification for payouts. Players prove they are 18+ (by sending a
// government photo ID to the operator, reviewed off-platform) before they can
// withdraw USDT. The app stores only the review state on the referral profile;
// deposits, tickets, and play are never gated by this.

export const AGE_VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
] as const;

export type AgeVerificationStatus = (typeof AGE_VERIFICATION_STATUSES)[number];

const DEFAULT_AGE_VERIFICATION_CONTACT = "age-verification@worldcup26.world";

export type AgeVerificationRow = {
  age_verification_status?: string | null;
  age_verification_note?: string | null;
  age_verification_submitted_at?: string | null;
  age_verified_at?: string | null;
  age_verified_by?: string | null;
};

export type AgeVerification = {
  status: AgeVerificationStatus;
  note: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
};

type SupabaseLike = {
  from: (table: string) => any;
};

export function normalizeAgeVerificationStatus(value: unknown): AgeVerificationStatus {
  return typeof value === "string" && (AGE_VERIFICATION_STATUSES as readonly string[]).includes(value)
    ? (value as AgeVerificationStatus)
    : "unverified";
}

export function isAgeVerified(status: AgeVerificationStatus | null | undefined): boolean {
  return status === "verified";
}

// A player may (re)submit documents from any non-verified state. We treat
// "pending" as re-affirmable so a second tap is idempotent rather than an error.
export function canSubmitAgeDocs(status: AgeVerificationStatus): boolean {
  return status !== "verified";
}

export function getAgeVerificationContact(
  env: Record<string, string | undefined> = process.env,
): string {
  const configured = (env.WORLDCUP_AGE_VERIFICATION_CONTACT ?? "").trim();
  return configured || DEFAULT_AGE_VERIFICATION_CONTACT;
}

export function formatAgeVerification(row: AgeVerificationRow | null | undefined): AgeVerification {
  return {
    status: normalizeAgeVerificationStatus(row?.age_verification_status),
    note: row?.age_verification_note ?? null,
    submittedAt: row?.age_verification_submitted_at ?? null,
    verifiedAt: row?.age_verified_at ?? null,
  };
}

// User-facing message shown on the withdrawal surface. Returns null once the
// player is verified (no gate).
export function getWithdrawalAgeGateMessage(
  status: AgeVerificationStatus,
  contact: string,
): string | null {
  if (status === "verified") {
    return null;
  }

  if (status === "pending") {
    return "Your age verification is under review. Withdrawals open once an admin confirms you are 18 or older.";
  }

  if (status === "rejected") {
    return `Your age verification was not accepted. Send a clear government photo ID to ${contact}, then mark your documents as sent.`;
  }

  return `Withdrawals require proof that you are 18 or older. Send a government photo ID to ${contact}, then mark your documents as sent.`;
}

export async function loadAgeVerification(
  supabase: SupabaseLike,
  userId: string,
): Promise<{ verification: AgeVerification } | { error: string }> {
  const profile = await supabase
    .from("worldcup_referral_profiles")
    .select(
      "age_verification_status,age_verification_note,age_verification_submitted_at,age_verified_at,age_verified_by",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (profile.error) {
    return { error: "Could not load age verification status." };
  }

  return { verification: formatAgeVerification(profile.data as AgeVerificationRow | null) };
}
