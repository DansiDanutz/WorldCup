export const CANONICAL_HOST = "worldcup26.world";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
export const LEGACY_PRODUCTION_HOST = "worldcup-ten-eta.vercel.app";
export const WWW_CANONICAL_HOST = `www.${CANONICAL_HOST}`;

export function shouldRedirectToCanonicalHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  const hostname = host.split(":")[0]?.toLowerCase();

  if (!hostname || hostname === CANONICAL_HOST) {
    return false;
  }

  // Only the production deployment funnels alternate hosts (the bare Vercel
  // aliases and www) to the brand domain. Preview and development deployments
  // must keep serving their own host so each one stays reviewable — otherwise
  // every PR preview would 308 straight to production.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }

  return (
    hostname === WWW_CANONICAL_HOST ||
    hostname === LEGACY_PRODUCTION_HOST ||
    hostname.endsWith(".vercel.app")
  );
}
