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

async function main() {
  let project = await loadProject();

  if (project.autoAssignCustomDomains && shouldFix) {
    project = await disableAutoAssignCustomDomains();
  }

  const summary = summarizeProject(project);
  const aliases = new Set(summary.aliases);
  const missingAliases = requiredAliases.filter((alias) => !aliases.has(alias));

  assert(
    summary.autoAssignCustomDomains === false,
    "Vercel autoAssignCustomDomains is enabled. Run: npm run vercel:domain-guard:fix",
  );
  assert(
    missingAliases.length === 0,
    `Vercel production deployment is missing custom domain alias(es): ${missingAliases.join(", ")}.`,
  );
  assert(
    summary.productionDeployment,
    "Vercel project does not report a production deployment.",
  );

  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
