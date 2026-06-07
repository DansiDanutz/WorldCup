import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_PROJECT_ID = "prj_hqWHPQPoIxBJgJC4ae1FHAlI8N43";
const DEFAULT_REQUIRED_ALIASES = ["worldcup26.world", "www.worldcup26.world"];
const projectId = process.env.VERCEL_PROJECT_ID ?? DEFAULT_PROJECT_ID;
const requiredAliases = (process.env.VERCEL_REQUIRED_ALIASES ?? DEFAULT_REQUIRED_ALIASES.join(","))
  .split(",")
  .map((alias) => alias.trim())
  .filter(Boolean);
const shouldFix = process.argv.includes("--fix");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

async function vercelApi(args) {
  const { stdout } = await execFileAsync(npxCommand(), ["vercel", "api", ...args], {
    maxBuffer: 1024 * 1024 * 8,
  });

  return JSON.parse(stdout);
}

async function loadProject() {
  return vercelApi([`/v9/projects/${projectId}`]);
}

async function loadAlias(alias) {
  try {
    return await vercelApi([`/v4/aliases/${alias}`]);
  } catch {
    return null;
  }
}

async function disableAutoAssignCustomDomains() {
  return vercelApi([
    `/v9/projects/${projectId}`,
    "-X",
    "PATCH",
    "-F",
    "autoAssignCustomDomains=false",
  ]);
}

function summarizeProject(project) {
  const production = project.targets?.production ?? {};

  return {
    projectId: project.id,
    projectName: project.name,
    productionBranch: project.link?.productionBranch ?? null,
    productionDeployment: production.url ?? null,
    autoAssignCustomDomains: project.autoAssignCustomDomains,
    aliases: production.alias ?? [],
  };
}

function normalizeDeploymentUrl(url) {
  return String(url ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

async function loadServedDeploymentId(alias) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`https://${alias}/?domain_guard=${Date.now()}`, {
      headers: {
        "cache-control": "no-cache",
        "user-agent": "WorldCup26-vercel-domain-guard/1.0",
      },
      signal: controller.signal,
    });
    const text = await response.text();
    const deploymentId =
      text.match(/data-dpl-id="([^"]+)"/)?.[1] ??
      text.match(/[?&]dpl=(dpl_[A-Za-z0-9]+)/)?.[1] ??
      null;

    return {
      status: response.status,
      deploymentId,
      error: null,
    };
  } catch (error) {
    return {
      status: null,
      deploymentId: null,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function loadRequiredAliasProofs(summary) {
  const productionDeployment = normalizeDeploymentUrl(summary.productionDeployment);

  return Promise.all(
    requiredAliases.map(async (alias) => {
      const record = await loadAlias(alias);
      const served = await loadServedDeploymentId(alias);
      const aliasDeployment = normalizeDeploymentUrl(record?.deployment?.url);
      const deploymentId = record?.deploymentId ?? record?.deployment?.id ?? null;
      const matchesProduction =
        Boolean(productionDeployment) &&
        Boolean(aliasDeployment) &&
        aliasDeployment === productionDeployment &&
        record?.projectId === summary.projectId &&
        record?.deletedAt == null;
      const servesAliasDeployment =
        Boolean(deploymentId) &&
        Boolean(served.deploymentId) &&
        deploymentId === served.deploymentId;
      const healthy =
        Boolean(aliasDeployment) &&
        record?.projectId === summary.projectId &&
        record?.deletedAt == null &&
        (matchesProduction || servesAliasDeployment);

      return {
        alias,
        deployment: aliasDeployment || null,
        deploymentId,
        servedDeploymentId: served.deploymentId,
        servedStatus: served.status,
        servedError: served.error,
        matchesProduction,
        servesAliasDeployment,
        healthy,
      };
    }),
  );
}

async function main() {
  let project = await loadProject();

  if (project.autoAssignCustomDomains && shouldFix) {
    project = await disableAutoAssignCustomDomains();
  }

  const summary = summarizeProject(project);
  const aliasProofs = await loadRequiredAliasProofs(summary);
  const missingAliases = aliasProofs
    .filter((proof) => !proof.healthy)
    .map((proof) => proof.alias);
  const aliasDeploymentIds = new Set(
    aliasProofs.map((proof) => proof.deploymentId).filter(Boolean),
  );

  assert(
    summary.autoAssignCustomDomains === false,
    "Vercel autoAssignCustomDomains is enabled. Run: npm run vercel:domain-guard:fix",
  );
  assert(
    missingAliases.length === 0,
    `Vercel production deployment is missing custom domain alias(es): ${missingAliases.join(", ")}.`,
  );
  assert(
    aliasDeploymentIds.size <= 1,
    `Vercel custom domain aliases point at different deployments: ${[...aliasDeploymentIds].join(", ")}.`,
  );
  assert(
    summary.productionDeployment,
    "Vercel project does not report a production deployment.",
  );

  console.log(JSON.stringify({ ok: true, ...summary, requiredAliases: aliasProofs }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
