"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, LockKeyhole, LogIn, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { CardViewControl } from "@/components/card-view-control";
import { LEGEND_CARDS, type LegendCard } from "@/lib/legend-cards";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const unlockedStorageKey = "worldcup_legend_unlocked_cards";
const openedStorageKey = "worldcup_legend_opened_cards";
const watchedStorageKey = "worldcup_legend_watched_cards";
const storageEventName = "worldcup:legend-card-storage";
const compactLegendCardCount = 12;
const validCardIds = new Set(LEGEND_CARDS.map((card) => card.id));
const unlockableCardIds = new Set(LEGEND_CARDS.filter((card) => card.youtube).map((card) => card.id));

type LegendCardFilter = "all" | "stories" | "bonus" | "ready" | "collected" | "locked";

const legendCardFilterLabels: Record<LegendCardFilter, string> = {
  all: "All cards",
  stories: "Stories",
  bonus: "Bonus",
  ready: "Ready",
  collected: "Collected",
  locked: "Locked",
};

const legendCardFilters: Array<{ id: LegendCardFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "stories", label: "Stories" },
  { id: "bonus", label: "Bonus" },
  { id: "ready", label: "Ready" },
  { id: "collected", label: "Collected" },
  { id: "locked", label: "Locked" },
];

function getEpisodeLabel(card: LegendCard) {
  return card.episodeLabel ?? `Episode ${card.episode}`;
}

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
  const [cardFilter, setCardFilter] = useState<LegendCardFilter>("all");
  const [collectionExpanded, setCollectionExpanded] = useState(false);
  const [status, setStatus] = useState(
    "Open a YouTube story to collect its card. Use Listen story for in-app voice playback.",
  );

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
  const storyCount = useMemo(() => LEGEND_CARDS.filter((card) => card.kind === "episode-special").length, []);
  const bonusCount = useMemo(() => LEGEND_CARDS.filter((card) => card.kind === "legend-bonus").length, []);
  const newestEpisodeCard = useMemo(
    () => LEGEND_CARDS.find((card) => card.kind === "episode-special" && card.youtube) ?? LEGEND_CARDS[0],
    [],
  );
  const readyCount = LEGEND_CARDS.filter(
    (card) => Boolean(card.youtube && watchedIds.has(card.id) && !unlockedIds.has(card.id)),
  ).length;
  const lockedCount = LEGEND_CARDS.length - collectedCount;
  const progressPercent = LEGEND_CARDS.length
    ? Math.round((collectedCount / LEGEND_CARDS.length) * 100)
    : 0;
  const focusCard =
    LEGEND_CARDS.find((card) => Boolean(card.youtube && !unlockedIds.has(card.id))) ??
    newestEpisodeCard;
  const filteredCards = useMemo(() => {
    return LEGEND_CARDS.filter((card) => {
      if (cardFilter === "stories") {
        return card.kind === "episode-special";
      }
      if (cardFilter === "bonus") {
        return card.kind === "legend-bonus";
      }
      if (cardFilter === "ready") {
        return Boolean(card.youtube && watchedIds.has(card.id) && !unlockedIds.has(card.id));
      }
      if (cardFilter === "collected") {
        return unlockedIds.has(card.id);
      }
      if (cardFilter === "locked") {
        return !unlockedIds.has(card.id);
      }

      return true;
    });
  }, [cardFilter, unlockedIds, watchedIds]);
  const visibleCards = collectionExpanded
    ? filteredCards
    : filteredCards.slice(0, compactLegendCardCount);
  const selectedFilterLabel = legendCardFilterLabels[cardFilter].toLowerCase();
  const compactCardsText =
    filteredCards.length <= compactLegendCardCount
      ? `All ${filteredCards.length} ${selectedFilterLabel}`
      : `First ${Math.min(compactLegendCardCount, filteredCards.length)} of ${filteredCards.length} ${selectedFilterLabel}`;
  const expandedCardsText = `All ${filteredCards.length} ${selectedFilterLabel}`;
  const filterCounts: Record<LegendCardFilter, number> = {
    all: LEGEND_CARDS.length,
    stories: storyCount,
    bonus: bonusCount,
    ready: readyCount,
    collected: collectedCount,
    locked: lockedCount,
  };

  const markCardOpened = useCallback((card: LegendCard) => {
    if (!card.youtube) {
      return;
    }

    const nextWatched = new Set(readCurrentStoredIds(watchedStorageKey));
    nextWatched.add(card.id);
    writeStoredIds(watchedStorageKey, nextWatched);

    const nextOpened = new Set(readCurrentStoredIds(openedStorageKey));
    nextOpened.add(card.id);
    writeStoredIds(openedStorageKey, nextOpened);

    setStatus(`${card.title} opened on YouTube. You can unlock the card now.`);
  }, []);

  function startWatch(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    markCardOpened(card);
    const opened = window.open(card.youtube, "_blank", "noopener,noreferrer");

    if (opened) {
      opened.opener = null;
      setStatus(`Opened ${card.teams} on YouTube. Return here to unlock ${card.title}.`);
    } else {
      setStatus(`Popup blocked. Use the YouTube link, then unlock ${card.title}.`);
    }
  }

  async function unlockCard(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    if (!watchedIds.has(card.id)) {
      setStatus(`Open the ${card.teams} YouTube story first.`);
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

    if (speakingCardId === card.id) {
      window.speechSynthesis.cancel();
      setSpeakingCardId(null);
      setStatus("Story stopped.");
      return;
    }

    window.speechSynthesis.cancel();

    if (!voiceEnabled) {
      setVoiceEnabled(true);
    }

    const utterance = new SpeechSynthesisUtterance(
      `${card.title}. ${card.episodeLabel ?? `Episode ${card.episode}`}. ${card.teams}. ${card.story}`,
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

  function chooseCardFilter(nextFilter: LegendCardFilter) {
    setCardFilter(nextFilter);
    setCollectionExpanded(false);
  }

  return (
    <section id="legend-cards" className="legend-collection" aria-labelledby="legend-collection-title">
      <div className="legend-collection__hero">
        <div>
          <p className="wc-card-eyebrow">WorldCup26 Legends</p>
          <h1 id="legend-collection-title">Legend Card Collection</h1>
          <p>
            Collect the episode specials and bonus legends by opening the matching YouTube story.
            Every card can read its story aloud inside the app, without video playback here.
          </p>
        </div>

        <div className="legend-collection__controls" aria-label="Legend collection controls">
          <span className="legend-collection__meter">
            <Sparkles size={16} aria-hidden="true" />
            {collectedCount} / {LEGEND_CARDS.length} collected
          </span>
          <span className="legend-collection__meter">{liveCount} live now</span>
          <span className="legend-collection__meter">{accountSyncLabel}</span>
          {!accountToken ? (
            <Link
              className="legend-sync-link"
              href={{ pathname: "/login", query: { returnTo: "/predictions#legend-cards" } }}
            >
              <LogIn size={16} />
              Sign in to save
            </Link>
          ) : null}
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

      {focusCard ? (
        <div className="legend-album" aria-label="Legend card album command center">
          <article
            className={`legend-feature-card ${
              unlockedIds.has(focusCard.id) ? "is-unlocked" : "is-locked"
            }`}
          >
            <div className="legend-feature-card__image">
              <Image
                src={focusCard.image}
                alt={`${focusCard.title} featured Legend card`}
                fill
                sizes="(max-width: 760px) 92vw, 260px"
                priority
              />
              {!unlockedIds.has(focusCard.id) ? (
                <span className="legend-feature-card__state">
                  <LockKeyhole size={16} />
                  Next to collect
                </span>
              ) : (
                <span className="legend-feature-card__state is-collected">
                  <Check size={16} />
                  Collected
                </span>
              )}
            </div>
            <div className="legend-feature-card__body">
              <p className="wc-card-eyebrow">Latest from YouTube</p>
              <h2>{focusCard.title}</h2>
              <p>{focusCard.teams}</p>
              <small>{getEpisodeLabel(focusCard)} · {focusCard.subtitle}</small>
              <div className="legend-feature-card__actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => startWatch(focusCard)}
                >
                  <ExternalLink size={16} />
                  Open YouTube
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => speakStory(focusCard)}
                >
                  {speakingCardId === focusCard.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  {speakingCardId === focusCard.id ? "Stop story" : "Listen story"}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={
                    unlockedIds.has(focusCard.id) ||
                    !Boolean(focusCard.youtube && watchedIds.has(focusCard.id))
                  }
                  onClick={() => unlockCard(focusCard)}
                >
                  {unlockedIds.has(focusCard.id) ? "Unlocked" : "Unlock card"}
                </button>
              </div>
            </div>
          </article>

          <div className="legend-progress-panel">
            <div>
              <p className="wc-card-eyebrow">Album progress</p>
              <strong>{progressPercent}% collected</strong>
              <span>{collectedCount} of {LEGEND_CARDS.length} cards saved</span>
            </div>
            <div className="legend-progress-panel__bar" aria-hidden="true">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <dl className="legend-progress-panel__stats">
              <div>
                <dt>Stories</dt>
                <dd>{storyCount}</dd>
              </div>
              <div>
                <dt>Bonus</dt>
                <dd>{bonusCount}</dd>
              </div>
              <div>
                <dt>Ready</dt>
                <dd>{readyCount}</dd>
              </div>
              <div>
                <dt>Locked</dt>
                <dd>{lockedCount}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}

      <div className="legend-filter-bar" aria-label="Filter Legend cards">
        {legendCardFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`legend-filter-button ${cardFilter === filter.id ? "is-active" : ""}`}
            onClick={() => chooseCardFilter(filter.id)}
            aria-pressed={cardFilter === filter.id}
          >
            <span>{filter.label}</span>
            <strong>{filterCounts[filter.id]}</strong>
          </button>
        ))}
      </div>

      {filteredCards.length > compactLegendCardCount ? (
        <CardViewControl
          controlsId="legend-card-grid"
          expanded={collectionExpanded}
          label="Legend card album"
          compactText={compactCardsText}
          expandedText={expandedCardsText}
          onToggle={() => setCollectionExpanded((expanded) => !expanded)}
        />
      ) : null}

      <div id="legend-card-grid" className="legend-card-grid">
        {visibleCards.map((card, index) => {
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
                  priority={index < 2}
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
                  <span>{getEpisodeLabel(card)}</span>
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
                      <ExternalLink size={16} />
                      {hasWatchedEpisode ? "Open again" : "Open YouTube"}
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
                    <span>{isSpeaking ? "Stop story" : "Listen story"}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredCards.length === 0 ? (
        <p className="legend-card-empty">
          No cards in this view yet. Open a story on YouTube, return here, then unlock it.
        </p>
      ) : null}
    </section>
  );
}
