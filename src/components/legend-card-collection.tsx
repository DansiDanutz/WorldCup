"use client";

import Image from "next/image";
import { Check, LockKeyhole, PlayCircle, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { LEGEND_CARDS, type LegendCard } from "@/lib/legend-cards";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const unlockedStorageKey = "worldcup_legend_unlocked_cards";
const openedStorageKey = "worldcup_legend_opened_cards";
const storageEventName = "worldcup:legend-card-storage";
const validCardIds = new Set(LEGEND_CARDS.map((card) => card.id));

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
  const openedIds = useStoredIds(openedStorageKey);
  const [accountToken, setAccountToken] = useState<string | null>(null);
  const [accountSyncLabel, setAccountSyncLabel] = useState("Saved on this device");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [status, setStatus] = useState("Cards unlock after you open their matching YouTube episode.");

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncAccountCollection() {
      try {
        const supabase = createBrowserSupabaseClient();
        const sessionResult = await supabase.auth.getSession();
        const token = sessionResult.data.session?.access_token ?? null;

        if (cancelled) {
          return;
        }

        if (!token) {
          setAccountToken(null);
          setAccountSyncLabel("Saved on this device");
          return;
        }

        setAccountToken(token);
        setAccountSyncLabel("Syncing account");

        const remoteIds = await readAccountUnlockedIds(token);
        const localIds = readCurrentStoredIds(unlockedStorageKey);
        const localOnlyIds = [...localIds].filter((cardId) => !remoteIds.has(cardId));

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

    syncAccountCollection();

    return () => {
      cancelled = true;
    };
  }, []);

  const collectedCount = LEGEND_CARDS.filter((card) => unlockedIds.has(card.id)).length;
  const liveCount = useMemo(() => LEGEND_CARDS.filter((card) => card.youtube).length, []);

  function rememberOpened(card: LegendCard) {
    if (!card.youtube) {
      return;
    }

    const next = new Set(openedIds);
    next.add(card.id);
    writeStoredIds(openedStorageKey, next);
    setStatus(`${card.title} is ready to unlock after the YouTube episode.`);
  }

  async function unlockCard(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    if (!openedIds.has(card.id)) {
      setStatus(`Open the ${card.teams} episode on YouTube first.`);
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
    <section className="legend-collection" aria-labelledby="legend-collection-title">
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
          const hasOpenedEpisode = openedIds.has(card.id);
          const canUnlock = Boolean(card.youtube && hasOpenedEpisode && !isUnlocked);
          const isSpeaking = speakingCardId === card.id;

          return (
            <article
              key={card.id}
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
                    <a
                      className="button legend-card__watch"
                      href={card.youtube}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => rememberOpened(card)}
                    >
                      <PlayCircle size={16} />
                      Watch on YouTube
                    </a>
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
    </section>
  );
}
