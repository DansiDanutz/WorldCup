import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_BASE_URL = "https://worldcup26.world";
const baseUrl = (process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
const strictLaunchReady =
  process.argv.includes("--require-ready") || process.env.REQUIRE_LAUNCH_READY === "1";
const envFiles = [
  process.env.PREFLIGHT_ENV_FILE,
  ".env.local",
  "/Users/davidai/Documents/WorldCup/.env.local",
].filter(Boolean);

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return false;
  }

  const text = readFileSync(path, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return true;
}

function loadPreflightEnv() {
  for (const path of envFiles) {
    if (loadEnvFile(resolve(path))) {
      return path;
    }
  }

  return null;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runNodeScript(label, script, args = []) {
  console.log(`\n== ${label} ==`);
  const { stdout, stderr } = await execFileAsync(process.execPath, [script, ...args], {
    env: process.env,
    maxBuffer: 1024 * 1024 * 32,
  });

  if (stdout.trim()) {
    console.log(stdout.trim());
  }

  if (stderr.trim()) {
    console.error(stderr.trim());
  }
}

async function fetchJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  assert(
    response.headers.get("content-type")?.includes("application/json"),
    `${path} expected JSON, got ${response.status}: ${text.slice(0, 160)}`,
  );

  return {
    response,
    data: JSON.parse(text),
  };
}

async function checkReadiness() {
  console.log("\n== Production readiness summary ==");
  assert(process.env.ADMIN_RESULT_SECRET, "Missing ADMIN_RESULT_SECRET for readiness preflight.");

  const { response, data } = await fetchJson("/api/admin/readiness", {
    headers: { "x-admin-secret": process.env.ADMIN_RESULT_SECRET },
  });

  assert(response.status === 200, `/api/admin/readiness expected 200, got ${response.status}`);
  const warnings = (data.checks ?? [])
    .filter((check) => check.status === "warning")
    .map((check) => check.id);

  console.log(JSON.stringify({
    overallStatus: data.overallStatus,
    summary: data.summary,
    warnings,
    nextActions: data.nextActions ?? [],
  }, null, 2));

  assert(data.summary?.fail === 0, `/api/admin/readiness reported ${data.summary?.fail} launch blocker(s).`);

  if (strictLaunchReady) {
    assert(
      data.overallStatus === "pass" && data.summary?.warning === 0,
      `/api/admin/readiness is not launch-ready: ${data.summary?.warning ?? "unknown"} warning(s) remain${
        warnings.length > 0 ? ` (${warnings.join(", ")})` : ""
      }.`,
    );
  }
}

async function main() {
  const loadedEnvFile = loadPreflightEnv();
  const passMessage = strictLaunchReady
    ? "Production launch preflight passed."
    : "Production preflight passed.";

  console.log(`${strictLaunchReady ? "Production launch preflight" : "Production preflight"} for ${baseUrl}`);
  console.log(`Env file: ${loadedEnvFile ?? "not loaded; using current process environment"}`);

  await runNodeScript("Vercel domain guard", "scripts/vercel-domain-guard.mjs");
  await runNodeScript("Production smoke", "scripts/production-smoke.mjs");
  await runNodeScript("Full launch smoke", "scripts/production-smoke.mjs", [
    "--auth-flow-probe",
    "--deposit-credit-probe",
    "--kucoin-live-probe",
  ]);
  await checkReadiness();

  console.log(`\n${passMessage}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
