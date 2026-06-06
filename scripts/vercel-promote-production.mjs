import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Promotes the latest READY production deployment so all production domains
// point at it — the intended go-live step for this project. Automatic
// custom-domain assignment is deliberately disabled (see vercel-domain-guard.mjs
// and docs/DEPLOYMENT.md) so a stale/bad build never seizes worldcup26.world on
// its own. This script makes the explicit, reviewed promotion a single command
// instead of two ad-hoc `vercel alias set` calls.
//
// Usage:
//   npm run vercel:promote                 # dry-run: show what would be promoted
//   npm run vercel:promote -- --confirm    # promote latest READY production build
//   npm run vercel:promote -- --deployment <id> --confirm
//
// Requires Vercel auth (a logged-in `vercel` CLI or VERCEL_TOKEN).

const DEFAULT_PROJECT_ID = "prj_hqWHPQPoIxBJgJC4ae1FHAlI8N43";
const DEFAULT_REQUIRED_ALIASES = ["worldcup26.world", "www.worldcup26.world"];

const projectId = process.env.VERCEL_PROJECT_ID ?? DEFAULT_PROJECT_ID;
const requiredAliases = (process.env.VERCEL_REQUIRED_ALIASES ?? DEFAULT_REQUIRED_ALIASES.join(","))
  .split(",")
  .map((alias) => alias.trim())
  .filter(Boolean);
const shouldConfirm = process.argv.includes("--confirm");
const deploymentFlagIndex = process.argv.indexOf("--deployment");
const explicitDeployment =
  deploymentFlagIndex >= 0 ? process.argv[deploymentFlagIndex + 1] : null;

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

async function vercelApi(args) {
  const { stdout } = await execFileAsync(npxCommand(), ["vercel", "api", ...args], {
    maxBuffer: 1024 * 1024 * 8,
  });

  return stdout ? JSON.parse(stdout) : {};
}

async function loadProject() {
  return vercelApi([`/v9/projects/${projectId}`]);
}

async function resolveDeployment() {
  if (explicitDeployment) {
    const dep = await vercelApi([
      `/v13/deployments/${encodeURIComponent(explicitDeployment)}`,
    ]);
    return {
      id: dep.id ?? dep.uid,
      url: dep.url,
      meta: dep.meta,
      readyState: dep.readyState ?? dep.status,
      target: dep.target,
    };
  }

  const data = await vercelApi([
    `/v6/deployments?projectId=${projectId}&target=production&limit=20`,
  ]);
  const candidate = (data.deployments ?? [])
    .filter((dep) => (dep.readyState ?? dep.state) === "READY")
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))[0];

  return candidate
    ? {
        id: candidate.uid ?? candidate.id,
        url: candidate.url,
        meta: candidate.meta,
        readyState: candidate.readyState ?? candidate.state,
        target: candidate.target,
      }
    : null;
}

async function promote(deploymentId) {
  return vercelApi([`/v10/projects/${projectId}/promote/${deploymentId}`, "-X", "POST"]);
}

async function main() {
  const target = await resolveDeployment();
  if (!target?.id) {
    throw new Error("No READY production deployment found to promote.");
  }

  const sha = target.meta?.githubCommitSha?.slice(0, 7) ?? "unknown";
  const message = (target.meta?.githubCommitMessage ?? "").split("\n")[0];

  console.log("Production deployment to promote:");
  console.log(`  id:      ${target.id}`);
  console.log(`  url:     https://${target.url}`);
  console.log(`  commit:  ${sha} ${message}`);
  console.log(`  domains: ${requiredAliases.join(", ")}`);

  if ((target.readyState ?? "READY") !== "READY") {
    throw new Error(`Deployment is not READY (state: ${target.readyState}). Refusing to promote.`);
  }

  if (!shouldConfirm) {
    console.log("\n[dry-run] Add --confirm to point all production domains at this deployment.");
    return;
  }

  await promote(target.id);

  const project = await loadProject();
  const liveAliases = new Set(project.targets?.production?.alias ?? []);
  const missing = requiredAliases.filter((alias) => !liveAliases.has(alias));

  if (missing.length) {
    console.log(
      `\nPromotion requested. These domains are not reporting the new deployment yet ` +
        `(propagation can lag a few seconds): ${missing.join(", ")}. ` +
        `Re-run "npm run vercel:domain-guard" to confirm.`,
    );
    return;
  }

  console.log(`\nPromoted ${target.id}. Live on: ${requiredAliases.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
