import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260605090000_worldcup_signup_referral_persistence.sql",
  "utf8",
);
const signupRoute = readFileSync("src/app/api/referrals/signup/route.ts", "utf8");
const entriesRoute = readFileSync("src/app/api/entries/route.ts", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const lateEntryMigration = readFileSync(
  "supabase/migrations/20260605023000_worldcup_late_entry_in_progress.sql",
  "utf8",
);

describe("signup referral persistence", () => {
  it("stores accepted signup inviters on referral profiles", () => {
    assert.match(migration, /add column if not exists signup_referral_code text/);
    assert.match(migration, /add column if not exists signup_referrer_user_id uuid/);
    assert.match(migration, /add column if not exists signup_referral_accepted_at timestamptz/);
    assert.match(migration, /worldcup_referral_profiles_signup_referrer_idx/);
  });

  it("adds a signed-in route that saves the accepted inviter without allowing replacement", () => {
    assert.match(signupRoute, /getBearerToken\(request\)/);
    assert.match(signupRoute, /getAuthProvider\(user\) !== "google"/);
    assert.match(signupRoute, /referralTermsAccepted === true/);
    assert.match(signupRoute, /You cannot use your own referral code/);
    assert.match(signupRoute, /profile\.signup_referrer_user_id/);
    assert.match(signupRoute, /\.is\("signup_referrer_user_id", null\)/);
    assert.match(signupRoute, /signup_referral_accepted_at/);
  });

  it("persists the registration choice after Google auth", () => {
    assert.match(dashboard, /persistedSignupReferralRef/);
    assert.match(dashboard, /fetch\("\/api\/referrals\/signup"/);
    assert.match(dashboard, /referralTermsAccepted:\s*true/);
  });

  it("uses saved signup referral before ticket-source fallback", () => {
    assert.match(entriesRoute, /signup_referral_code,signup_referrer_user_id,signup_referral_accepted_at/);
    assert.match(entriesRoute, /savedSignupReferral/);
    assert.match(entriesRoute, /referrerUserId = savedReferrerUserId/);
    assert.match(lateEntryMigration, /v_effective_referrer_user_id := p_referrer_user_id/);
    assert.match(lateEntryMigration, /if v_effective_referrer_user_id is null[\s\S]*?v_ticket\.source_referrer_user_id/);
  });
});
