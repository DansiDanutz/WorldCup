"use client";

import { ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { LegendCard } from "@/lib/legend-cards";
import {
  WATCH_UNLOCK_FRACTION,
  getWatchedFraction,
  getYouTubeVideoId,
  isWatchComplete,
  parseWatchRanges,
  recordPlaybackSample,
  type WatchRanges,
} from "@/lib/youtube-watch-progress";

// Embedded, verified watch for a Legend card. The official YouTube IFrame player is
// used deliberately: plays of a public video through an embed count as views and
// watch time on the channel, so every unlock also feeds the channel's watch hours.
//
// Unlocks at WATCH_UNLOCK_FRACTION of the real duration, measured as covered video
// seconds (see youtube-watch-progress.ts). Progress is saved per card so a long film
// resumes instead of restarting. If YouTube refuses the embed, the viewer can fall
// back to the old open-in-a-tab flow.

const youtubeApiReadyEvent = "worldcup:youtube-api-ready";
const watchRangesStorageKey = "worldcup_legend_watch_ranges";
const sampleIntervalMs = 1000;

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubePlayerEvent = { data: number; target: YouTubePlayer };

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: YouTubePlayerEvent) => void;
        onStateChange: (event: YouTubePlayerEvent) => void;
        onError: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  youtubeApiPromise ??= new Promise<void>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.addEventListener(youtubeApiReadyEvent, () => resolve(), { once: true });
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.dispatchEvent(new Event(youtubeApiReadyEvent));
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        youtubeApiPromise = null;
        reject(new Error("YouTube player could not load."));
      };
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function readSavedRanges(cardId: string): WatchRanges {
  try {
    const all = JSON.parse(window.localStorage.getItem(watchRangesStorageKey) ?? "{}");
    return parseWatchRanges(all?.[cardId]);
  } catch {
    return [];
  }
}

function saveRanges(cardId: string, ranges: WatchRanges) {
  try {
    const all = JSON.parse(window.localStorage.getItem(watchRangesStorageKey) ?? "{}") ?? {};
    all[cardId] = ranges;
    window.localStorage.setItem(watchRangesStorageKey, JSON.stringify(all));
  } catch {
    // Storage blocked: progress simply lasts for this session.
  }
}

// 101/150 = embedding disabled by the owner, 100 = removed/private, 2/5 = bad request.
function describePlayerError(code: number) {
  return code === 101 || code === 150
    ? "This video can't play inside the app."
    : "YouTube couldn't play this video here.";
}

function formatMinutes(seconds: number) {
  const whole = Math.max(0, Math.ceil(seconds));
  return whole >= 60 ? `${Math.floor(whole / 60)}m ${whole % 60}s` : `${whole}s`;
}

