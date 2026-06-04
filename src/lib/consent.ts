// Consent policy for the real-money compliance gate. Bump
// CURRENT_TERMS_VERSION whenever the Terms or Privacy Policy change so users
// must re-accept the current public rules before entering.

export const CURRENT_TERMS_VERSION = "2026-06-04";
export const MINIMUM_AGE = 18;

export type ConsentRecord = {
  age_confirmed?: boolean | null;
  terms_version?: string | null;
};

export function isConsentCurrent(consent: ConsentRecord | null | undefined): boolean {
  return Boolean(consent?.age_confirmed) && consent?.terms_version === CURRENT_TERMS_VERSION;
}
