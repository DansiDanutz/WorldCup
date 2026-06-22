// WorldCup26 Legends episode/match predictions feed for the Predictions tab.
//
// IMPORTANT: scorelines here are story predictions from the matching YouTube
// episode, not official match results. Official scoring is handled by the
// worldcup_matches data and the Supabase point-application functions.

import { YOUTUBE_LEGEND_EPISODES } from "@/lib/youtube-legend-episodes";

export type MatchPrediction = {
  ep: number;
  episodeLabel?: string;
  home: string;
  away: string;
  /** Group / stage label, when known from the episode canon. */
  stage?: string;
  /** Human date of the match the episode covers. */
  date?: string;
  /** Predicted scoreline as "home-away", or null when the episode leaves it open. */
  score: string | null;
  /** One-line story hook for the card. */
  hook: string;
  /** Public YouTube URL for the live episode. */
  youtube: string;
};

export const PREDICTIONS: MatchPrediction[] = YOUTUBE_LEGEND_EPISODES.map((episode) => ({
  ep: episode.ep,
  episodeLabel: episode.episodeLabel,
  home: episode.home,
  away: episode.away,
  stage: episode.stage,
  date: episode.date,
  score: episode.score,
  hook: episode.hook,
  youtube: episode.youtube,
}));
