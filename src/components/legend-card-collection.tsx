"use client";

import Image from "next/image";
import { Check, ExternalLink, LockKeyhole, PlayCircle, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { LEGEND_CARDS, type LegendCard } from "@/lib/legend-cards";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const unlockedStorageKey = "worldcup_legend_unlocked_cards";
const openedStorageKey = "worldcup_legend_opened_cards";
const watchedStorageKey = "worldcup_legend_watched_cards";
const storageEventName = "worldcup:legend-card-storage";
const youtubeApiReadyEvent = "worldcup:youtube-api-ready";
const watchUnlockSeconds = 45;
const validCardIds = new Set(LEGEND_CARDS.map((card) => card.id));
const unlockableCardIds = new Set(LEGEND_CARDS.filter((card) => card.youtube).map((card) => card.id));

type YouTubePlayerState = {
  ENDED: number;
  PLAYING: number;
};

type YouTubePlayer = {
  destroy: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  stopVideo: () => void;
};

type YouTubePlayerEvent = {
  data: number;
  target: YouTubePlayer;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: () => void;
      onStateChange: (event: YouTubePlayerEvent) => void;
      onError: () => void;
    };
  },
) => YouTubePlayer;

type YouTubeApi = {
  Player: YouTubePlayerConstructor;
  PlayerState: YouTubePlayerState;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function parseStoredIds(snapshot: string | null) {
  try {
    const parsed = snapshot ? JSON.parse(snapshot) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id) => typeof id === "string" && validCardIds.has(id))
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function subscribeToStoredIds(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(storageEventName, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(storageEventName, callback);
  };
}

function getStoredIdsSnapshot(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function getStoredIdsServerSnapshot() {
  return null;
}

function useStoredIds(key: string) {
  const snapshot = useSyncExternalStore(
    subscribeToStoredIds,
    () => getStoredIdsSnapshot(key),
    getStoredIdsServerSnapshot,
  );

  return useMemo(() => parseStoredIds(snapshot), [snapshot]);
}

function writeStoredIds(key: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids]));
    window.dispatchEvent(new Event(storageEventName));
  } catch {
    // Card collection should remain usable even when browser storage is blocked.
  }
}

function readCurrentStoredIds(key: string) {
  return parseStoredIds(getStoredIdsSnapshot(key));
}

function getYouTubeVideoId(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const watchId = parsed.searchParams.get("v");
      if (watchId) {
        return watchId;
      }

      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = pathParts.findIndex((part) => part === "embed" || part === "shorts");
      if (embedIndex >= 0) {
        return pathParts[embedIndex + 1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube player is only available in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<void>((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.addEventListener(
      youtubeApiReadyEvent,
      () => {
        resolve();
      },
      { once: true },
    );

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.dispatchEvent(new Event(youtubeApiReadyEvent));
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function idsFromApiPayload(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.unlockedCardIds)) {
    return new Set<string>();
  }

  return new Set(
    payload.unlockedCardIds.filter((id) => typeof id === "string" && validCardIds.has(id)),
  );
}

async function readAccountUnlockedIds(token: string) {
  const response = await fetch("/api/legend-cards", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.error === "string" ? payload.error : "Sync failed.");
  }

  return idsFromApiPayload(payload);
}

async function saveAccountUnlockedId(cardId: string, token: string) {
  const response = await fetch("/api/legend-cards", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardId }),
  });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.error === "string" ? payload.error : "Save failed.");
  }

  return idsFromApiPayload(payload);
}

