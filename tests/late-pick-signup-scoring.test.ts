import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260622100000_worldcup_late_pick_signup_scoring.sql",
  "utf8",
);
const entryRoute = readFileSync("src/app/api/entries/route.ts", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const loginRegister = readFileSync("src/components/login-register.tsx", "utf8");
const kickoffCountdown = readFileSync("src/components/kickoff-countdown.tsx", "utf8");
const heroCard = readFileSync("src/components/hero-card.tsx", "utf8");
const heroSwiper = readFileSync("src/components/hero-swiper.tsx", "utf8");
const architecture = readFileSync("docs/ARCHITECTURE.md", "utf8");

describe("late picks score from signup time", () => {
  it("removes the per-team pick cutoff at the database boundary", () => {
    assert.match(migration, /drop trigger if exists worldcup_entry_teams_pick_cutoff/);
    assert.match(migration, /create or replace function public\.worldcup_assert_team_pick_is_open\(\)/);
    assert.match(migration, /return new;/);
  });

  it("awards points only for matches that kick off after the entry was created", () => {
    assert.match(migration, /create or replace function public\.worldcup_apply_match_points/);
    assert.match(migration, /m\.kickoff_at >= e\.created_at/);
    assert.match(migration, /m\.kickoff_at < e\.created_at/);
    assert.match(migration, /delete from public\.worldcup_entry_match_points/);
    assert.match(migration, /perform public\.worldcup_apply_match_points\(match_record\.id\)/);
  });

  it("keeps draft previews on the same post-signup scoring window", () => {
    assert.match(migration, /create or replace view public\.worldcup_entry_team_totals/);
    assert.match(migration, /m\.status = 'completed'/);
    assert.match(migration, /m\.kickoff_at >= e\.created_at/);
    assert.match(migration, /alter view public\.worldcup_entry_team_totals\s+set \(security_invoker = true\)/);
  });

  it("lets the entry API save any valid three teams", () => {
    assert.doesNotMatch(entryRoute, /getLockedTeamIds/);
    assert.doesNotMatch(entryRoute, /groupMatchesResult/);
    assert.doesNotMatch(entryRoute, /can no longer be selected because the first match/);
    assert.match(entryRoute, /worldcup_save_draft_entry/);
  });

  it("explains the late-entry scoring rule in the UI", () => {
    assert.match(dashboard, /Pick any 3 teams, even after kickoff/);
    assert.match(dashboard, /Your score starts from your signup time/);
    assert.match(dashboard, /Past matches do not score for late signups/);
    assert.match(loginRegister, /Pick any 3 teams/);
    assert.match(kickoffCountdown, /Late entries score from signup/);
    assert.match(heroCard, /Points start from signup/);
    assert.match(heroSwiper, /Earlier matches score 0/);
    assert.match(architecture, /Late entries may choose any team/);
    assert.doesNotMatch(architecture, /must still be before kickoff/);
  });
});
