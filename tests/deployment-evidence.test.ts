import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getDeploymentEvidence } from "../src/lib/deployment-evidence.ts";

describe("deployment evidence", () => {
  it("captures safe public deployment metadata for launch sign-offs", () => {
    assert.deepEqual(
      getDeploymentEvidence({
        NEXT_PUBLIC_SITE_URL: "https://worldcup26.world/anything",
        VERCEL: "1",
        VERCEL_URL: "worldcup-example.vercel.app",
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_SHA: "abcdef1234567890",
        VERCEL_GIT_COMMIT_REF: "main",
      }),
      {
        canonicalOrigin: "https://worldcup26.world",
        siteUrl: "https://worldcup26.world",
        deploymentUrl: "https://worldcup-example.vercel.app",
        vercelEnv: "production",
        gitCommitSha: "abcdef1234567890",
        gitCommitRef: "main",
        source: "vercel",
      },
    );
  });

  it("does not copy arbitrary or secret environment keys into launch evidence", () => {
    const evidence = getDeploymentEvidence({
      ADMIN_RESULT_SECRET: "secret",
      SUPABASE_SERVICE_ROLE_KEY: "secret",
      VERCEL_URL: "https://worldcup-preview.vercel.app/path",
    });

    assert.deepEqual(Object.keys(evidence).sort(), [
      "canonicalOrigin",
      "deploymentUrl",
      "gitCommitRef",
      "gitCommitSha",
      "siteUrl",
      "source",
      "vercelEnv",
    ]);
    assert.equal(evidence.deploymentUrl, "https://worldcup-preview.vercel.app");
    assert.equal(JSON.stringify(evidence).includes("secret"), false);
  });
});
