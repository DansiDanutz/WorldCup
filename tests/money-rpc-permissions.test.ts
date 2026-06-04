import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260602014100_worldcup_usdt_deposits.sql",
  "utf8",
);
const hardeningMigration = readFileSync(
  "supabase/migrations/20260602021000_worldcup_function_security_hardening.sql",
  "utf8",
);
const precisionMigration = readFileSync(
  "supabase/migrations/20260602022000_worldcup_wallet_precision.sql",
  "utf8",
);

describe("money-moving RPC permissions", () => {
  it("keeps wallet and entry RPCs callable only by the service role", () => {
    const signatures = [
      "public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)",
      "public.worldcup_purchase_ticket(uuid, uuid)",
      "public.worldcup_create_entry(uuid, uuid, text, text[], text, uuid)",
      "public.worldcup_wallet_transfer(uuid, uuid, uuid, numeric, text, text)",
      "public.worldcup_settle_payouts(uuid)",
    ];

    for (const signature of signatures) {
      const escapedSignature = escapeRegExp(signature);

      assert.match(
        migration,
        new RegExp(
          `revoke execute on function ${escapedSignature}\\s+from public, anon, authenticated;`,
        ),
      );
      assert.match(
        migration,
        new RegExp(`grant execute on function ${escapedSignature}\\s+to service_role;`),
      );
    }
  });

  it("keeps result and rate-limit RPCs callable only by the service role", () => {
    const signatures = [
      "public.worldcup_apply_match_points(uuid)",
      "public.worldcup_apply_completed_match_points()",
      "public.worldcup_mark_match_result_checked(uuid)",
      "public.worldcup_rate_limit_hit(text, integer, integer)",
    ];

    for (const signature of signatures) {
      const escapedSignature = escapeRegExp(signature);

      assert.match(
        hardeningMigration,
        new RegExp(
          `revoke execute on function ${escapedSignature}\\s+from public, anon, authenticated;`,
        ),
      );
      assert.match(
        hardeningMigration,
        new RegExp(`grant execute on function ${escapedSignature}\\s+to service_role;`),
      );
    }
  });

  it("does not grant the dropped finalize-entry RPC after lockdown", () => {
    assert.doesNotMatch(hardeningMigration, /grant execute on function public\.worldcup_finalize_entry\(uuid\)/);
    assert.doesNotMatch(hardeningMigration, /revoke execute on function public\.worldcup_finalize_entry\(uuid\)/);
  });

  it("sets stable search paths on trigger functions", () => {
    assert.match(
      hardeningMigration,
      /alter function public\.worldcup_prevent_more_than_three_picks\(\)\s+set search_path = public;/,
    );
    assert.match(
      hardeningMigration,
      /alter function public\.worldcup_assert_team_pick_is_open\(\)\s+set search_path = public;/,
    );
  });

  it("marks calculated WorldCup views as security invoker", () => {
    for (const viewName of [
      "worldcup_leaderboard",
      "worldcup_match_team_points",
      "worldcup_entry_team_totals",
      "worldcup_matches_due_for_result_check",
      "worldcup_awarded_leaderboard",
    ]) {
      assert.match(
        hardeningMigration,
        new RegExp(`alter view if exists public\\.${viewName}\\s+set \\(security_invoker = true\\);`),
      );
    }
  });

  it("removes legacy public write policies from non-WorldCup tables", () => {
    for (const policyName of [
      "Allow public game creation",
      "Allow public game updates",
      "Allow public score creation",
      "Allow public score updates",
      "profiles_delete",
      "profiles_insert",
      "profiles_update",
      "scores_insert",
      "scores_update",
    ]) {
      assert.match(hardeningMigration, new RegExp(`drop policy if exists "${policyName}"`));
    }
  });

  it("keeps wallet ledger precision aligned with USDT deposits", () => {
    assert.match(
      precisionMigration,
      /alter column amount type numeric\(20,8\)/,
    );
    assert.match(
      precisionMigration,
      /using amount::numeric\(20,8\)/,
    );
  });
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
