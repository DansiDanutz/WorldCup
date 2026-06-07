import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const metricsRoute = readFileSync("src/app/api/admin/metrics/route.ts", "utf8");
const analyticsViewRoute = readFileSync("src/app/api/analytics/view/route.ts", "utf8");
const appViewTracker = readFileSync("src/components/app-view-tracker.tsx", "utf8");
const campaignAttribution = readFileSync("src/lib/campaign-attribution.ts", "utf8");
const rootLayout = readFileSync("src/app/layout.tsx", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");
const metricsMigration = readFileSync(
  "supabase/migrations/20260607090000_worldcup_admin_app_metrics.sql",
  "utf8",
);
const attributionMigration = readFileSync(
  "supabase/migrations/20260607103000_worldcup_app_view_utm_attribution.sql",
  "utf8",
);

describe("admin account and app-view metrics", () => {
  it("keeps aggregate metrics behind admin auth", () => {
    assert.match(metricsRoute, /requireAdmin/);
    assert.match(metricsRoute, /enforceRateLimit\(request,\s*"admin"/);
    assert.match(metricsRoute, /worldcup_referral_profiles/);
    assert.match(metricsRoute, /worldcup_tickets/);
    assert.match(metricsRoute, /worldcup_entries/);
    assert.match(metricsRoute, /worldcup_app_views/);
    assert.match(metricsRoute, /freeAccounts/);
    assert.match(metricsRoute, /paidAccounts/);
    assert.match(metricsRoute, /lockedPaidEntries/);
    assert.match(metricsRoute, /appViews/);
    assert.match(metricsRoute, /topSourceViews/);
    assert.match(metricsRoute, /buildTopSources/);
    assert.match(metricsRoute, /paidUserIds/);
    assert.match(metricsRoute, /trackingReady:\s*appViewTrackingReady/);
    assert.match(metricsRoute, /topSources:\s*buildTopSources/);
  });

  it("records bounded app-view events through the API instead of public table access", () => {
    assert.match(metricsMigration, /create table if not exists public\.worldcup_app_views/);
    assert.match(metricsMigration, /alter table public\.worldcup_app_views enable row level security/);
    assert.match(metricsMigration, /revoke all on table public\.worldcup_app_views from anon, authenticated/);
    assert.match(metricsMigration, /check \(char_length\(path\) between 1 and 240\)/);
    assert.match(metricsMigration, /referral_code ~ '\^\[A-Z0-9\]\{6,12\}\$'/);
    assert.match(attributionMigration, /add column if not exists utm_source/);
    assert.match(attributionMigration, /add column if not exists utm_medium/);
    assert.match(attributionMigration, /add column if not exists utm_campaign/);
    assert.match(attributionMigration, /add column if not exists utm_content/);
    assert.match(attributionMigration, /worldcup_app_views_utm_source_created_at_idx/);

    assert.match(analyticsViewRoute, /enforceRateLimit\(request,\s*"analytics-view"/);
    assert.match(analyticsViewRoute, /getBearerToken/);
    assert.match(analyticsViewRoute, /normalizeReferralCode/);
    assert.match(analyticsViewRoute, /optionalString\(body\.utmSource,\s*"UTM source"/);
    assert.match(analyticsViewRoute, /utm_source:\s*utmSource/);
    assert.match(analyticsViewRoute, /from\("worldcup_app_views"\)\.insert/);
    assert.match(analyticsViewRoute, /user_agent:\s*truncate/);
  });

  it("wires app-view tracking into the root app shell", () => {
    assert.match(appViewTracker, /"use client"/);
    assert.match(appViewTracker, /APP_VIEW_SESSION_KEY/);
    assert.match(appViewTracker, /getOrCreateAppViewSessionId/);
    assert.match(appViewTracker, /shouldSendView/);
    assert.match(appViewTracker, /createBrowserSupabaseClient/);
    assert.match(appViewTracker, /\/api\/analytics\/view/);
    assert.match(appViewTracker, /getCampaignReferralCode\(url\.searchParams\)/);
    assert.match(appViewTracker, /worldcup_referral_code/);
    assert.match(appViewTracker, /utmSource/);
    assert.match(appViewTracker, /getSearchParam\(url,\s*"utm_source"\)/);
    assert.match(appViewTracker, /utmCampaign/);
    assert.match(campaignAttribution, /6971048256000/);
    assert.match(campaignAttribution, /26BC4B90CB/);
    assert.match(rootLayout, /import \{ AppViewTracker \}/);
    assert.match(rootLayout, /<AppViewTracker \/>/);
  });

  it("shows free accounts, paid accounts, and app views in the admin console", () => {
    assert.match(adminConsole, /AdminMetrics/);
    assert.match(adminConsole, /const \[adminMetrics, setAdminMetrics\]/);
    assert.match(adminConsole, /\/api\/admin\/metrics/);
    assert.match(adminConsole, /App analytics/);
    assert.match(adminConsole, /Free accounts/);
    assert.match(adminConsole, /Signed up, no assigned ticket yet/);
    assert.match(adminConsole, /Paid accounts/);
    assert.match(adminConsole, /At least 1 ticket assigned/);
    assert.match(adminConsole, /App views/);
    assert.match(adminConsole, /Top traffic source/);
    assert.match(adminConsole, /Locked paid entries/);
    assert.match(adminConsole, /Tickets assigned/);
    assert.match(adminConsole, /admin-analytics-panel/);
  });
});
