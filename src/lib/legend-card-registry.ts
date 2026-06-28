import {
  YOUTUBE_DID_YOU_KNOW_SHORTS,
  YOUTUBE_LEGEND_BONUS_VIDEOS,
  YOUTUBE_LEGEND_EPISODES,
  type YouTubeDidYouKnowShort,
  type YouTubeLegendBonusVideo,
  type YouTubeLegendEpisode,
} from "@/lib/youtube-legend-episodes";
import { findSupporterCardAsset } from "@/lib/supporter-card-assets";

export type LegendCardKind = "episode-special" | "supporter-card" | "legend-bonus" | "did-you-know-short";
export type LegendCardRarity = "Story" | "Rare" | "Legendary";

export type LegendCardDefinition = {
  id: string;
  episode: number;
  episodeLabel?: string;
  kind: LegendCardKind;
  title: string;
  subtitle: string;
  teams: string;
  rarity: LegendCardRarity;
  story: string;
  voiceStory?: string;
  youtube: string | null;
  alternateYoutube?: string[];
  imageTeam?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44);
}

function titleFromHook(hook: string) {
  const cleanHook = hook.replace(/[.!?]+$/, "");
  const maxTitleLength = 64;

  if (cleanHook.length <= maxTitleLength) {
    return cleanHook;
  }

  const truncated = cleanHook.slice(0, maxTitleLength);
  const lastWordBoundary = truncated.lastIndexOf(" ");
  const title = lastWordBoundary >= 42 ? truncated.slice(0, lastWordBoundary) : truncated;

  return title.replace(/\s+(a|an|and|at|by|for|from|in|into|of|on|or|the|to|with)$/i, "");
}

const handMadeLegendCards: LegendCardDefinition[] = [];

const handMadeEpisodeNumbers = new Set(handMadeLegendCards.map((card) => card.episode));

function getEpisodeTeams(episode: YouTubeLegendEpisode) {
  return [episode.home, episode.away];
}

function getUniqueEpisodeTeams() {
  const seen = new Set<string>();
  const teams: string[] = [];

  for (const episode of YOUTUBE_LEGEND_EPISODES) {
    for (const team of getEpisodeTeams(episode)) {
      const key = slugify(team);

      if (!seen.has(key)) {
        seen.add(key);
        teams.push(team);
      }
    }
  }

  return teams;
}

function firstEpisodeForTeam(team: string) {
  const key = slugify(team);

  return YOUTUBE_LEGEND_EPISODES.find((episode) =>
    getEpisodeTeams(episode).some((episodeTeam) => slugify(episodeTeam) === key),
  ) ?? null;
}

function createEpisodeCard(episode: YouTubeLegendEpisode): LegendCardDefinition {
  return {
    id: `ep${episode.ep}-${slugify(`${episode.home}-${episode.away}`)}`,
    episode: episode.ep,
    episodeLabel: episode.episodeLabel,
    kind: "episode-special",
    title: titleFromHook(episode.hook),
    subtitle: `${episode.episodeLabel ?? `Episode ${episode.ep}`} special card`,
    teams: `${episode.home} vs ${episode.away}`,
    rarity: "Legendary",
    story: episode.story,
    youtube: episode.youtube,
    imageTeam: episode.imageTeam ?? episode.home,
  };
}

function createSupporterCard(team: string): LegendCardDefinition | null {
  const episode = firstEpisodeForTeam(team);

  if (!episode) {
    return null;
  }

  const teamSlug = slugify(team);
  const supporterAsset = findSupporterCardAsset(team);
  const supporterReference = supporterAsset?.supporterReference ?? "National-team supporter";
  const supporterStory =
    supporterAsset?.story ??
    `Every nation has a guardian. The ${team} supporter appears before the floodlights, ` +
      "carrying old songs, team colors, and match-day omens into the WorldCup26 Legends album.";
  const supporterVoiceStory = supporterAsset?.voiceStory ?? supporterStory;

  return {
    id: `supporter-${teamSlug}`,
    episode: episode.ep,
    episodeLabel: "Supporter card",
    kind: "supporter-card",
    title: supporterAsset?.mysteryName ?? `${team} Supporter`,
    subtitle: supporterReference,
    teams: team,
    rarity: "Legendary",
    story: supporterStory,
    voiceStory: supporterVoiceStory,
    youtube: null,
    imageTeam: team,
  };
}

