import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260602014000_worldcup_usdt_deposits.sql",
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
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
