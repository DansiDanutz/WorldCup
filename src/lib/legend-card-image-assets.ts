import youtubeRareCardManifest from "../../public/legend-cards/youtube-rare/manifest.json" with { type: "json" };

import type { LegendCardDefinition } from "@/lib/legend-card-registry";

type YouTubeRareCardAsset = {
  id: string;
  youtube: string;
  cardId?: string;
  episode?: number;
  kind: string;
  imagePath: string;
  appImagePath?: string | null;
  layout?: "portrait-card" | "wide-reveal" | "archive-only" | "production-bonus";
};

const didYouKnowCardImagePaths: Record<string, string> = {
  "short-gaetjens-vanished": "/legend-cards/did-you-know/01-gaetjens-the-vanished-hero.png",
  "short-garrincha-broken-magic": "/legend-cards/did-you-know/02-garrincha-the-joy-of-the-people.png",
  "short-carbajal-five-world-cups": "/legend-cards/did-you-know/03-carbajal-the-eternal-keeper.png",
  "short-socrates-sunday": "/legend-cards/did-you-know/04-socrates-the-doctor.png",
  "short-milla-corner-flag": "/legend-cards/did-you-know/05-milla-the-dancing-lion.png",
  "short-laurent-first-goal": "/legend-cards/did-you-know/06-laurent-the-first-goal.png",
  "short-escobar-own-goal": "/legend-cards/did-you-know/07-escobar-the-gentleman.png",
  "short-yashin-black-spider": "/legend-cards/did-you-know/08-yashin-the-black-spider.png",
  "short-monti-two-finals": "/legend-cards/did-you-know/09-monti-two-nations.png",
  "short-tostao-eyes": "/legend-cards/did-you-know/10-tostao-eyes-of-a-champion.png",
  "short-castro-one-armed-champion": "/legend-cards/did-you-know/11-castro-the-one-armed-champion.png",
  "short-pak-secret-hero": "/legend-cards/did-you-know/12-pak-the-secret-hero.png",
};

const bonusCardImagePaths: Record<string, string> = {
  "bonus-luis-diaz": "/legend-cards/bonus/luis-diaz.png",
  "bonus-lukaku-promise": "/legend-cards/bonus/lukaku-the-promise.png",
  "bonus-world-cup-secrets": "/legend-cards/bonus/world-cup-monopoly.png",
};

const youtubeRareCardAssets = youtubeRareCardManifest.assets as YouTubeRareCardAsset[];

function normalizeYoutubeUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const videoId = url.hostname.includes("youtu.be")
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.pathname.startsWith("/shorts/")
        ? url.pathname.split("/").filter(Boolean)[1]
        : url.searchParams.get("v");

    return videoId ?? value;
  } catch {
    return value;
  }
}

function getYoutubeRareCardAsset(card: LegendCardDefinition) {
  const normalizedYoutube = normalizeYoutubeUrl(card.youtube);

  return (
    youtubeRareCardAssets.find((asset) => asset.cardId === card.id) ??
    youtubeRareCardAssets.find((asset) => normalizeYoutubeUrl(asset.youtube) === normalizedYoutube) ??
    (card.kind === "episode-special"
      ? youtubeRareCardAssets.find((asset) => asset.kind === "episode-special" && asset.episode === card.episode)
      : null) ??
    null
  );
}

export function getLegendCardAssetImagePath(card: LegendCardDefinition) {
  const didYouKnowImage = didYouKnowCardImagePaths[card.id];

  if (didYouKnowImage) {
    return didYouKnowImage;
  }

  const bonusImage = bonusCardImagePaths[card.id];

  if (bonusImage) {
    return bonusImage;
  }

  const youtubeRareCardAsset = getYoutubeRareCardAsset(card);

  if (youtubeRareCardAsset?.appImagePath) {
    return youtubeRareCardAsset.appImagePath;
  }

  return null;
}
