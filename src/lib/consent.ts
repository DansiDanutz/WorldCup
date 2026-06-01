// Consent policy for the real-money compliance gate. These values are
// placeholders pending legal classification (jurisdiction, exact age
// threshold, terms content) — see docs/COMPLIANCE.md. Bump CURRENT_TERMS_VERSION
// whenever the Terms or Privacy Policy change so users must re-accept.

export const CURRENT_TERMS_VERSION = "2026-06-01";
export const MINIMUM_AGE = 18;

export type ConsentRecord = {
  age_confirmed?: boolean | null;
  terms_version?: string | null;
};

export function isConsentCurrent(consent: ConsentRecord | null | undefined): boolean {
  return Boolean(consent?.age_confirmed) && consent?.terms_version === CURRENT_TERMS_VERSION;
}
