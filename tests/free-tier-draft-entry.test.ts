import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const freeTierMigration = readFileSync(
  "supabase/migrations/20260606143000_worldcup_free_draft_entries.sql",
  "utf8",
);
const draftPrivatePointsMigration = readFileSync(
  "supabase/migrations/20260606153000_worldcup_draft_private_points.sql",
  "utf8",
);
const awardedLeaderboardMigration = readFileSync(
  "supabase/migrations/20260601194500_worldcup_kickoff_cron_points.sql",
  "utf8",
);
const entryRoute = readFileSync("src/app/api/entries/route.ts", "utf8");
const referralsMeRoute = readFileSync("src/app/api/referrals/me/route.ts", "utf8");
const standingRoute = readFileSync("src/app/api/me/standing/route.ts", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const myStanding = readFileSync("src/components/my-standing.tsx", "utf8");

describe("free draft entry tier", () => {
  it("adds service-role RPCs for saving free drafts and locking paid drafts", () => {
    assert.match(freeTierMigration, /create or replace function public\.worldcup_save_draft_entry/);
    assert.match(freeTierMigration, /create or replace function public\.worldcup_lock_draft_entry/);
    assert.match(freeTierMigration, /status = 'draft'/);
    assert.match(freeTierMigration, /raise exception 'ENTRY_ALREADY_LOCKED'/);
    assert.match(freeTierMigration, /raise exception 'NO_TICKET'/);
    assert.match(freeTierMigration, /set consumed_by_entry_id = v_entry\.id, consumed_at = now\(\)/);
    assert.match(freeTierMigration, /grant execute on function public\.worldcup_save_draft_entry\(uuid, uuid, text, text\[\], text, uuid\)\s+to service_role;/);
    assert.match(freeTierMigration, /grant execute on function public\.worldcup_lock_draft_entry\(uuid, uuid\)\s+to service_role;/);
  });

  it("keeps the paid leaderboard locked-entry only", () => {
    assert.match(awardedLeaderboardMigration, /where e\.status = 'locked'/);
    assert.doesNotMatch(awardedLeaderboardMigration, /where e\.status in \('draft', 'locked'\)/);
  });

  it("routes entries through save-draft first and lock only after ticket", () => {
    assert.match(entryRoute, /type EntryAction = "save-draft" \| "lock"/);
    assert.match(entryRoute, /body\.action === "save-draft" \? "save-draft" : "lock"/);
    assert.match(entryRoute, /worldcup_save_draft_entry/);
    assert.match(entryRoute, /worldcup_lock_draft_entry/);
    assert.match(entryRoute, /status: "draft"/);
    assert.match(entryRoute, /status: "locked"/);
    assert.match(entryRoute, /NO_TICKET/);
    assert.match(entryRoute, /if \(action === "lock" && !isPaidActionLaunchTestAdmin\(user\.email\)\)/);
  });

  it("shows free picks as a private score preview in the app", () => {
    assert.match(dashboard, /accountHasDraftEntry = accountEntry\?\.status === "draft"/);
    assert.match(dashboard, /accountHasEntry = accountEntry\?\.status === "locked"/);
    assert.match(dashboard, /Save free picks/);
    assert.match(dashboard, /Update free picks/);
    assert.match(dashboard, /Lock paid entry/);
    assert.match(dashboard, /private points preview/);
    assert.match(dashboard, /what\s+would happen if the draft were paid/);
    assert.match(dashboard, /leaderboard-private-preview/);
    assert.match(dashboard, /Your free picks are scoring privately/);
    assert.match(dashboard, /leaderboard-preview-stats/);
    assert.match(dashboard, /What-if share/);
    assert.match(dashboard, /would happen if your draft entered the paid leaderboard/);
    assert.match(dashboard, /onClick=\{\(\) => submitEntry\(hasEntryTicket \? "lock" : "save-draft"\)\}/);
    assert.match(myStanding, /Preview rank/);
    assert.match(myStanding, /private preview/);
    assert.match(myStanding, /if locked now/);
    assert.match(myStanding, /worldcup-account-updated/);
  });

  it("awards match points to free drafts while keeping the public board paid-only", () => {
    assert.match(draftPrivatePointsMigration, /create or replace function public\.worldcup_apply_match_points/);
    assert.match(draftPrivatePointsMigration, /e\.status in \('draft', 'locked'\)/);
    assert.match(draftPrivatePointsMigration, /perform public\.worldcup_apply_match_points\(match_record\.id\)/);
    assert.match(awardedLeaderboardMigration, /where e\.status = 'locked'/);
  });

  it("calculates draft what-if points without inserting drafts into the awarded leaderboard", () => {
    assert.match(standingRoute, /worldcup_entry_team_totals/);
    assert.match(standingRoute, /shadowRankForPoints/);
    assert.match(standingRoute, /calculatePaidPlaces\(participants \+ 1\)/);
    assert.match(standingRoute, /myEntryStatus !== "locked"/);
    assert.match(standingRoute, /shareForShadowRank/);
    assert.match(referralsMeRoute, /entryPreview/);
    assert.match(referralsMeRoute, /ownEntry\.data\.status === "draft"/);
    assert.match(referralsMeRoute, /worldcup_entry_team_totals/);
    assert.match(referralsMeRoute, /worldcup_awarded_leaderboard/);
    assert.match(dashboard, /draftPreview = accountHasDraftEntry/);
    assert.match(dashboard, /draftPreviewDisplay = accountHasDraftEntry/);
    assert.match(dashboard, /draftPreviewFallback/);
  });
});
