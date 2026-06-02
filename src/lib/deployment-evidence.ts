import { CANONICAL_ORIGIN } from "@/lib/canonical-url";

export type DeploymentEvidence = {
  canonicalOrigin: string;
  siteUrl: string;
  deploymentUrl: string | null;
  vercelEnv: string | null;
  gitCommitSha: string | null;
  gitCommitRef: string | null;
  source: "vercel" | "local";
};

type DeploymentEvidenceEnv = Record<string, string | undefined>;

export function getDeploymentEvidence(
  env: DeploymentEvidenceEnv = process.env,
): DeploymentEvidence {
  const deploymentHost = normalizeHost(env.VERCEL_URL);

  return {
    canonicalOrigin: CANONICAL_ORIGIN,
    siteUrl: normalizeOrigin(env.NEXT_PUBLIC_SITE_URL) ?? CANONICAL_ORIGIN,
    deploymentUrl: deploymentHost ? `https://${deploymentHost}` : null,
    vercelEnv: nonEmpty(env.VERCEL_ENV),
    gitCommitSha: nonEmpty(env.VERCEL_GIT_COMMIT_SHA),
    gitCommitRef: nonEmpty(env.VERCEL_GIT_COMMIT_REF),
    source: env.VERCEL ? "vercel" : "local",
  };
}

function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = nonEmpty(value);

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    return url.origin;
  } catch {
    return null;
  }
}

function normalizeHost(value: string | undefined): string | null {
  const trimmed = nonEmpty(value);

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
