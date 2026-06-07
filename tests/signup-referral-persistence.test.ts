import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260605090000_worldcup_signup_referral_persistence.sql",
  "utf8",
);
const resolveRoute = readFileSync("src/app/api/referrals/resolve/route.ts", "utf8");
const signupRoute = readFileSync("src/app/api/referrals/signup/route.ts", "utf8");
const entriesRoute = readFileSync("src/app/api/entries/route.ts", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const loginRegister = readFileSync("src/components/login-register.tsx", "utf8");
const campaignAttribution = readFileSync("src/lib/campaign-attribution.ts", "utf8");
const lateEntryMigration = readFileSync(
  "supabase/migrations/20260605023000_worldcup_late_entry_in_progress.sql",
  "utf8",
);
const flatReferralMigration = readFileSync(
  "supabase/migrations/20260606194000_worldcup_flat_referral_percent.sql",
  "utf8",
);
const signupAttributionMigration = readFileSync(
  "supabase/migrations/20260607110000_worldcup_signup_referral_utm_attribution.sql",
  "utf8",
);

describe("signup referral persistence", () => {
  it("stores accepted signup inviters on referral profiles", () => {
    assert.match(migration, /add column if not exists signup_referral_code text/);
    assert.match(migration, /add column if not exists signup_referrer_user_id uuid/);
    assert.match(migration, /add column if not exists signup_referral_accepted_at timestamptz/);
    assert.match(migration, /worldcup_referral_profiles_signup_referrer_idx/);
    assert.match(signupAttributionMigration, /add column if not exists signup_utm_source/);
    assert.match(signupAttributionMigration, /add column if not exists signup_utm_medium/);
    assert.match(signupAttributionMigration, /add column if not exists signup_utm_campaign/);
    assert.match(signupAttributionMigration, /worldcup_referral_profiles_signup_utm_source_idx/);
  });

  it("adds a signed-in route that saves the accepted inviter without allowing replacement", () => {
    assert.match(signupRoute, /getBearerToken\(request\)/);
    assert.match(signupRoute, /getAuthProvider\(user\) !== "google"/);
    assert.match(signupRoute, /referralTermsAccepted === true/);
    assert.match(signupRoute, /You cannot use your own referral code/);
    assert.match(signupRoute, /profile\.signup_referrer_user_id/);
    assert.match(signupRoute, /\.is\("signup_referrer_user_id", null\)/);
    assert.match(signupRoute, /signup_referral_accepted_at/);
    assert.match(signupRoute, /optionalString\(body\.utmSource,\s*"UTM source"/);
    assert.match(signupRoute, /signup_utm_source:\s*utmSource/);
  });

  it("keeps referral invite links resolvable before Google auth", () => {
    assert.match(resolveRoute, /export async function GET\(request: Request\)/);
    assert.match(resolveRoute, /enforceRateLimit\(request, "referral-resolve"/);
    assert.match(resolveRoute, /normalizeReferralCode/);
    assert.match(resolveRoute, /worldcup_referral_profiles/);
    assert.match(resolveRoute, /select\("user_id,referral_code,display_name"\)/);
    assert.match(resolveRoute, /getInviterReferralPercent/);
    assert.match(resolveRoute, /referralPercent/);
    assert.match(resolveRoute, /valid: Boolean\(profile\.data\)/);
    assert.match(resolveRoute, /valid: false/);
    assert.match(loginRegister, /fetch\(`\/api\/referrals\/resolve\?code=\$\{encodeURIComponent\(normalized\)\}`\)/);
    assert.match(loginRegister, /response\.ok && result\.valid/);
    assert.match(loginRegister, /catch/);
  });

  it("persists the registration choice after Google auth", () => {
    assert.match(dashboard, /persistedSignupReferralRef/);
    assert.match(dashboard, /fetch\("\/api\/referrals\/signup"/);
    assert.match(dashboard, /referralTermsAccepted:\s*true/);
    assert.match(loginRegister, /SIGNUP_ATTRIBUTION_KEY/);
    assert.match(loginRegister, /persistSignupAttributionFromUrl/);
    assert.match(loginRegister, /getCampaignReferralCode\(params\)/);
    assert.match(dashboard, /getCampaignReferralCode\(params\)/);
    assert.match(loginRegister, /params\.get\("utm_source"\)/);
    assert.match(dashboard, /getStoredSignupAttribution/);
    assert.match(dashboard, /\.\.\.signupAttribution/);
    assert.match(dashboard, /sendSignupFunnelEventOnce/);
    assert.match(dashboard, /signup-referral-\$\{event\}/);
    assert.match(dashboard, /event: "attempt"/);
    assert.match(dashboard, /event: "saved"/);
    assert.match(dashboard, /event: "save-failed"/);
    assert.match(dashboard, /getCampaignLoginRedirectHref/);
    assert.match(dashboard, /window\.location\.replace\(campaignLoginHref\)/);
    assert.match(dashboard, /params\.set\("ref", referralCode\)/);
    assert.match(campaignAttribution, /6971048256000/);
    assert.match(campaignAttribution, /26BC4B90CB/);
  });

  it("uses saved signup referral before ticket-source fallback", () => {
    assert.match(entriesRoute, /signup_referral_code,signup_referrer_user_id,signup_referral_accepted_at/);
    assert.match(entriesRoute, /savedSignupReferral/);
    assert.match(entriesRoute, /referrerUserId = savedReferrerUserId/);
    assert.match(lateEntryMigration, /v_effective_referrer_user_id := p_referrer_user_id/);
    assert.match(lateEntryMigration, /if v_effective_referrer_user_id is null[\s\S]*?v_ticket\.source_referrer_user_id/);
  });

  it("forces every accepted referral payout to 5 percent", () => {
    assert.match(flatReferralMigration, /worldcup_entries_referral_fee_percent_check/);
    assert.match(flatReferralMigration, /check \(referral_fee_percent in \(0, 5\)\)/);
    assert.match(flatReferralMigration, /worldcup_referrals_referral_fee_percent_check/);
    assert.match(flatReferralMigration, /check \(referral_fee_percent = 5\)/);
    assert.match(flatReferralMigration, /worldcup_force_flat_referral_percent/);
    assert.match(flatReferralMigration, /when new\.referrer_user_id is not null then 5/);
    assert.match(flatReferralMigration, /worldcup_entries_flat_referral_percent/);
    assert.match(flatReferralMigration, /worldcup_referrals_flat_referral_percent/);
  });
});
