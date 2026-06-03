import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

// H-2 regression: every wallet-debiting RPC must serialize on ONE canonical
// advisory-lock key, and a DB-level trigger must forbid a negative balance.
const migration = readFileSync(
  "supabase/migrations/20260603120000_worldcup_wallet_lock_unification.sql",
  "utf8",
);

function functionBody(source: string, signaturePrefix: string): string {
  const start = source.indexOf(signaturePrefix);
  assert.notEqual(start, -1, `expected to find ${signaturePrefix}`);
  // Bodies are dollar-quoted with $$ ... $$; grab through the closing $$;.
  const bodyStart = source.indexOf("$$", start);
  const bodyEnd = source.indexOf("$$;", bodyStart + 2);
  assert.notEqual(bodyEnd, -1, `expected a closed body for ${signaturePrefix}`);
  return source.slice(start, bodyEnd + 3);
}

describe("wallet lock unification (H-2)", () => {
  it("defines a single canonical wallet lock key helper", () => {
    assert.match(
      migration,
      /create or replace function public\.worldcup_wallet_lock_key\(\s*p_tournament_id uuid,\s*p_user_id uuid\s*\)/,
    );
    assert.match(migration, /hashtext\('wallet:' \|\| p_tournament_id::text \|\| ':' \|\| p_user_id::text\)::bigint/);
  });

  it("makes every balance-debiting RPC lock on the canonical key", () => {
    for (const signature of [
      "create or replace function public.worldcup_wallet_transfer",
      "create or replace function public.worldcup_purchase_ticket",
      "create or replace function public.worldcup_record_withdrawal",
    ]) {
      const body = functionBody(migration, signature);
      assert.match(
        body,
        /perform pg_advisory_xact_lock\(public\.worldcup_wallet_lock_key\(/,
        `${signature} must take the canonical wallet lock`,
      );
      // The old, divergent ad-hoc keys must be gone from these bodies.
      assert.doesNotMatch(body, /:ticket'/, `${signature} must not use the legacy ad-hoc lock key`);
      assert.doesNotMatch(body, /:withdrawal'/, `${signature} must not use the legacy ad-hoc lock key`);
    }
  });

  it("transfer still preserves its overdraft and same-account guards", () => {
    const body = functionBody(migration, "create or replace function public.worldcup_wallet_transfer");
    assert.match(body, /raise exception 'SAME_ACCOUNT'/);
    assert.match(body, /raise exception 'INSUFFICIENT_FUNDS'/);
    // Locks the sender (the only side that can go negative).
    assert.match(body, /worldcup_wallet_lock_key\(p_tournament_id, p_from_user_id\)/);
  });

  it("installs a non-negative balance trigger as a structural backstop", () => {
    assert.match(
      migration,
      /create or replace function public\.worldcup_assert_wallet_nonnegative\(\)\s+returns trigger/,
    );
    assert.match(migration, /if new\.from_user_id is null then\s+return new;/);
    assert.match(migration, /raise exception 'WALLET_BALANCE_NEGATIVE'/);
    assert.match(
      migration,
      /create trigger worldcup_wallet_nonnegative\s+after insert on public\.worldcup_wallet_transactions\s+for each row execute function public\.worldcup_assert_wallet_nonnegative\(\)/,
    );
  });

  it("keeps the re-created RPCs and the helper service-role only", () => {
    for (const signature of [
      "public.worldcup_wallet_lock_key(uuid, uuid)",
      "public.worldcup_wallet_transfer(uuid, uuid, uuid, numeric, text, text)",
      "public.worldcup_purchase_ticket(uuid, uuid)",
      "public.worldcup_record_withdrawal(uuid, uuid, uuid, numeric, text, text)",
    ]) {
      const escaped = escapeRegExp(signature);
      assert.match(
        migration,
        new RegExp(`revoke execute on function ${escaped}\\s+from public, anon, authenticated;`),
      );
      assert.match(
        migration,
        new RegExp(`grant execute on function ${escaped}\\s+to service_role;`),
      );
    }
    // The trigger function must not be directly executable over PostgREST.
    assert.match(
      migration,
      /revoke execute on function public\.worldcup_assert_wallet_nonnegative\(\)\s+from public, anon, authenticated;/,
    );
  });
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
