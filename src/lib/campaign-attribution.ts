const PAID_CAMPAIGN_REFERRAL_CODES: Record<string, string> = {
  "6971048256000": "26BC4B90CB",
};

export function getCampaignReferralCode(params: URLSearchParams) {
  const directRef = normalizeCampaignReferralCode(params.get("ref") ?? "");
  if (directRef) return directRef;

  const campaign = params.get("utm_campaign")?.trim() ?? "";
  return PAID_CAMPAIGN_REFERRAL_CODES[campaign] ?? "";
}

export function normalizeCampaignReferralCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}