export function LegendWatchPlayer({
  card,
  onClose,
  onVerified,
  onOpenOnYouTube,
  onCollect,
}: {
  card: LegendCard;
  onClose: () => void;
  onVerified: (card: LegendCard) => void;
  onOpenOnYouTube: (card: LegendCard) => void;
  onCollect: (card: LegendCard) => void;
}) {
  const videoId = getYouTubeVideoId(card.youtube);
  // YT.Player *replaces* the element it is given with its own iframe. If React
  // owned that element, React could no longer swap it for the error fallback, and
  // a failed video left a dead modal. So React owns only this stable wrapper; the
  // node YouTube replaces is created imperatively inside it.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const rangesRef = useRef<WatchRanges>([]);
  const lastSampleRef = useRef<number | null>(null);
  const verifiedRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [fraction, setFraction] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(videoId ? null : "This card has no playable video yet.");
  const [verified, setVerified] = useState(false);

  // The parent passes fresh inline callbacks on every render (and the collection
  // re-renders every second). Keeping them in refs means the player is created once
  // per card; depending on them directly tore the player down and rebuilt it on each
  // parent render, restarting the video about once a second.
  const onVerifiedRef = useRef(onVerified);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onVerifiedRef.current = onVerified;
    onCloseRef.current = onClose;
  });

  const verify = useCallback(() => {
    if (verifiedRef.current) {
      return;
    }
    verifiedRef.current = true;
    setVerified(true);
    onVerifiedRef.current(card);
  }, [card]);

  const takeSample = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const current = player.getCurrentTime();
    const total = player.getDuration();
    rangesRef.current = recordPlaybackSample(rangesRef.current, lastSampleRef.current, current);
    lastSampleRef.current = current;

    if (total > 0) {
      setDuration(total);
      setFraction(getWatchedFraction(rangesRef.current, total));
      if (isWatchComplete(rangesRef.current, total)) {
        verify();
      }
    }
  }, [verify]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!videoId || !wrapper) {
      return;
    }

    let cancelled = false;
    const host = document.createElement("div");
    wrapper.appendChild(host);
    rangesRef.current = readSavedRanges(card.id);

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player) {
          return;
        }

        playerRef.current = new window.YT.Player(host, {
          videoId,
          playerVars: { autoplay: 1, controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
          events: {
            onReady: (event) => {
              const total = event.target.getDuration();
              if (total > 0) {
                setDuration(total);
                setFraction(getWatchedFraction(rangesRef.current, total));
                if (isWatchComplete(rangesRef.current, total)) {
                  verify(); // resumed with enough saved progress already
                }
              }
            },
            onStateChange: (event) => {
              const playing = event.data === window.YT?.PlayerState.PLAYING;
              setIsPlaying(playing);
              // A fresh baseline on every (re)start, so resuming after a pause or
              // a seek never counts the jump itself as watched time.
              lastSampleRef.current = playing ? event.target.getCurrentTime() : null;
            },
            onError: (event) => setError(describePlayerError(event.data)),
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("YouTube player could not load in this browser.");
        }
      });

    return () => {
      cancelled = true;
      saveRanges(card.id, rangesRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
      wrapper.replaceChildren();
    };
  }, [card.id, verify, videoId]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      takeSample();
      saveRanges(card.id, rangesRef.current);
    }, sampleIntervalMs);

    return () => window.clearInterval(interval);
  }, [card.id, isPlaying, takeSample]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const percent = Math.round(fraction * 100);
  const target = Math.round(WATCH_UNLOCK_FRACTION * 100);
  const complete = verified || (duration > 0 && fraction >= WATCH_UNLOCK_FRACTION);
  const secondsLeft = Math.max(0, duration * WATCH_UNLOCK_FRACTION - duration * fraction);

  return (
    <div className="legend-watch-modal" role="dialog" aria-modal="true" aria-labelledby="legend-watch-title">
      <div className="legend-watch-modal__panel">
        <div className="legend-watch-modal__header">
          <div>
            <p className="wc-card-eyebrow">Watch to unlock</p>
            <h2 id="legend-watch-title">{card.title}</h2>
            <p>{card.teams}</p>
          </div>
          <button className="legend-watch-modal__close" onClick={onClose} type="button" aria-label="Close player">
            <X size={19} />
          </button>
        </div>

        <div className="legend-watch-modal__player">
          <div ref={wrapperRef} className="legend-watch-modal__embed" hidden={Boolean(error)} />
          {error ? (
            <div className="legend-watch-modal__fallback">
              <strong>{error}</strong>
              {card.youtube ? (
                <button className="button secondary" type="button" onClick={() => onOpenOnYouTube(card)}>
                  <ExternalLink size={16} /> Open on YouTube instead
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {!error ? (
          <div className="legend-watch-modal__progress" aria-live="polite">
            <div>
              <strong>{complete ? "Watched — ready to collect" : `${percent}% of ${target}% watched`}</strong>
              <span>
                {complete
                  ? `Add ${card.title} to your album.`
                  : duration > 0
                    ? `About ${formatMinutes(secondsLeft)} more. Skipping ahead doesn't count.`
                    : "Press play to start."}
              </span>
            </div>
            <progress max={target} value={Math.min(percent, target)} aria-label="Watch progress toward unlock" />
          </div>
        ) : null}

        {complete ? (
          <div className="legend-watch-modal__actions">
            <button className="button" type="button" onClick={() => onCollect(card)}>
              Collect card
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
