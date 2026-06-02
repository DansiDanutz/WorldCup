export type GeoEligibility =
  | { allowed: true; country: string | null; reason: "not-configured" | "allowed" }
  | { allowed: false; country: string | null; reason: "blocked" | "not-allowed" | "unknown" };

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-appengine-country",
] as const;

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
  const blockedCountries = parseCountryList(env.WORLDCUP_BLOCKED_COUNTRIES);
  const configured = allowedCountries.size > 0 || blockedCountries.size > 0;
  const country = getRequestCountry(request);

  if (!configured) {
    return { allowed: true, country, reason: "not-configured" };
  }

  if (!country) {
    return { allowed: false, country: null, reason: "unknown" };
  }

  if (blockedCountries.has(country)) {
    return { allowed: false, country, reason: "blocked" };
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
