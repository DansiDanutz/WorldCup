import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

type GreptileConfig = {
  strictness: number;
  commentTypes: string[];
  triggerOnUpdates: boolean;
  statusCheck: boolean;
  includeBranches: string[];
  rules: Array<{
    id?: string;
    rule: string;
    severity?: string;
    scope?: string[];
  }>;
};

type GreptileFiles = {
  files: Array<{
    path: string;
    description: string;
  }>;
};

const config = JSON.parse(readFileSync(".greptile/config.json", "utf8")) as GreptileConfig;
const rulesMarkdown = readFileSync(".greptile/rules.md", "utf8");
const filesConfig = JSON.parse(readFileSync(".greptile/files.json", "utf8")) as GreptileFiles;

describe("Greptile repository review configuration", () => {
  it("enables high-signal PR review behavior for main-branch work", () => {
    assert.equal(config.strictness, 2);
    assert.deepEqual(config.commentTypes, ["logic", "syntax", "style", "info"]);
    assert.equal(config.triggerOnUpdates, true);
    assert.equal(config.statusCheck, true);
    assert.deepEqual(config.includeBranches, ["main"]);
  });

  it("keeps WorldCup money, auth, and Supabase rules active", () => {
    const ruleIds = config.rules.map((rule) => rule.id);
    assert.equal(new Set(ruleIds).size, ruleIds.length);

    for (const requiredRule of [
      "service-role-server-only",
      "paid-route-auth-gates",
      "admin-route-auth",
      "wallet-ledger-atomicity",
      "ticket-transfer-atomicity",
      "privileged-rpc-lockdown",
      "rls-for-new-tables",
      "withdrawal-payout-gates",
      "raw-error-hygiene",
      "mobile-touch-ux",
      "money-risk-tests",
    ]) {
      assert.ok(ruleIds.includes(requiredRule), `${requiredRule} should be configured`);
    }

    assert.match(rulesMarkdown, /paid-entry, USDT-backed prediction game/);
    assert.match(rulesMarkdown, /Wallet debits must use the canonical lock/);
    assert.match(rulesMarkdown, /Privileged RPCs must be `SECURITY DEFINER`/);
    assert.match(rulesMarkdown, /Mobile screens must avoid text overlap/);
  });

  it("points Greptile at existing audit and architecture context", () => {
    assert.ok(filesConfig.files.length >= 5);

    for (const file of filesConfig.files) {
      assert.ok(existsSync(file.path), `${file.path} should exist`);
      assert.ok(file.description.length > 10, `${file.path} should have a useful description`);
    }

    assert.ok(filesConfig.files.some((file) => file.path === "docs/AUDIT_2026-06-04.md"));
    assert.ok(filesConfig.files.some((file) => file.path === "docs/DATABASE.md"));
    assert.ok(filesConfig.files.some((file) => file.path === "docs/PAYMENTS.md"));
  });
});
