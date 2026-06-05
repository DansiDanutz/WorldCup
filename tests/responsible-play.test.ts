import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  formatResponsiblePlayStatus,
  getResponsiblePlayRestriction,
  getSelfExclusionUntil,
  keepLongestSelfExclusion,
  RESPONSIBLE_PLAY_MAX_ENTRY_LIMIT,
  RESPONSIBLE_PLAY_SEASON_END_ISO,
} from "../src/lib/responsible-play.ts";

const migration = readFileSync(
  "supabase/migrations/20260602024500_worldcup_responsible_play.sql",
  "utf8",
);
const userRoute = readFileSync("src/app/api/responsible-play/route.ts", "utf8");
const entryRoute = readFileSync("src/app/api/entries/route.ts", "utf8");
const ticketRoute = readFileSync("src/app/api/tickets/purchase/route.ts", "utf8");
const adminTicketRoute = readFileSync("src/app/api/admin/tickets/route.ts", "utf8");
const depositAddressRoute = readFileSync("src/app/api/deposits/address/route.ts", "utf8");
const depositClaimRoute = readFileSync("src/app/api/deposits/claims/route.ts", "utf8");
const withdrawalRoute = readFileSync("src/app/api/withdrawals/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");

describe("responsible play controls", () => {
  it("calculates fixed self-exclusion windows", () => {
    const now = new Date("2026-06-02T00:00:00.000Z");

    assert.equal(getSelfExclusionUntil("24h", now), "2026-06-03T00:00:00.000Z");
    assert.equal(getSelfExclusionUntil("7d", now), "2026-06-09T00:00:00.000Z");
    assert.equal(getSelfExclusionUntil("30d", now), "2026-07-02T00:00:00.000Z");
    assert.equal(getSelfExclusionUntil("season", now), RESPONSIBLE_PLAY_SEASON_END_ISO);
  });

  it("never shortens an active self-exclusion", () => {
    assert.equal(
      keepLongestSelfExclusion("2026-06-20T00:00:00.000Z", "2026-06-03T00:00:00.000Z"),
      "2026-06-20T00:00:00.000Z",
    );
    assert.equal(
      keepLongestSelfExclusion("2026-06-03T00:00:00.000Z", "2026-06-20T00:00:00.000Z"),
      "2026-06-20T00:00:00.000Z",
    );
  });

  it("blocks new paid participation while self-exclusion is active", () => {
    const status = formatResponsiblePlayStatus(
      {
        max_entries: null,
        self_excluded_until: "2026-06-03T00:00:00.000Z",
        self_exclusion_reason: null,
        updated_at: null,
      },
      { now: new Date("2026-06-02T00:00:00.000Z") },
    );

    assert.match(getResponsiblePlayRestriction(status, "deposit") ?? "", /self-exclusion is active/i);
    assert.match(getResponsiblePlayRestriction(status, "ticket") ?? "", /ticket purchases/);
    assert.match(getResponsiblePlayRestriction(status, "entry") ?? "", /entries are paused/);
    assert.equal(getResponsiblePlayRestriction(status, "withdrawal"), null);
  });

  it("enforces entry-ticket limits without blocking deposits", () => {
    const status = formatResponsiblePlayStatus(
      {
        max_entries: 2,
        self_excluded_until: null,
        self_exclusion_reason: null,
        updated_at: null,
      },
      { ticketsReserved: 1, entriesUsed: 0 },
    );

    assert.equal(getResponsiblePlayRestriction(status, "deposit"), null);
    assert.equal(getResponsiblePlayRestriction(status, "ticket", { requestedTickets: 1 }), null);
    assert.match(
      getResponsiblePlayRestriction(status, "ticket", { requestedTickets: 2 }) ?? "",
      /entry-ticket limit is 2/,
    );
  });

  it("keeps responsible play state private and server-written", () => {
    assert.match(migration, /worldcup_responsible_play_settings/);
    assert.match(migration, /max_entries >= 0 and max_entries <= 10/);
    assert.match(migration, /enable row level security/);
    assert.match(migration, /worldcup_responsible_play_owner_read/);
    assert.match(migration, /auth\.uid\(\) = user_id/);
    assert.doesNotMatch(migration, /for insert to public/);
    assert.ok(RESPONSIBLE_PLAY_MAX_ENTRY_LIMIT <= 10);
  });

  it("routes wallet paid actions through the shared responsible play gate without blocking entries", () => {
    for (const route of [
      userRoute,
      ticketRoute,
      adminTicketRoute,
      depositAddressRoute,
      depositClaimRoute,
      withdrawalRoute,
    ]) {
      assert.match(route, /loadResponsiblePlayStatus/);
      assert.match(route, /getResponsiblePlayRestriction/);
    }

    assert.match(withdrawalRoute, /"withdrawal"/);
    assert.doesNotMatch(withdrawalRoute, /"deposit"/);
    assert.doesNotMatch(entryRoute, /loadResponsiblePlayStatus/);
    assert.doesNotMatch(entryRoute, /getResponsiblePlayRestriction/);
    assert.match(entryRoute, /worldcup_create_entry/);
  });

  it("does not surface responsible-play gambling copy in the wallet UI", () => {
    assert.doesNotMatch(walletScreen, /Responsible Play/);
    assert.doesNotMatch(walletScreen, /Entry-ticket limit/);
    assert.doesNotMatch(walletScreen, /Activate self-exclusion/);
    assert.doesNotMatch(walletScreen, /NCPG help and treatment/);
    assert.doesNotMatch(walletScreen, /Gambling Therapy support/);
  });
});
