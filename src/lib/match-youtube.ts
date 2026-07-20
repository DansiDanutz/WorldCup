import { YOUTUBE_LEGEND_EPISODES, type YouTubeLegendEpisode } from "@/lib/youtube-legend-episodes";

export type MatchYoutubeEpisode = Pick<YouTubeLegendEpisode, "ep" | "home" | "away" | "hook" | "youtube">;

type MatchYoutubeLookupInput = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeName: string;
  awayName: string;
};

const teamAliasesById: Record<string, string[]> = {
  bosnia_herzegovina: ["Bosnia and Herzegovina", "Bosnia & Herzegovina", "Bosnia"],
  cabo_verde: ["Cabo Verde", "Cape Verde"],
  congo_dr: ["Congo DR", "DR Congo", "D.R. Congo", "Democratic Republic of Congo"],
  cote_divoire: ["Cote d'Ivoire", "Ivory Coast"],
  czechia: ["Czechia", "Czech Republic"],
  ir_iran: ["IR Iran", "Iran"],
  korea_republic: ["Korea Republic", "South Korea"],
  turkiye: ["Turkiye", "Turkey"],
  united_states: ["United States", "USA", "USMNT"],
};

const teamAliasesByName: Record<string, string[]> = {
  bosnia: teamAliasesById.bosnia_herzegovina,
  "bosnia and herzegovina": teamAliasesById.bosnia_herzegovina,
  "bosnia herzegovina": teamAliasesById.bosnia_herzegovina,
  "cabo verde": teamAliasesById.cabo_verde,
  "cape verde": teamAliasesById.cabo_verde,
  "cote divoire": teamAliasesById.cote_divoire,
  "cote d ivoire": teamAliasesById.cote_divoire,
  "czech republic": teamAliasesById.czechia,
  czechia: teamAliasesById.czechia,
  "d r congo": teamAliasesById.congo_dr,
  "democratic republic of congo": teamAliasesById.congo_dr,
  "dr congo": teamAliasesById.congo_dr,
  "congo dr": teamAliasesById.congo_dr,
  iran: teamAliasesById.ir_iran,
  "ir iran": teamAliasesById.ir_iran,
  "ivory coast": teamAliasesById.cote_divoire,
  "korea republic": teamAliasesById.korea_republic,
  "south korea": teamAliasesById.korea_republic,
  turkey: teamAliasesById.turkiye,
  turkiye: teamAliasesById.turkiye,
  "united states": teamAliasesById.united_states,
  usa: teamAliasesById.united_states,
  usmnt: teamAliasesById.united_states,
};

function normalizeTeam(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function expandAliases(teamId: string | null, name: string) {
  const aliases = new Set<string>();
  const normalizedName = normalizeTeam(name);

  aliases.add(normalizedName);

  for (const alias of teamId ? (teamAliasesById[teamId] ?? []) : []) {
    aliases.add(normalizeTeam(alias));
  }

  for (const alias of teamAliasesByName[normalizedName] ?? []) {
    aliases.add(normalizeTeam(alias));
  }

  return [...aliases].filter(Boolean);
}

function pairKey(first: string, second: string) {
  return [first, second].sort().join("|");
}

const episodesByTeamPair = new Map<string, MatchYoutubeEpisode>();

for (const episode of YOUTUBE_LEGEND_EPISODES) {
  const homeAliases = expandAliases(null, episode.home);
  const awayAliases = expandAliases(null, episode.away);

  for (const homeAlias of homeAliases) {
    for (const awayAlias of awayAliases) {
      const key = pairKey(homeAlias, awayAlias);
      const current = episodesByTeamPair.get(key);

      if (!current || current.ep < episode.ep) {
        episodesByTeamPair.set(key, episode);
      }
    }
  }
}

export function getYoutubeEpisodeForMatch({
  homeTeamId,
  awayTeamId,
  homeName,
  awayName,
}: MatchYoutubeLookupInput) {
  const homeAliases = expandAliases(homeTeamId, homeName);
  const awayAliases = expandAliases(awayTeamId, awayName);
  let bestEpisode: MatchYoutubeEpisode | null = null;

  for (const homeAlias of homeAliases) {
    for (const awayAlias of awayAliases) {
      const episode = episodesByTeamPair.get(pairKey(homeAlias, awayAlias));

      if (episode && (!bestEpisode || bestEpisode.ep < episode.ep)) {
        bestEpisode = episode;
      }
    }
  }

  return bestEpisode;
}
