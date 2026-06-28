import supporterCardManifest from "../../public/supporter-cards/manifest.json" with { type: "json" };

export type SupporterCardAsset = {
  team: string;
  slug: string;
  fileName: string;
  publicPath: string;
  mysteryName: string;
  mysteryConcept: string;
  mysteryPromptPath: string;
  ultraName: string;
  ultraConcept: string;
  ultraPromptPath: string;
  supporterReference: string;
  story: string;
  voiceStory: string;
  ultraReference: string;
  ultraStory: string;
  ultraVoiceStory: string;
  sourceImagePath: string | null;
  sourceNote: string;
  colors: [string, string, string];
  width: 1080;
  height: 1920;
  aspectRatio: "9:16";
  downloadPath: string;
};

export const SUPPORTER_CARD_ASSETS = supporterCardManifest as unknown as SupporterCardAsset[];

const TEAM_ALIASES = new Map<string, string>([
  ["caboverde", "capeverde"],
  ["cotedivoire", "ivorycoast"],
  ["czechrepublic", "czechia"],
  ["democraticrepublicofcongo", "drcongo"],
  ["congodr", "drcongo"],
  ["iriran", "iran"],
  ["korearepublic", "southkorea"],
  ["turkiye", "turkey"],
  ["unitedstates", "usa"],
  ["unitedstatesofamerica", "usa"],
]);

export function normalizeSupporterTeam(value: string) {
  const key = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

  return TEAM_ALIASES.get(key) ?? key;
}

const supporterAssetsByTeam = new Map<string, SupporterCardAsset>();

for (const asset of SUPPORTER_CARD_ASSETS) {
  supporterAssetsByTeam.set(normalizeSupporterTeam(asset.team), asset);
  supporterAssetsByTeam.set(normalizeSupporterTeam(asset.slug), asset);
}

export function findSupporterCardAsset(team: string) {
  return supporterAssetsByTeam.get(normalizeSupporterTeam(team)) ?? null;
}

export function getSupporterCardImagePath(team: string) {
  return findSupporterCardAsset(team)?.publicPath ?? null;
}
