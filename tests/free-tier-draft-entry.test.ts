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
const freeLockedMigration = readFileSync(
  "supabase/migrations/20260610120000_worldcup_free_locked_entries.sql",
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

  it("locks teams for free forever, separate from the paid pool", () => {
    assert.match(
      freeLockedMigration,
      /create or replace function public\.worldcup_commit_entry/,
    );
    // Free permanent lock sets the committed tier without consuming a ticket.
    assert.match(freeLockedMigration, /status = 'committed'/);
    assert.doesNotMatch(freeLockedMigration, /worldcup_commit_entry[\s\S]*?consumed_at = now\(\)/);
    // Picks are immutable once committed or locked.
    assert.match(freeLockedMigration, /raise exception 'TEAMS_LOCKED'/);
    assert.match(
      freeLockedMigration,
      /check \(status in \('draft', 'committed', 'locked'\)\)/,
    );
    // Point snapshots accrue for committed entries too, so a later ticket keeps
    // the full history.
    assert.match(freeLockedMigration, /e\.status in \('draft', 'committed', 'locked'\)/);
    assert.match(
      freeLockedMigration,
      /grant execute on function public\.worldcup_commit_entry\(uuid, uuid\)\s+to service_role;/,
    );
    // The paid pool / public leaderboard stays locked-only.
    assert.match(awardedLeaderboardMigration, /where e\.status = 'locked'/);
  });

  it("routes entries through save-draft, free commit, and paid pool lock", () => {
    assert.match(entryRoute, /type EntryAction = "save-draft" \| "commit" \| "lock"/);
    assert.match(entryRoute, /worldcup_save_draft_entry/);
    assert.match(entryRoute, /worldcup_commit_entry/);
    assert.match(entryRoute, /worldcup_lock_draft_entry/);
    assert.match(entryRoute, /status: "draft"/);
    assert.match(entryRoute, /status: "committed"/);
    assert.match(entryRoute, /status: "locked"/);
    assert.match(entryRoute, /NO_TICKET/);
    assert.match(entryRoute, /TEAMS_LOCKED/);
    // Already-final picks can still enter the pool by consuming a ticket.
    assert.match(entryRoute, /action === "lock" && teamsAlreadyFinal/);
    assert.match(entryRoute, /if \(action === "lock" && !isPaidActionLaunchTestAdmin\(user\.email\)\)/);
  });

  it("locks teams for free and shows a private 'if paying' preview in the app", () => {
    assert.match(dashboard, /accountHasDraftEntry = accountEntry\?\.status === "draft"/);
    assert.match(dashboard, /accountInPool = accountEntry\?\.status === "locked"/);
    assert.match(dashboard, /accountCommittedFree = accountEntry\?\.status === "committed"/);
    // Primary lock action: free commit without a ticket, paid pool lock with one.
    assert.match(dashboard, /Lock my 3 teams/);
    assert.match(dashboard, /Lock & enter prize pool/);
    assert.match(dashboard, /Enter the prize pool/);
    assert.match(dashboard, /submitEntry\(entryPrimaryAction\)/);
    assert.match(dashboard, /Locking is permanent/);
    assert.match(myStanding, /Preview rank/);
    assert.match(myStanding, /private preview/);
    assert.match(myStanding, /if you were paying/);
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
