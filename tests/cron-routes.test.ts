import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const vercelConfig = readFileSync("vercel.json", "utf8");
const deploymentDocs = readFileSync("docs/DEPLOYMENT.md", "utf8");
const cronDocs = readFileSync("docs/CRON.md", "utf8");
const resultsRoute = readFileSync("src/app/api/cron/results/route.ts", "utf8");
const applyRoute = readFileSync("src/app/api/cron/apply/route.ts", "utf8");

describe("cron routes", () => {
  it("keeps Vercel scheduled cron endpoints present in source", () => {
    assert.match(vercelConfig, /"path": "\/api\/cron\/results"/);
    assert.match(vercelConfig, /"path": "\/api\/cron\/apply"/);
    assert.doesNotMatch(vercelConfig, /\/api\/deposits\/reconcile/);
    assert.match(deploymentDocs, /\/api\/cron\/results/);
    assert.match(deploymentDocs, /\/api\/cron\/apply/);
    assert.match(cronDocs, /GET \/api\/cron\/results/);
    assert.match(cronDocs, /GET \/api\/cron\/apply/);
  });

  it("protects both scheduled routes with CRON_SECRET", () => {
    for (const route of [resultsRoute, applyRoute]) {
      assert.match(route, /requireEnv\("CRON_SECRET"\)/);
      assert.match(route, /authorization/);
      assert.match(route, /Unauthorized\./);
      assert.match(route, /export async function GET/);
      assert.match(route, /export async function POST/);
    }
  });

  it("keeps result ingestion isolated and point-awarding durable", () => {
    assert.match(resultsRoute, /worldcup_matches_due_for_result_check/);
    assert.match(resultsRoute, /fetchExternalResult/);
    assert.match(resultsRoute, /worldcup_mark_match_result_checked/);
    assert.match(resultsRoute, /worldcup_apply_match_points/);
    assert.match(resultsRoute, /applied_existing_result/);
    assert.match(resultsRoute, /fetched_result_and_applied/);
    assert.match(resultsRoute, /action: "error"/);
    assert.match(resultsRoute, /advanceBracket/);
  });

  it("keeps the apply endpoint available as a scheduled backstop", () => {
    assert.match(applyRoute, /worldcup_apply_completed_match_points/);
    assert.match(applyRoute, /awardedRows/);
    assert.match(applyRoute, /advanceBracket/);
    assert.match(applyRoute, /bracketAdvanced/);
  });
});
