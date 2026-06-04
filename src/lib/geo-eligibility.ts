export type GeoEligibility =
  | { allowed: true; country: string | null; reason: "not-configured" | "allowed" }
  | { allowed: false; country: string | null; reason: "blocked" | "not-allowed" | "unknown" };

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-appengine-country",
] as const;

// Territories that are ALWAYS blocked for paid actions when the country is
// detected — even if the operator has not configured a country policy — and an
// allow-list cannot re-enable them; only editing this list can. Covers the
// comprehensively sanctioned / embargoed jurisdictions (ISO 3166-1 alpha-2:
// Cuba, Iran, North Korea, Syria) plus Russia, which FIFA has suspended from all
// competitions and excluded from the 2026 World Cup. Operators can block
// further territories (e.g. BY) via WORLDCUP_BLOCKED_COUNTRIES or the runtime
// operator policy.
export const DEFAULT_BLOCKED_COUNTRIES: ReadonlySet<string> = new Set([
  "CU",
  "IR",
  "KP",
  "RU",
  "SY",
]);

export function getRequestCountry(request: Request): string | null {
  for (const header of COUNTRY_HEADERS) {
    const country = normalizeCountryCode(request.headers.get(header));

    if (country) {
      return country;
    }
  }

  return null;
}

export function getGeoEligibility(
  request: Request,
  env: Record<string, string | undefined> = process.env,
): GeoEligibility {
  const allowedCountries = parseCountryList(env.WORLDCUP_ALLOWED_COUNTRIES);
  const operatorBlockedCountries = parseCountryList(env.WORLDCUP_BLOCKED_COUNTRIES);
  const blockedCountries = new Set<string>([
    ...DEFAULT_BLOCKED_COUNTRIES,
    ...operatorBlockedCountries,
  ]);
  const configured = allowedCountries.size > 0 || operatorBlockedCountries.size > 0;
  const country = getRequestCountry(request);

  // Sanctioned/embargoed territories are always blocked when detected, even with
  // no operator country policy, and an allow-list cannot override this.
  if (country && blockedCountries.has(country)) {
    return { allowed: false, country, reason: "blocked" };
  }

  if (!configured) {
    return { allowed: true, country, reason: "not-configured" };
  }

  if (!country) {
    return { allowed: false, country: null, reason: "unknown" };
  }

  if (allowedCountries.size > 0 && !allowedCountries.has(country)) {
    return { allowed: false, country, reason: "not-allowed" };
  }

  return { allowed: true, country, reason: "allowed" };
}

export function parseCountryList(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((country) => normalizeCountryCode(country))
      .filter((country): country is string => Boolean(country)),
  );
}

function normalizeCountryCode(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase();

  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}
