export const CANONICAL_HOST = "worldcup26.world";
export const LEGACY_PRODUCTION_HOST = "worldcup-ten-eta.vercel.app";
export const WWW_CANONICAL_HOST = `www.${CANONICAL_HOST}`;

export function shouldRedirectToCanonicalHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  const hostname = host.split(":")[0]?.toLowerCase();

  return (
    hostname === WWW_CANONICAL_HOST ||
    hostname === LEGACY_PRODUCTION_HOST ||
    Boolean(hostname?.endsWith(".vercel.app"))
  );
}