function createBonusCard(video: YouTubeLegendBonusVideo): LegendCardDefinition {
  return {
    id: video.id,
    episode: video.episode,
    episodeLabel: video.episodeLabel,
    kind: "legend-bonus",
    title: video.title,
    subtitle: video.subtitle,
    teams: video.teams,
    rarity: "Legendary",
    story: video.story,
    youtube: video.youtube,
    alternateYoutube: video.alternateYoutube,
    imageTeam: video.imageTeam,
  };
}

function createSeriesCard(video: YouTubeLegendBonusVideo): LegendCardDefinition {
  return {
    id: video.id,
    episode: video.episode,
    episodeLabel: video.episodeLabel,
    kind: "episode-special",
    title: video.title,
    subtitle: video.subtitle,
    teams: video.teams,
    rarity: "Legendary",
    story: video.story,
    youtube: video.youtube,
    alternateYoutube: video.alternateYoutube,
    imageTeam: video.imageTeam,
  };
}

function createDidYouKnowShortCard(short: YouTubeDidYouKnowShort): LegendCardDefinition {
  return {
    id: short.id,
    episode: short.episode,
    episodeLabel: short.episodeLabel,
    kind: "did-you-know-short",
    title: short.title,
    subtitle: short.subtitle,
    teams: short.teams,
    rarity: "Legendary",
    story: short.story,
    youtube: short.youtube,
    imageTeam: short.imageTeam,
  };
}

function isSeriesVideo(video: YouTubeLegendBonusVideo) {
  return video.kind === "series";
}

function isStandaloneBonusVideo(video: YouTubeLegendBonusVideo) {
  return !isSeriesVideo(video);
}

const generatedEpisodeCards = YOUTUBE_LEGEND_EPISODES.filter(
  (episode) => !handMadeEpisodeNumbers.has(episode.ep),
).map(createEpisodeCard);

const supporterCards = getUniqueEpisodeTeams().map(createSupporterCard).filter((card): card is LegendCardDefinition =>
  Boolean(card),
);

const channelSeriesCards = YOUTUBE_LEGEND_BONUS_VIDEOS.filter(isSeriesVideo).map(createSeriesCard);

const channelBonusCards = YOUTUBE_LEGEND_BONUS_VIDEOS.filter(isStandaloneBonusVideo).map(createBonusCard);

const didYouKnowShortCards = YOUTUBE_DID_YOU_KNOW_SHORTS.map(createDidYouKnowShortCard);

function isChannelBonus(card: LegendCardDefinition) {
  return card.episode >= 900;
}

export const LEGEND_CARD_DEFINITIONS: LegendCardDefinition[] = [
  ...handMadeLegendCards,
  ...generatedEpisodeCards,
  ...supporterCards,
  ...channelSeriesCards,
  ...didYouKnowShortCards,
  ...channelBonusCards,
].sort((a, b) => {
  if (isChannelBonus(a) !== isChannelBonus(b)) {
    return isChannelBonus(a) ? 1 : -1;
  }

  return b.episode - a.episode || a.title.localeCompare(b.title);
});

export const LEGEND_CARD_IDS = new Set(LEGEND_CARD_DEFINITIONS.map((card) => card.id));

export function findLegendCardDefinition(cardId: string) {
  return LEGEND_CARD_DEFINITIONS.find((card) => card.id === cardId) ?? null;
}

export function isUnlockableLegendCard(cardId: string) {
  const card = findLegendCardDefinition(cardId);

  return Boolean(card?.youtube);
}