export function LegendCardCollection() {
  const unlockedIds = useStoredIds(unlockedStorageKey);
  const watchedIds = useStoredIds(watchedStorageKey);
  const [accountToken, setAccountToken] = useState<string | null>(null);
  const [accountSyncLabel, setAccountSyncLabel] = useState("Saved on this device");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [watchingCard, setWatchingCard] = useState<LegendCard | null>(null);
  const [status, setStatus] = useState("Cards unlock after a verified in-app YouTube watch.");

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    async function syncAccountCollection(token: string | null) {
      if (!token) {
        if (!cancelled) {
          setAccountToken(null);
          setAccountSyncLabel("Saved on this device");
        }
        return;
      }

      try {
        if (cancelled) {
          return;
        }

        setAccountToken(token);
        setAccountSyncLabel("Syncing account");

        const remoteIds = await readAccountUnlockedIds(token);
        const localIds = readCurrentStoredIds(unlockedStorageKey);
        const localOnlyIds = [...localIds].filter(
          (cardId) => !remoteIds.has(cardId) && unlockableCardIds.has(cardId),
        );

        for (const cardId of localOnlyIds) {
          await saveAccountUnlockedId(cardId, token);
        }

        if (cancelled) {
          return;
        }

        const syncedIds = new Set([...remoteIds, ...localIds]);
        writeStoredIds(unlockedStorageKey, syncedIds);
        setAccountSyncLabel("Saved to account");

        if (syncedIds.size > 0) {
          setStatus(`${syncedIds.size} Legend cards synced to your account.`);
        }
      } catch {
        if (!cancelled) {
          setAccountSyncLabel("Device saved; account sync paused");
        }
      }
    }

    supabase.auth
      .getSession()
      .then(({ data }) => syncAccountCollection(data.session?.access_token ?? null))
      .catch(() => syncAccountCollection(null));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAccountCollection(nextSession?.access_token ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const collectedCount = LEGEND_CARDS.filter((card) => unlockedIds.has(card.id)).length;
  const liveCount = useMemo(() => LEGEND_CARDS.filter((card) => card.youtube).length, []);

  const markCardWatched = useCallback((card: LegendCard) => {
    if (!card.youtube) {
      return;
    }

    const nextWatched = new Set(readCurrentStoredIds(watchedStorageKey));
    nextWatched.add(card.id);
    writeStoredIds(watchedStorageKey, nextWatched);

    const nextOpened = new Set(readCurrentStoredIds(openedStorageKey));
    nextOpened.add(card.id);
    writeStoredIds(openedStorageKey, nextOpened);

    setStatus(`${card.title} verified. You can unlock the card now.`);
  }, []);

  function startWatch(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    if (!getYouTubeVideoId(card.youtube)) {
      setStatus(`This ${card.teams} episode needs a valid YouTube link before it can verify.`);
      return;
    }

    setWatchingCard(card);
    setStatus(`Watch ${card.teams} inside the app to verify this card.`);
  }

  async function unlockCard(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    if (!watchedIds.has(card.id)) {
      setStatus(`Watch the ${card.teams} episode in the app first.`);
      return;
    }

    const next = new Set(unlockedIds);
    next.add(card.id);
    writeStoredIds(unlockedStorageKey, next);

    if (!accountToken) {
      setStatus(`${card.title} collected on this device.`);
      return;
    }

    setAccountSyncLabel("Saving account");

    try {
      const accountIds = await saveAccountUnlockedId(card.id, accountToken);
      writeStoredIds(unlockedStorageKey, new Set([...next, ...accountIds]));
      setAccountSyncLabel("Saved to account");
      setStatus(`${card.title} collected and saved to your account.`);
    } catch {
      setAccountSyncLabel("Device saved; account sync paused");
      setStatus(`${card.title} collected on this device. Account sync can retry after sign-in.`);
    }
  }

  function toggleVoice() {
    if (!("speechSynthesis" in window)) {
      setStatus("Voice playback is not supported in this browser.");
      return;
    }

    setVoiceEnabled((enabled) => {
      const next = !enabled;
      if (!next) {
        window.speechSynthesis.cancel();
        setSpeakingCardId(null);
      }
      setStatus(next ? "Voice enabled. Pick any story card to listen." : "Voice disabled.");
      return next;
    });
  }

  function speakStory(card: LegendCard) {
    if (!("speechSynthesis" in window)) {
      setStatus("Voice playback is not supported in this browser.");
      return;
    }

    if (!voiceEnabled) {
      setStatus("Enable voice first, then tap a card story.");
      return;
    }

    if (speakingCardId === card.id) {
      window.speechSynthesis.cancel();
      setSpeakingCardId(null);
      setStatus("Story stopped.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `${card.title}. ${card.subtitle}. ${card.teams}. ${card.story}`,
    );
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingCardId(null);
    utterance.onerror = () => {
      setSpeakingCardId(null);
      setStatus("Voice playback stopped.");
    };

    setSpeakingCardId(card.id);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section id="legend-cards" className="legend-collection" aria-labelledby="legend-collection-title">
      <div className="legend-collection__hero">
        <div>
          <p className="wc-card-eyebrow">WorldCup26 Legends</p>
          <h1 id="legend-collection-title">Legend Card Collection</h1>
          <p>
            Collect the episode specials and bonus legends by watching the matching YouTube story.
            Locked cards stay foggy until the episode opens.
          </p>
        </div>

        <div className="legend-collection__controls" aria-label="Legend collection controls">
          <span className="legend-collection__meter">
            <Sparkles size={16} aria-hidden="true" />
            {collectedCount} / {LEGEND_CARDS.length} collected
          </span>
          <span className="legend-collection__meter">{liveCount} live now</span>
          <span className="legend-collection__meter">{accountSyncLabel}</span>
          <button
            type="button"
            className={`legend-voice-toggle ${voiceEnabled ? "is-on" : ""}`}
            onClick={toggleVoice}
            aria-pressed={voiceEnabled}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {voiceEnabled ? "Voice enabled" : "Enable voice"}
          </button>
        </div>
      </div>

      <p className="legend-collection__status" aria-live="polite">
        {status}
      </p>

      <div className="legend-card-grid">
        {LEGEND_CARDS.map((card) => {
          const isUnlocked = unlockedIds.has(card.id);
          const hasWatchedEpisode = watchedIds.has(card.id);
          const canUnlock = Boolean(card.youtube && hasWatchedEpisode && !isUnlocked);
          const isSpeaking = speakingCardId === card.id;

          return (
            <article
              key={card.id}
              id={`legend-card-${card.id}`}
              className={`legend-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${
                canUnlock ? "is-ready" : ""
              }`}
            >
              <div className="legend-card__image">
                <Image
                  src={card.image}
                  alt={`${card.title} collectible card`}
                  fill
                  sizes="(max-width: 760px) 92vw, (max-width: 1180px) 45vw, 320px"
                  priority={card.episode <= 1}
                />
                {!isUnlocked ? (
                  <div className="legend-card__lock" aria-hidden="true">
                    <LockKeyhole size={26} />
                    <span>Locked</span>
                  </div>
                ) : (
                  <div className="legend-card__collected" aria-hidden="true">
                    <Check size={18} />
                    Collected
                  </div>
                )}
              </div>

              <div className="legend-card__body">
                <div className="legend-card__meta">
                  <span>Episode {card.episode}</span>
                  <span>{card.rarity}</span>
                </div>
                <h2>{card.title}</h2>
                <p className="legend-card__subtitle">{card.subtitle}</p>
                <p className="legend-card__teams">{card.teams}</p>
                <p className="legend-card__story">{card.story}</p>

                <div className="legend-card__actions">
                  {card.youtube ? (
                    <button
                      type="button"
                      className="button legend-card__watch"
                      onClick={() => startWatch(card)}
                    >
                      <PlayCircle size={16} />
                      {hasWatchedEpisode ? "Watch again" : "Watch to unlock"}
                    </button>
                  ) : (
                    <span className="button secondary legend-card__disabled" aria-disabled="true">
                      Episode coming soon
                    </span>
                  )}

                  <button
                    type="button"
                    className="button secondary legend-card__unlock"
                    disabled={isUnlocked || !canUnlock}
                    onClick={() => unlockCard(card)}
                  >
                    {isUnlocked ? "Unlocked" : "Unlock card"}
                  </button>

                  <button
                    type="button"
                    className={`legend-card__voice ${isSpeaking ? "is-speaking" : ""}`}
                    onClick={() => speakStory(card)}
                    aria-label={`${isSpeaking ? "Stop" : "Listen to"} ${card.title} story`}
                    title={`${isSpeaking ? "Stop" : "Listen to"} story`}
                  >
                    {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {watchingCard ? (
        <LegendWatchModal
          card={watchingCard}
          onClose={() => setWatchingCard(null)}
          onVerified={markCardWatched}
        />
      ) : null}
    </section>
  );
}

function LegendWatchModal({
  card,
  onClose,
  onVerified,
}: {
  card: LegendCard;
  onClose: () => void;
  onVerified: (card: LegendCard) => void;
}) {
  const videoId = getYouTubeVideoId(card.youtube);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const verifiedRef = useRef(false);
  const watchedSecondsRef = useRef(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const progress = Math.min(100, Math.round((watchedSeconds / watchUnlockSeconds) * 100));

  const verifyCard = useCallback(() => {
    if (verifiedRef.current) {
      return;
    }

    verifiedRef.current = true;
    watchedSecondsRef.current = watchUnlockSeconds;
    setIsVerified(true);
    setIsPlaying(false);
    setWatchedSeconds(watchUnlockSeconds);
    onVerified(card);
  }, [card, onVerified]);

  useEffect(() => {
    if (!videoId || !playerHostRef.current) {
      setPlayerError("This card needs a valid YouTube video before it can verify.");
      return;
    }

    let cancelled = false;
    const host = playerHostRef.current;

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player || !host) {
          return;
        }

        playerRef.current = new window.YT.Player(host, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: () => setIsPlayerReady(true),
            onStateChange: (event) => {
              const playerState = window.YT?.PlayerState;
              if (!playerState) {
                return;
              }

              setIsPlaying(event.data === playerState.PLAYING);

              if (event.data === playerState.ENDED) {
                verifyCard();
              }
            },
            onError: () => {
              setPlayerError("YouTube could not play this episode here. Try again in a moment.");
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setPlayerError("YouTube player could not load in this browser.");
        }
      });

    return () => {
      cancelled = true;
      setIsPlaying(false);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [verifyCard, videoId]);

  useEffect(() => {
    if (!isPlaying || verifiedRef.current) {
      return;
    }

    const interval = window.setInterval(() => {
      const next = Math.min(watchUnlockSeconds, watchedSecondsRef.current + 1);
      watchedSecondsRef.current = next;
      setWatchedSeconds(next);

      if (next >= watchUnlockSeconds) {
        verifyCard();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPlaying, verifyCard]);

  return (
    <div className="legend-watch-modal" role="dialog" aria-modal="true" aria-labelledby="legend-watch-title">
      <div className="legend-watch-modal__panel">
        <div className="legend-watch-modal__header">
          <div>
            <p className="wc-card-eyebrow">Verified watch</p>
            <h2 id="legend-watch-title">{card.title}</h2>
            <p>{card.teams}</p>
          </div>
          <button className="legend-watch-modal__close" onClick={onClose} type="button" aria-label="Close watch player">
            <X size={19} />
          </button>
        </div>

        <div className="legend-watch-modal__player">
          {playerError ? (
            <div className="legend-watch-modal__fallback">
              <strong>{playerError}</strong>
              {card.youtube ? (
                <a className="button secondary" href={card.youtube} rel="noreferrer" target="_blank">
                  <ExternalLink size={16} />
                  Open on YouTube
                </a>
              ) : null}
            </div>
          ) : (
            <div ref={playerHostRef} />
          )}
        </div>

        <div className="legend-watch-modal__progress" aria-label="Watch verification progress">
          <div>
            <strong>{progress}% verified</strong>
            <span>
              {isVerified
                ? "Card ready to unlock."
                : isPlayerReady
                  ? "Keep the episode playing here to verify."
                  : "Loading YouTube player."}
            </span>
          </div>
          <progress value={watchedSeconds} max={watchUnlockSeconds}>
            {progress}%
          </progress>
        </div>
      </div>
    </div>
  );
}
