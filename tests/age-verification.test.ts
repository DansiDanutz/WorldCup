import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { NextResponse } from "next/server";

import { createAgeVerificationHandlers } from "../src/app/api/age-verification/route.ts";
import {
  canSubmitAgeDocs,
  formatAgeVerification,
  getAgeVerificationContact,
  getWithdrawalAgeGateMessage,
  isAgeVerified,
  normalizeAgeVerificationStatus,
} from "../src/lib/age-verification.ts";

function getRequest(headers: Record<string, string> = {}) {
  return new Request("https://worldcup26.world/api/age-verification", {
    method: "GET",
    headers,
  });
}

function postRequest(headers: Record<string, string> = {}) {
  return new Request("https://worldcup26.world/api/age-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: "{}",
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

// Minimal Supabase stub: every worldcup_referral_profiles read resolves to
// `profileRow`; the final update resolves to `updatedRow`. Throwing on update
// lets a test assert the status write was never reached.
function profileChain(profileRow: unknown, updatedRow: unknown, throwOnUpdate = false) {
  const api: Record<string, unknown> = {
    select: () => api,
    eq: () => api,
    neq: () => api,
    order: () => api,
    limit: () => api,
    insert: () => api,
    maybeSingle: () => Promise.resolve({ data: profileRow, error: null }),
    update: () => {
      if (throwOnUpdate) {
        throw new Error("update should not run when the player is already verified");
      }
      return api;
    },
    single: () => Promise.resolve({ data: updatedRow ?? profileRow, error: null }),
  };
  return api;
}

function stubClient(options: { profileRow: unknown; updatedRow?: unknown; throwOnUpdate?: boolean }) {
  return {
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: "user-id",
              email: "player@example.com",
              user_metadata: {},
              app_metadata: { provider: "google" },
            },
          },
          error: null,
        };
      },
    },
    from(table: string) {
      if (table === "worldcup_referral_profiles") {
        return profileChain(options.profileRow, options.updatedRow, options.throwOnUpdate);
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

const baseProfile = {
  user_id: "user-id",
  referral_code: "ABCDEF",
  display_name: "player@example.com",
  email: "player@example.com",
};

describe("age-verification helpers", () => {
  it("normalizes unknown statuses to unverified", () => {
    assert.equal(normalizeAgeVerificationStatus("verified"), "verified");
    assert.equal(normalizeAgeVerificationStatus("pending"), "pending");
    assert.equal(normalizeAgeVerificationStatus("nonsense"), "unverified");
    assert.equal(normalizeAgeVerificationStatus(undefined), "unverified");
  });

  it("only treats an explicit verified status as age-verified", () => {
    assert.equal(isAgeVerified("verified"), true);
    assert.equal(isAgeVerified("pending"), false);
    assert.equal(isAgeVerified("rejected"), false);
    assert.equal(isAgeVerified("unverified"), false);
    assert.equal(isAgeVerified(null), false);
  });

  it("lets players (re)submit from any non-verified status", () => {
    assert.equal(canSubmitAgeDocs("unverified"), true);
    assert.equal(canSubmitAgeDocs("rejected"), true);
    assert.equal(canSubmitAgeDocs("pending"), true);
    assert.equal(canSubmitAgeDocs("verified"), false);
  });

  it("reads the contact channel from the environment with a default", () => {
    assert.equal(getAgeVerificationContact({}), "age-verification@worldcup26.world");
    assert.equal(
      getAgeVerificationContact({ WORLDCUP_AGE_VERIFICATION_CONTACT: "id@worldcup26.world" }),
      "id@worldcup26.world",
    );
  });

  it("returns no withdrawal gate message once verified, and an actionable one otherwise", () => {
    assert.equal(getWithdrawalAgeGateMessage("verified", "id@x.com"), null);
    assert.match(getWithdrawalAgeGateMessage("unverified", "id@x.com") ?? "", /18 or older/);
    assert.match(getWithdrawalAgeGateMessage("unverified", "id@x.com") ?? "", /id@x\.com/);
    assert.match(getWithdrawalAgeGateMessage("pending", "id@x.com") ?? "", /under review/);
    assert.match(getWithdrawalAgeGateMessage("rejected", "id@x.com") ?? "", /not accepted/);
  });

  it("formats a profile row into a stable client shape", () => {
    assert.deepEqual(
      formatAgeVerification({
        age_verification_status: "verified",
        age_verification_note: "ID checked",
        age_verification_submitted_at: "2026-06-04T00:00:00Z",
        age_verified_at: "2026-06-04T01:00:00Z",
      }),
      {
        status: "verified",
        note: "ID checked",
        submittedAt: "2026-06-04T00:00:00Z",
        verifiedAt: "2026-06-04T01:00:00Z",
      },
    );
  });
});

describe("age-verification route handler", () => {
  it("requires a bearer token", async () => {
    let createdClient = false;
    const handlers = createAgeVerificationHandlers({
      enforceRateLimit: async () => null,
      getBearerToken: () => null,
      createServiceSupabaseClient: () => {
        createdClient = true;
        return {} as never;
      },
      getContact: () => "age-verification@worldcup26.world",
    });

    const response = await handlers.get(getRequest());
    assert.equal(response.status, 401);
    assert.equal((await readJson(response)).error, "Sign in with Google first.");
    assert.equal(createdClient, false);
  });

  it("short-circuits when rate limited without creating a client", async () => {
    let createdClient = false;
    const handlers = createAgeVerificationHandlers({
      enforceRateLimit: async () => NextResponse.json({ error: "Slow down." }, { status: 429 }),
      getBearerToken: () => "token",
      createServiceSupabaseClient: () => {
        createdClient = true;
        return {} as never;
      },
      getContact: () => "age-verification@worldcup26.world",
    });

    const response = await handlers.post(postRequest({ Authorization: "Bearer token" }));
    assert.equal(response.status, 429);
    assert.equal(createdClient, false);
  });

  it("returns the current status and contact channel", async () => {
    const handlers = createAgeVerificationHandlers({
      enforceRateLimit: async () => null,
      getBearerToken: () => "token",
      createServiceSupabaseClient: () =>
        stubClient({
          profileRow: { ...baseProfile, age_verification_status: "verified", age_verified_at: "2026-06-04T00:00:00Z" },
        }) as never,
      getContact: () => "id@worldcup26.world",
    });

    const response = await handlers.get(getRequest({ Authorization: "Bearer token" }));
    assert.equal(response.status, 200);
    const body = await readJson(response);
    assert.equal(body.status, "verified");
    assert.equal(body.contact, "id@worldcup26.world");
  });

  it("marks documents as pending from an unverified status", async () => {
    const handlers = createAgeVerificationHandlers({
      enforceRateLimit: async () => null,
      getBearerToken: () => "token",
      createServiceSupabaseClient: () =>
        stubClient({
          profileRow: { ...baseProfile, age_verification_status: "unverified" },
          updatedRow: {
            age_verification_status: "pending",
            age_verification_note: null,
            age_verification_submitted_at: "2026-06-04T00:00:00Z",
            age_verified_at: null,
          },
        }) as never,
      getContact: () => "id@worldcup26.world",
    });

    const response = await handlers.post(postRequest({ Authorization: "Bearer token" }));
    assert.equal(response.status, 200);
    const body = await readJson(response);
    assert.equal(body.status, "pending");
    assert.equal(body.contact, "id@worldcup26.world");
  });

  it("does not let an already-verified player re-open verification", async () => {
    const handlers = createAgeVerificationHandlers({
      enforceRateLimit: async () => null,
      getBearerToken: () => "token",
      createServiceSupabaseClient: () =>
        stubClient({
          profileRow: { ...baseProfile, age_verification_status: "verified" },
          throwOnUpdate: true,
        }) as never,
      getContact: () => "id@worldcup26.world",
    });

    const response = await handlers.post(postRequest({ Authorization: "Bearer token" }));
    assert.equal(response.status, 409);
    assert.equal((await readJson(response)).error, "Your age is already verified.");
  });
});

describe("age-verification wiring", () => {
  const migration = readFileSync(
    "supabase/migrations/20260604180000_worldcup_age_verification.sql",
    "utf8",
  );
  const withdrawalsRoute = readFileSync("src/app/api/withdrawals/route.ts", "utf8");
  const adminWithdrawalsRoute = readFileSync("src/app/api/admin/withdrawals/route.ts", "utf8");
  const adminAgeRoute = readFileSync("src/app/api/admin/age-verifications/route.ts", "utf8");
  const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
  const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

  it("stores the review state on the profile and gates only withdrawals", () => {
    assert.match(migration, /age_verification_status text not null default 'unverified'/);
    assert.match(migration, /age_verification_status in \('unverified', 'pending', 'verified', 'rejected'\)/);
    assert.match(migration, /age_verified_at timestamptz/);
    assert.match(migration, /age_verified_by text/);
  });

  it("blocks the withdrawal request until the player is age-verified", () => {
    assert.match(withdrawalsRoute, /loadAgeVerification/);
    assert.match(withdrawalsRoute, /isAgeVerified\(ageVerification\.verification\.status\)/);
    assert.match(withdrawalsRoute, /getWithdrawalAgeGateMessage/);
  });

  it("backstops admin approval with an age-verified check", () => {
    assert.match(adminWithdrawalsRoute, /loadAgeVerification\(supabase, row\.user_id\)/);
    assert.match(adminWithdrawalsRoute, /not age-verified/);
    assert.match(adminWithdrawalsRoute, /releaseApprovedWithdrawal/);
  });

  it("exposes an admin review route guarded by requireAdmin and a required note", () => {
    assert.match(adminAgeRoute, /requireAdmin/);
    assert.match(adminAgeRoute, /\["list", "verify", "reject"\]/);
    assert.match(adminAgeRoute, /A review note is required/);
    assert.match(adminAgeRoute, /age_verification_status: status/);
  });

  it("keeps final-payout age review in admin while the player wallet defers withdrawals", () => {
    assert.doesNotMatch(walletScreen, /\/api\/age-verification/);
    assert.doesNotMatch(walletScreen, /I&apos;ve sent my documents/);
    assert.doesNotMatch(walletScreen, /ageVerification\?\.status !== "verified"/);
    assert.match(walletScreen, /No withdrawal request is open during the tournament/);
    assert.match(adminConsole, /Age verification/);
    assert.match(adminConsole, /Load Age Verifications/);
    assert.match(adminConsole, /\/api\/admin\/age-verifications/);
  });
});
