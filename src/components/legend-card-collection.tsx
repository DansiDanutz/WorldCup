"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Check,
  Download,
  ExternalLink,
  LockKeyhole,
  LogIn,
  Newspaper,
  Search,
  Sparkles,
  Smartphone,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { CardViewControl } from "@/components/card-view-control";
import { LEGEND_CARDS, type LegendCard } from "@/lib/legend-cards";
import {
  createLegendCardVoiceText,
  getStoryVoiceDisplayName,
  selectBrowserBrianStoryVoice,
  storyVoiceLanguage,
} from "@/lib/story-voice";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const unlockedStorageKey = "worldcup_legend_unlocked_cards";
const openedStorageKey = "worldcup_legend_opened_cards";
const watchedStorageKey = "worldcup_legend_watched_cards";
const listenedStorageKey = "worldcup_legend_listened_cards";
const pulseReadStorageKey = "worldcup_legend_pulse_reads";
const pulsePreviewStorageKey = "worldcup_legend_pulse_preview";
const watchProofStorageKey = "worldcup_legend_youtube_watch_proofs";
const notificationStorageKey = "worldcup_legend_notifications";
const storageEventName = "worldcup:legend-card-storage";
const compactLegendCardCount = 12;
const pulsePreviewDurationMs = 60_000;
const didYouKnowWatchMinimumMs = 20_000;
const storyWatchMinimumMs = 45_000;
const allowBrowserStoryVoiceFallback = process.env.NEXT_PUBLIC_ALLOW_BROWSER_STORY_VOICE_FALLBACK === "true";
const validCardIds = new Set(LEGEND_CARDS.map((card) => card.id));
const unlockableCardIds = new Set(LEGEND_CARDS.filter((card) => card.youtube).map((card) => card.id));
const legendCardById = new Map(LEGEND_CARDS.map((card) => [card.id, card]));

type LegendCardFilter =
  | "all"
  | "stories"
  | "wallpapers"
  | "supporters"
  | "legends"
  | "bonus"
  | "need-story"
  | "need-youtube"
  | "ready"
  | "collected"
  | "locked";

const legendCardFilterLabels: Record<LegendCardFilter, string> = {
  all: "All cards",
  stories: "Series",
  wallpapers: "Wallpapers",
  supporters: "Supporters",
  legends: "Did You Know Legends",
  bonus: "Bonus",
  "need-story": "Need story",
  "need-youtube": "YouTube next",
  ready: "Ready",
  collected: "Collected",
  locked: "Locked",
};

const legendCardFilters: Array<{ id: LegendCardFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "legends", label: "Legends" },
  { id: "stories", label: "Series" },
  { id: "wallpapers", label: "Wallpapers" },
  { id: "supporters", label: "Supporters" },
  { id: "bonus", label: "Bonus" },
  { id: "need-story", label: "Need story" },
  { id: "need-youtube", label: "YouTube next" },
  { id: "ready", label: "Ready" },
  { id: "collected", label: "Collected" },
  { id: "locked", label: "Locked" },
];

type LegendPulseItem = {
  id: string;
  cardId: string;
  label: string;
  headline: string;
  summary: string;
};

type PulsePreview = {
  cardId: string;
  expiresAt: number;
};

type WatchProof = {
  cardId: string;
  youtube: string;
  startedAt: number;
  eligibleAt: number;
};

type AccountLegendEvent = "pulse_read" | "listened" | "youtube_opened" | "unlocked";

type AccountLegendState = {
  unlockedIds: Set<string>;
  watchedIds: Set<string>;
  listenedIds: Set<string>;
  readPulseIds: Set<string>;
  progressSyncAvailable: boolean;
};

const pulseLabels = ["Fresh drop", "Watchlist", "Story beat", "Collector note", "Bonus hook"];
const legendPulseItems: LegendPulseItem[] = LEGEND_CARDS.filter(
  (card) => Boolean(card.youtube && card.kind === "episode-special"),
)
  .slice(0, 5)
  .map((card, index) => ({
    id: `pulse-${card.id}`,
    cardId: card.id,
    label: pulseLabels[index] ?? "Pulse",
    headline: `${card.teams}: ${card.title}`,
    summary: card.story,
  }));
const validPulseIds = new Set(legendPulseItems.map((item) => item.id));
const pulseItemById = new Map(legendPulseItems.map((item) => [item.id, item]));

function getEpisodeLabel(card: LegendCard) {
  return card.episodeLabel ?? `Episode ${card.episode}`;
}

function needsStoryStep(card: LegendCard, unlockedIds: ReadonlySet<string>, listenedIds: ReadonlySet<string>) {
  return Boolean(!unlockedIds.has(card.id) && !listenedIds.has(card.id));
}

function needsYoutubeStep(
  card: LegendCard,
  unlockedIds: ReadonlySet<string>,
  listenedIds: ReadonlySet<string>,
  watchedIds: ReadonlySet<string>,
) {
  return Boolean(card.youtube && !unlockedIds.has(card.id) && listenedIds.has(card.id) && !watchedIds.has(card.id));
}

function canCollectLegendCard(
  card: LegendCard,
  unlockedIds: ReadonlySet<string>,
  listenedIds: ReadonlySet<string>,
  watchedIds: ReadonlySet<string>,
) {
  if (unlockedIds.has(card.id)) {
    return false;
  }

  return card.youtube ? watchedIds.has(card.id) : listenedIds.has(card.id);
}

function parseStoredIds(snapshot: string | null, allowedIds = validCardIds) {
  try {
    const parsed = snapshot ? JSON.parse(snapshot) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id) => typeof id === "string" && allowedIds.has(id))
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

function useStoredIds(key: string, allowedIds = validCardIds) {
  const snapshot = useSyncExternalStore(
    subscribeToStoredIds,
    () => getStoredIdsSnapshot(key),
    getStoredIdsServerSnapshot,
  );

  return useMemo(() => parseStoredIds(snapshot, allowedIds), [allowedIds, snapshot]);
}

function writeStoredIds(key: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids]));
    window.dispatchEvent(new Event(storageEventName));
  } catch {
    // Card collection should remain usable even when browser storage is blocked.
  }
}

function readCurrentStoredIds(key: string, allowedIds = validCardIds) {
  return parseStoredIds(getStoredIdsSnapshot(key), allowedIds);
}

function parseStoredWatchProofs(snapshot: string | null) {
  try {
    const parsed = snapshot ? JSON.parse(snapshot) : [];
    const entries = Array.isArray(parsed) ? parsed : [];
    return new Map(
      entries
        .filter((entry): entry is WatchProof => {
          if (!isRecord(entry)) {
            return false;
          }

          return (
            typeof entry.cardId === "string" &&
            validCardIds.has(entry.cardId) &&
            typeof entry.youtube === "string" &&
            typeof entry.startedAt === "number" &&
            typeof entry.eligibleAt === "number" &&
            entry.eligibleAt >= entry.startedAt
          );
        })
        .map((entry) => [entry.cardId, entry]),
    );
  } catch {
    return new Map<string, WatchProof>();
  }
}

function useStoredWatchProofs() {
  const snapshot = useSyncExternalStore(
    subscribeToStoredIds,
    () => getStoredIdsSnapshot(watchProofStorageKey),
    getStoredIdsServerSnapshot,
  );

  return useMemo(() => parseStoredWatchProofs(snapshot), [snapshot]);
}

function writeStoredWatchProofs(proofs: Map<string, WatchProof>) {
  try {
    window.localStorage.setItem(watchProofStorageKey, JSON.stringify([...proofs.values()]));
    window.dispatchEvent(new Event(storageEventName));
  } catch {
    // Watch proof only gates collection; the user can retry the YouTube step.
  }
}

function readCurrentStoredWatchProofs() {
  return parseStoredWatchProofs(getStoredIdsSnapshot(watchProofStorageKey));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function idsFromApiPayload(payload: unknown, key: string, allowedIds = validCardIds) {
  if (!isRecord(payload) || !Array.isArray(payload[key])) {
    return new Set<string>();
  }

  return new Set(payload[key].filter((id) => typeof id === "string" && allowedIds.has(id)));
}

function accountLegendStateFromApiPayload(payload: unknown): AccountLegendState {
  const pulseReadCardIds = idsFromApiPayload(payload, "pulseReadCardIds");

  return {
    unlockedIds: idsFromApiPayload(payload, "unlockedCardIds"),
    watchedIds: idsFromApiPayload(payload, "watchedCardIds"),
    listenedIds: idsFromApiPayload(payload, "listenedCardIds"),
    readPulseIds: new Set(
      legendPulseItems
        .filter((item) => pulseReadCardIds.has(item.cardId))
        .map((item) => item.id),
    ),
    progressSyncAvailable: isRecord(payload) ? payload.progressSyncAvailable !== false : false,
  };
}

function parseStoredPulsePreview(snapshot: string | null) {
  try {
    const parsed: unknown = snapshot ? JSON.parse(snapshot) : null;

    if (!isRecord(parsed)) {
      return null;
    }

    const { cardId, expiresAt } = parsed;
    if (
      typeof cardId !== "string" ||
      typeof expiresAt !== "number" ||
      !validCardIds.has(cardId) ||
      expiresAt <= Date.now()
    ) {
      return null;
    }

    return { cardId, expiresAt };
  } catch {
    return null;
  }
}

function readStoredPulsePreview() {
  return parseStoredPulsePreview(getStoredIdsSnapshot(pulsePreviewStorageKey));
}

function useStoredPulsePreview() {
  const snapshot = useSyncExternalStore(
    subscribeToStoredIds,
    () => getStoredIdsSnapshot(pulsePreviewStorageKey),
    getStoredIdsServerSnapshot,
  );

  return useMemo(() => parseStoredPulsePreview(snapshot), [snapshot]);
}

function useStoredNotificationPreference() {
  return useSyncExternalStore(
    subscribeToStoredIds,
    () => getStoredIdsSnapshot(notificationStorageKey),
    getStoredIdsServerSnapshot,
  );
}

function writeStoredPulsePreview(preview: PulsePreview) {
  try {
    window.localStorage.setItem(pulsePreviewStorageKey, JSON.stringify(preview));
    window.dispatchEvent(new Event(storageEventName));
  } catch {
    // Pulse previews are a lightweight engagement layer; card collection still works without them.
  }
}

function clearStoredPulsePreview() {
  try {
    window.localStorage.removeItem(pulsePreviewStorageKey);
    window.dispatchEvent(new Event(storageEventName));
  } catch {
    // Ignore storage failures; the timer state remains in memory for this session.
  }
}

function getPulsePreviewSecondsRemaining(preview: PulsePreview | null) {
  if (!preview) {
    return 0;
  }

  return Math.max(0, Math.ceil((preview.expiresAt - Date.now()) / 1000));
}

function createPulsePreview(cardId: string): PulsePreview {
  return {
    cardId,
    expiresAt: Date.now() + pulsePreviewDurationMs,
  };
}

function getCompletionPercent(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function getSupporterWallpaperHref(card: LegendCard) {
  return card.kind === "supporter-card" && typeof card.image === "string" && card.image.startsWith("/supporter-cards/")
    ? card.image
    : null;
}

function getSupporterWallpaperDownloadHref(card: LegendCard) {
  const href = getSupporterWallpaperHref(card);
  const fileName = href?.split("/").pop();

  return fileName ? `/api/supporter-cards/download/${encodeURIComponent(fileName)}` : null;
}

function matchesLegendCardSearch(card: LegendCard, normalizedCardSearch: string) {
  if (!normalizedCardSearch) {
    return true;
  }

  return [
    getEpisodeLabel(card),
    card.title,
    card.subtitle,
    card.teams,
    card.story,
    card.rarity,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedCardSearch);
}

function getWallpaperGalleryCards(cards: LegendCard[], unlockedIds: ReadonlySet<string>, normalizedCardSearch: string) {
  const galleryCardsByHref = new Map<string, LegendCard>();

  for (const card of cards) {
    const href = getSupporterWallpaperHref(card);

    if (!href || !matchesLegendCardSearch(card, normalizedCardSearch)) {
      continue;
    }

    const current = galleryCardsByHref.get(href);

    if (!current || (!unlockedIds.has(current.id) && unlockedIds.has(card.id))) {
      galleryCardsByHref.set(href, card);
    }
  }

  return [...galleryCardsByHref.values()];
}

function getWatchMinimumMs(card: LegendCard) {
  return card.kind === "did-you-know-short" ? didYouKnowWatchMinimumMs : storyWatchMinimumMs;
}

function getWatchSecondsLabel(seconds: number) {
  if (seconds <= 0) {
    return "now";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function createWatchProof(card: LegendCard, startedAt = Date.now()): WatchProof {
  return {
    cardId: card.id,
    youtube: card.youtube ?? "",
    startedAt,
    eligibleAt: startedAt + getWatchMinimumMs(card),
  };
}

function getWatchSecondsRemaining(proof: WatchProof | undefined, now: number) {
  return proof ? Math.max(0, Math.ceil((proof.eligibleAt - now) / 1000)) : 0;
}

function mergeAccountLegendState(state: AccountLegendState) {
  writeStoredIds(
    unlockedStorageKey,
    new Set([...readCurrentStoredIds(unlockedStorageKey), ...state.unlockedIds]),
  );
  writeStoredIds(
    watchedStorageKey,
    new Set([...readCurrentStoredIds(watchedStorageKey), ...state.watchedIds]),
  );
  writeStoredIds(
    listenedStorageKey,
    new Set([...readCurrentStoredIds(listenedStorageKey), ...state.listenedIds]),
  );
  writeStoredIds(
    pulseReadStorageKey,
    new Set([...readCurrentStoredIds(pulseReadStorageKey, validPulseIds), ...state.readPulseIds]),
  );
}

async function readAccountLegendState(token: string) {
  const response = await fetch("/api/legend-cards", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.error === "string" ? payload.error : "Sync failed.");
  }

  return accountLegendStateFromApiPayload(payload);
}

async function saveAccountLegendCardEvent(cardId: string, event: AccountLegendEvent, token: string) {
  const response = await fetch("/api/legend-cards", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardId, event }),
  });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.error === "string" ? payload.error : "Save failed.");
  }

  return accountLegendStateFromApiPayload(payload);
}

async function saveAccountUnlockedId(cardId: string, token: string) {
  return saveAccountLegendCardEvent(cardId, "unlocked", token);
}

export function LegendCardCollection() {
  const unlockedIds = useStoredIds(unlockedStorageKey);
  const watchedIds = useStoredIds(watchedStorageKey);
  const listenedIds = useStoredIds(listenedStorageKey);
  const readPulseIds = useStoredIds(pulseReadStorageKey, validPulseIds);
  const pulsePreview = useStoredPulsePreview();
  const watchProofs = useStoredWatchProofs();
  const notificationPreference = useStoredNotificationPreference();
  const [accountToken, setAccountToken] = useState<string | null>(null);
  const [accountSyncLabel, setAccountSyncLabel] = useState("Saved on this device");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [cardFilter, setCardFilter] = useState<LegendCardFilter>("all");
  const [cardSearch, setCardSearch] = useState("");
  const [collectionExpanded, setCollectionExpanded] = useState(false);
  const [completedQuestCardId, setCompletedQuestCardId] = useState<string | null>(null);
  const [previewSecondsRemaining, setPreviewSecondsRemaining] = useState(() =>
    getPulsePreviewSecondsRemaining(readStoredPulsePreview()),
  );
  const [watchTimerTick, setWatchTimerTick] = useState(() => Date.now());
  const [notificationStatusOverride, setNotificationStatusOverride] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "Each card has one unique unlock path. Listen to supporter stories, or open the matching YouTube video for episode cards.",
  );
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const storyAudioUrlRef = useRef<string | null>(null);
  const storyVoiceRequestIdRef = useRef(0);
  const notificationStatus =
    notificationStatusOverride ?? (notificationPreference === "on" ? "Card alerts on" : "Card alerts off");

  function stopBrowserStoryVoice() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function clearStoryAudio() {
    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      storyAudioRef.current.removeAttribute("src");
      storyAudioRef.current.load();
      storyAudioRef.current = null;
    }

    if (storyAudioUrlRef.current) {
      URL.revokeObjectURL(storyAudioUrlRef.current);
      storyAudioUrlRef.current = null;
    }
  }

  function stopStoryPlayback(statusMessage?: string) {
    storyVoiceRequestIdRef.current += 1;
    clearStoryAudio();
    stopBrowserStoryVoice();
    setSpeakingCardId(null);

    if (statusMessage) {
      setStatus(statusMessage);
    }
  }

  const syncAccountLegendEvent = useCallback((cardId: string, event: AccountLegendEvent) => {
    if (!accountToken) {
      return;
    }

    setAccountSyncLabel("Saving account");

    void saveAccountLegendCardEvent(cardId, event, accountToken)
      .then((state) => {
        mergeAccountLegendState(state);
        setAccountSyncLabel(state.progressSyncAvailable ? "Saved to account" : "Cards saved; progress local");
      })
      .catch(() => {
        setAccountSyncLabel("Device saved; account sync paused");
      });
  }, [accountToken]);

  const markCardWatchReady = useCallback((card: LegendCard, options: { showStatus?: boolean } = {}) => {
    if (!card.youtube) {
      return false;
    }

    const nextWatched = new Set(readCurrentStoredIds(watchedStorageKey));
    const wasAlreadyReady = nextWatched.has(card.id);

    if (!wasAlreadyReady) {
      nextWatched.add(card.id);
      writeStoredIds(watchedStorageKey, nextWatched);
      syncAccountLegendEvent(card.id, "youtube_opened");
    }

    const nextProofs = readCurrentStoredWatchProofs();
    if (nextProofs.delete(card.id)) {
      writeStoredWatchProofs(nextProofs);
    }

    if (options.showStatus !== false) {
      setStatus(`${card.title} is ready. Collect it to save the card to your account.`);
    }

    return true;
  }, [syncAccountLegendEvent]);

  const syncReadyWatchProofs = useCallback((showStatus = false) => {
    const now = Date.now();
    setWatchTimerTick(now);

    const proofs = readCurrentStoredWatchProofs();
    const currentWatchedIds = readCurrentStoredIds(watchedStorageKey);

    for (const proof of proofs.values()) {
      const card = legendCardById.get(proof.cardId);

      if (card && proof.eligibleAt <= now && !currentWatchedIds.has(card.id)) {
        markCardWatchReady(card, { showStatus });
      }
    }
  }, [markCardWatchReady]);

  useEffect(() => {
    return () => {
      storyVoiceRequestIdRef.current += 1;

      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
        storyAudioRef.current.removeAttribute("src");
        storyAudioRef.current.load();
        storyAudioRef.current = null;
      }

      if (storyAudioUrlRef.current) {
        URL.revokeObjectURL(storyAudioUrlRef.current);
        storyAudioUrlRef.current = null;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncSilently = () => syncReadyWatchProofs(false);
    const syncWithStatus = () => syncReadyWatchProofs(true);

    syncSilently();
    const interval = window.setInterval(syncSilently, 1000);
    window.addEventListener("focus", syncWithStatus);
    document.addEventListener("visibilitychange", syncWithStatus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", syncWithStatus);
      document.removeEventListener("visibilitychange", syncWithStatus);
    };
  }, [syncReadyWatchProofs]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    const loadAvailableVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadAvailableVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadAvailableVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadAvailableVoices);
    };
  }, []);

  useEffect(() => {
    if (!pulsePreview) {
      return undefined;
    }

    function syncPreviewTimer() {
      const nextSeconds = getPulsePreviewSecondsRemaining(pulsePreview);
      setPreviewSecondsRemaining(nextSeconds);

      if (nextSeconds <= 0) {
        clearStoredPulsePreview();
        setStatus("Pulse preview expired. Watch the YouTube episode to collect the card.");
      }
    }

    const timeout = window.setTimeout(syncPreviewTimer, 0);
    const interval = window.setInterval(syncPreviewTimer, 1000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [pulsePreview]);

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

        const remoteState = await readAccountLegendState(token);
        const localUnlockedIds = readCurrentStoredIds(unlockedStorageKey);
        const localWatchedIds = readCurrentStoredIds(watchedStorageKey);
        const localListenedIds = readCurrentStoredIds(listenedStorageKey);
        const localReadPulseIds = readCurrentStoredIds(pulseReadStorageKey, validPulseIds);
        const localOnlyUnlockedIds = [...localUnlockedIds].filter(
          (cardId) => !remoteState.unlockedIds.has(cardId) && unlockableCardIds.has(cardId),
        );
        const localOnlyWatchedIds = [...localWatchedIds].filter(
          (cardId) => !remoteState.watchedIds.has(cardId) && unlockableCardIds.has(cardId),
        );
        const localOnlyListenedIds = [...localListenedIds].filter(
          (cardId) => !remoteState.listenedIds.has(cardId) && validCardIds.has(cardId),
        );
        const localOnlyReadPulseItems = [...localReadPulseIds]
          .filter((pulseId) => !remoteState.readPulseIds.has(pulseId))
          .map((pulseId) => pulseItemById.get(pulseId))
          .filter((item): item is LegendPulseItem => Boolean(item));

        for (const item of localOnlyReadPulseItems) {
          await saveAccountLegendCardEvent(item.cardId, "pulse_read", token);
        }

        for (const cardId of localOnlyListenedIds) {
          await saveAccountLegendCardEvent(cardId, "listened", token);
        }

        for (const cardId of localOnlyWatchedIds) {
          await saveAccountLegendCardEvent(cardId, "youtube_opened", token);
        }

        for (const cardId of localOnlyUnlockedIds) {
          await saveAccountUnlockedId(cardId, token);
        }

        if (cancelled) {
          return;
        }

        mergeAccountLegendState({
          unlockedIds: new Set([...remoteState.unlockedIds, ...localUnlockedIds]),
          watchedIds: new Set([...remoteState.watchedIds, ...localWatchedIds]),
          listenedIds: new Set([...remoteState.listenedIds, ...localListenedIds]),
          readPulseIds: new Set([...remoteState.readPulseIds, ...localReadPulseIds]),
          progressSyncAvailable: remoteState.progressSyncAvailable,
        });
        setAccountSyncLabel(remoteState.progressSyncAvailable ? "Saved to account" : "Cards saved; progress local");

        const syncedUnlockedCount = new Set([...remoteState.unlockedIds, ...localUnlockedIds]).size;
        if (syncedUnlockedCount > 0) {
          setStatus(`${syncedUnlockedCount} Legend cards synced to your account.`);
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
  const supporterCount = useMemo(() => LEGEND_CARDS.filter((card) => card.kind === "supporter-card").length, []);
  const wallpaperCount = useMemo(
    () => new Set(LEGEND_CARDS.map(getSupporterWallpaperHref).filter((href): href is string => Boolean(href))).size,
    [],
  );
  const didYouKnowCount = useMemo(() => LEGEND_CARDS.filter((card) => card.kind === "did-you-know-short").length, []);
  const bonusCount = useMemo(() => LEGEND_CARDS.filter((card) => card.kind === "legend-bonus").length, []);
  const newestEpisodeCard = useMemo(
    () => LEGEND_CARDS.find((card) => card.kind === "episode-special" && card.youtube) ?? LEGEND_CARDS[0],
    [],
  );
  const readyCount = LEGEND_CARDS.filter((card) =>
    canCollectLegendCard(card, unlockedIds, listenedIds, watchedIds),
  ).length;
  const listenedCount = LEGEND_CARDS.filter((card) => listenedIds.has(card.id)).length;
  const watchedCount = LEGEND_CARDS.filter((card) => Boolean(card.youtube && watchedIds.has(card.id))).length;
  const needStoryCount = LEGEND_CARDS.filter((card) => needsStoryStep(card, unlockedIds, listenedIds)).length;
  const needYouTubeCount = LEGEND_CARDS.filter((card) =>
    needsYoutubeStep(card, unlockedIds, listenedIds, watchedIds),
  ).length;
  const pulseReadCount = legendPulseItems.filter((item) => readPulseIds.has(item.id)).length;
  const lockedCount = LEGEND_CARDS.length - collectedCount;
  const unlockedWallpaperHrefs = useMemo(() => {
    const wallpaperHrefs = new Set<string>();

    for (const card of LEGEND_CARDS) {
      if (!unlockedIds.has(card.id)) {
        continue;
      }

      const href = getSupporterWallpaperHref(card);

      if (href) {
        wallpaperHrefs.add(href);
      }
    }

    return wallpaperHrefs;
  }, [unlockedIds]);
  const unlockedWallpaperCount = unlockedWallpaperHrefs.size;
  const remainingWallpaperCount = Math.max(wallpaperCount - unlockedWallpaperCount, 0);
  const progressPercent = LEGEND_CARDS.length
    ? getCompletionPercent(collectedCount, LEGEND_CARDS.length)
    : 0;
  const readyFocusCard = LEGEND_CARDS.find((card) =>
    canCollectLegendCard(card, unlockedIds, listenedIds, watchedIds),
  );
  const storyFocusCard = LEGEND_CARDS.find((card) => needsStoryStep(card, unlockedIds, listenedIds));
  const youtubeFocusCard = LEGEND_CARDS.find((card) =>
    needsYoutubeStep(card, unlockedIds, listenedIds, watchedIds),
  );
  const focusCard =
    readyFocusCard ??
    youtubeFocusCard ??
    storyFocusCard ??
    LEGEND_CARDS.find((card) => Boolean(card.youtube && !unlockedIds.has(card.id))) ??
    newestEpisodeCard;
  const focusWatchProof = focusCard ? watchProofs.get(focusCard.id) : undefined;
  const focusWatchSecondsRemaining = getWatchSecondsRemaining(focusWatchProof, watchTimerTick);
  const focusCardAction = focusCard
    ? unlockedIds.has(focusCard.id)
      ? {
          step: "collected",
          eyebrow: "Collected card",
          badge: "Collected",
          detail: "This card is saved. You can replay the story or find another card in the album.",
          ctaLabel: speakingCardId === focusCard.id ? "Stop story" : "Listen story",
        }
      : Boolean(focusCard.youtube && focusWatchSecondsRemaining > 0)
        ? {
            step: "watch",
            eyebrow: "YouTube in progress",
            badge: `${getWatchSecondsLabel(focusWatchSecondsRemaining)} left`,
            detail: "Keep the YouTube story open, then return here to collect the card.",
            ctaLabel: "Open again",
          }
      : canCollectLegendCard(focusCard, unlockedIds, listenedIds, watchedIds)
        ? {
            step: "collect",
            eyebrow: "Ready to collect",
            badge: "Ready now",
            detail: focusCard.youtube
              ? "You opened the matching YouTube episode. Save the card to your album."
              : "You heard the card story. Save this unique supporter card to your album.",
            ctaLabel: "Collect card",
          }
        : !listenedIds.has(focusCard.id)
          ? {
              step: "listen",
              eyebrow: "Next best action",
              badge: "Listen next",
              detail: "Start with the in-app voice story, then open YouTube to unlock the card.",
              ctaLabel: speakingCardId === focusCard.id ? "Stop story" : "Listen story",
            }
          : focusCard.youtube
            ? {
                step: "watch",
                eyebrow: "YouTube next",
                badge: "Open episode",
                detail: "Story heard. Open the matching YouTube episode, then return to collect.",
                ctaLabel: watchedIds.has(focusCard.id) ? "Open again" : "Open YouTube",
              }
            : {
                step: "listen",
                eyebrow: "Story card",
                badge: "Listen next",
                detail: "This card belongs to its own tab. Hear the story, then collect it.",
                ctaLabel: speakingCardId === focusCard.id ? "Stop story" : "Listen story",
              }
    : null;
  const normalizedCardSearch = cardSearch.trim().toLowerCase();
  const filteredCards = useMemo(() => {
    if (cardFilter === "wallpapers") {
      return getWallpaperGalleryCards(LEGEND_CARDS, unlockedIds, normalizedCardSearch);
    }

    return LEGEND_CARDS.filter((card) => {
      if (cardFilter === "stories") {
        if (card.kind !== "episode-special") {
          return false;
        }
      }
      if (cardFilter === "bonus" && card.kind !== "legend-bonus") {
        return false;
      }
      if (cardFilter === "supporters" && card.kind !== "supporter-card") {
        return false;
      }
      if (cardFilter === "legends" && card.kind !== "did-you-know-short") {
        return false;
      }
      if (cardFilter === "need-story" && !needsStoryStep(card, unlockedIds, listenedIds)) {
        return false;
      }
      if (cardFilter === "need-youtube" && !needsYoutubeStep(card, unlockedIds, listenedIds, watchedIds)) {
        return false;
      }
      if (cardFilter === "ready") {
        if (!canCollectLegendCard(card, unlockedIds, listenedIds, watchedIds)) {
          return false;
        }
      }
      if (cardFilter === "collected" && !unlockedIds.has(card.id)) {
        return false;
      }
      if (cardFilter === "locked" && unlockedIds.has(card.id)) {
        return false;
      }

      return matchesLegendCardSearch(card, normalizedCardSearch);
    });
  }, [cardFilter, listenedIds, normalizedCardSearch, unlockedIds, watchedIds]);
  const visibleCards = collectionExpanded
    ? filteredCards
    : filteredCards.slice(0, compactLegendCardCount);
  const selectedFilterLabel = normalizedCardSearch
    ? "matching cards"
    : legendCardFilterLabels[cardFilter].toLowerCase();
  const compactCardsText =
    filteredCards.length <= compactLegendCardCount
      ? `All ${filteredCards.length} ${selectedFilterLabel}`
      : `First ${Math.min(compactLegendCardCount, filteredCards.length)} of ${filteredCards.length} ${selectedFilterLabel}`;
  const expandedCardsText = `All ${filteredCards.length} ${selectedFilterLabel}`;
  const filterCounts: Record<LegendCardFilter, number> = {
    all: LEGEND_CARDS.length,
    stories: storyCount,
    wallpapers: wallpaperCount,
    supporters: supporterCount,
    legends: didYouKnowCount,
    bonus: bonusCount,
    "need-story": needStoryCount,
    "need-youtube": needYouTubeCount,
    ready: readyCount,
    collected: collectedCount,
    locked: lockedCount,
  };
  const albumEmptyState = normalizedCardSearch
    ? {
        title: "No card matches that search",
        detail: "Clear the search to return to the current album step.",
        actionLabel: "Clear search",
      }
    : cardFilter === "need-youtube"
      ? {
          title: "Listen to a story first",
          detail:
            needStoryCount > 0
              ? "This view fills after a card story is heard. Start with the cards that still need story playback."
              : "No heard stories are waiting for YouTube. Continue from a ready or collected card.",
          actionLabel: needStoryCount > 0 ? "Show story cards" : readyCount > 0 ? "Show ready cards" : "Reset album",
        }
      : cardFilter === "ready"
        ? {
            title: "No cards ready to collect",
            detail:
              needYouTubeCount > 0
                ? "Open the YouTube episode for a heard story, then return here to collect."
                : needStoryCount > 0
                  ? "Listen to a card story. Video cards continue to YouTube; supporter cards become ready after the story."
                  : "No collection steps are waiting. Check your collected cards or reset the album.",
            actionLabel:
              needYouTubeCount > 0 ? "Show YouTube next" : needStoryCount > 0 ? "Show story cards" : "Show collected",
          }
        : cardFilter === "need-story"
          ? {
              title: "All live stories are heard",
              detail:
                needYouTubeCount > 0
                  ? "Move to YouTube next and open the matching episodes."
                  : readyCount > 0
                    ? "Collect the cards that are already ready."
                    : "Check collected cards or reset the album.",
              actionLabel:
                needYouTubeCount > 0 ? "Show YouTube next" : readyCount > 0 ? "Show ready cards" : "Show collected",
            }
          : {
              title: "No cards in this view yet",
              detail: "Reset the album view and continue from the next best card.",
              actionLabel: "Reset album",
            };
  const nextPulseItem = legendPulseItems.find((item) => !readPulseIds.has(item.id)) ?? legendPulseItems[0];
  const activePreviewCard =
    pulsePreview && previewSecondsRemaining > 0
      ? legendCardById.get(pulsePreview.cardId) ?? null
      : null;
  const nextPulseCard = nextPulseItem ? legendCardById.get(nextPulseItem.cardId) ?? null : null;
  const pulseDisplayCard = activePreviewCard ?? nextPulseCard ?? focusCard;
  const completedQuestCard =
    completedQuestCardId && unlockedIds.has(completedQuestCardId)
      ? legendCardById.get(completedQuestCardId) ?? null
      : null;
  const completedQuestItem = completedQuestCard
    ? legendPulseItems.find((item) => item.cardId === completedQuestCard.id) ?? null
    : null;
  const collectorQuestItem =
    completedQuestItem ??
    legendPulseItems.find((item) => {
      const card = legendCardById.get(item.cardId);
      return Boolean(card && !unlockedIds.has(card.id));
    }) ??
    legendPulseItems[0] ??
    null;
  const collectorQuestCard = completedQuestCard ??
    (collectorQuestItem ? legendCardById.get(collectorQuestItem.cardId) ?? focusCard : focusCard);
  const collectorQuestSteps = collectorQuestCard
    ? [
        {
          id: "read",
          label: "Read Pulse",
          detail: "Open the 60-second card preview.",
          complete: collectorQuestItem ? readPulseIds.has(collectorQuestItem.id) : false,
          actionLabel: collectorQuestItem && readPulseIds.has(collectorQuestItem.id) ? "Preview again" : "Read Pulse",
        },
        {
          id: "listen",
          label: "Listen story",
          detail: "Play the card story inside the app.",
          complete: listenedIds.has(collectorQuestCard.id),
          actionLabel: speakingCardId === collectorQuestCard.id ? "Stop story" : "Listen story",
        },
        {
          id: "watch",
          label: "Open YouTube",
          detail: "Watch the matching episode on the channel.",
          complete: watchedIds.has(collectorQuestCard.id),
          actionLabel: watchedIds.has(collectorQuestCard.id) ? "Open again" : "Open YouTube",
        },
        {
          id: "collect",
          label: "Collect card",
          detail: "Return here after YouTube and save it.",
          complete: unlockedIds.has(collectorQuestCard.id),
          actionLabel: unlockedIds.has(collectorQuestCard.id) ? "Collected" : "Collect card",
        },
      ]
    : [];
  const collectorQuestCompletedCount = collectorQuestSteps.filter((step) => step.complete).length;
  const collectorQuestProgressPercent = collectorQuestSteps.length
    ? Math.round((collectorQuestCompletedCount / collectorQuestSteps.length) * 100)
    : 0;
  const hasNextCollectorQuest = collectorQuestCard
    ? legendPulseItems.some((item) => {
        const card = legendCardById.get(item.cardId);
        return Boolean(card && card.id !== collectorQuestCard.id && !unlockedIds.has(card.id));
      })
    : false;
  const collectorRoadmapItems = [
    {
      id: "pulse",
      label: "Pulse",
      value: pulseReadCount,
      total: legendPulseItems.length,
      detail: "story previews read",
      percent: getCompletionPercent(pulseReadCount, legendPulseItems.length),
    },
    {
      id: "listen",
      label: "Listen",
      value: listenedCount,
      total: LEGEND_CARDS.length,
      detail: "card stories heard",
      percent: getCompletionPercent(listenedCount, LEGEND_CARDS.length),
    },
    {
      id: "youtube",
      label: "YouTube",
      value: watchedCount,
      total: liveCount,
      detail: "episodes opened",
      percent: getCompletionPercent(watchedCount, liveCount),
    },
    {
      id: "collect",
      label: "Collect",
      value: collectedCount,
      total: LEGEND_CARDS.length,
      detail: "cards saved",
      percent: progressPercent,
    },
  ];
  const roadmapActionLabel =
    readyCount > 0 ? "Collect ready cards" : needYouTubeCount > 0 ? "Open YouTube next" : "Continue quest";
  const roadmapActionDetail =
    readyCount > 0
      ? `${readyCount} card${readyCount === 1 ? "" : "s"} waiting after YouTube`
      : needYouTubeCount > 0
        ? `${needYouTubeCount} heard card${needYouTubeCount === 1 ? "" : "s"} waiting for YouTube`
      : collectorQuestCard
        ? `Next card: ${collectorQuestCard.title}`
        : "Open the album";

  function startCardWatchProof(card: LegendCard) {
    if (!card.youtube) {
      return null;
    }

    const nextOpened = new Set(readCurrentStoredIds(openedStorageKey));
    nextOpened.add(card.id);
    writeStoredIds(openedStorageKey, nextOpened);

    const now = Date.now();
    const proofs = readCurrentStoredWatchProofs();
    const currentProof = proofs.get(card.id);
    const proof = currentProof && currentProof.eligibleAt > now ? currentProof : createWatchProof(card, now);
    proofs.set(card.id, proof);
    writeStoredWatchProofs(proofs);
    setWatchTimerTick(now);

    return proof;
  }

  function markCardListened(card: LegendCard) {
    const nextListened = new Set(readCurrentStoredIds(listenedStorageKey));
    nextListened.add(card.id);
    writeStoredIds(listenedStorageKey, nextListened);
    syncAccountLegendEvent(card.id, "listened");
  }

  function startWatch(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    const currentWatchedIds = readCurrentStoredIds(watchedStorageKey);
    const proof = currentWatchedIds.has(card.id) ? null : startCardWatchProof(card);
    const remainingSeconds = getWatchSecondsRemaining(proof ?? undefined, Date.now());
    const opened = window.open(card.youtube, "_blank", "noopener,noreferrer");

    if (opened) {
      opened.opener = null;
      setStatus(
        remainingSeconds > 0
          ? `Opened ${card.teams} on YouTube. Return in ${getWatchSecondsLabel(remainingSeconds)} to collect ${card.title}.`
          : `${card.title} is ready to collect.`,
      );
    } else {
      setStatus(
        remainingSeconds > 0
          ? `Popup blocked. Open YouTube manually and return in ${getWatchSecondsLabel(remainingSeconds)} to collect ${card.title}.`
          : `${card.title} is ready to collect.`,
      );
    }
  }

  async function unlockCard(card: LegendCard) {
    if (!card.youtube) {
      setStatus(`${card.title} unlocks when the episode is live on YouTube.`);
      return;
    }

    if (!watchedIds.has(card.id)) {
      const proof = readCurrentStoredWatchProofs().get(card.id);
      const remainingSeconds = getWatchSecondsRemaining(proof, Date.now());

      if (!proof) {
        setStatus(`Open the ${card.teams} YouTube story first.`);
        return;
      }

      if (remainingSeconds > 0) {
        setStatus(`Keep the YouTube story open. ${getWatchSecondsLabel(remainingSeconds)} left before ${card.title} is ready.`);
        return;
      }

      markCardWatchReady(card, { showStatus: false });
    }

    if (!readCurrentStoredIds(watchedStorageKey).has(card.id)) {
      setStatus(`Open the ${card.teams} YouTube story first.`);
      return;
    }

    const next = new Set(unlockedIds);
    next.add(card.id);
    writeStoredIds(unlockedStorageKey, next);
    setCompletedQuestCardId(card.id);

    if (!accountToken) {
      setStatus(`${card.title} collected on this device.`);
      return;
    }

    setAccountSyncLabel("Saving account");

    try {
      const accountState = await saveAccountUnlockedId(card.id, accountToken);
      mergeAccountLegendState({
        ...accountState,
        unlockedIds: new Set([...next, ...accountState.unlockedIds]),
      });
      setAccountSyncLabel(accountState.progressSyncAvailable ? "Saved to account" : "Cards saved; progress local");
      setStatus(`${card.title} collected and saved to your account.`);
    } catch {
      setAccountSyncLabel("Device saved; account sync paused");
      setStatus(`${card.title} collected on this device. Account sync can retry after sign-in.`);
    }
  }

  function toggleVoice() {
    const next = !voiceEnabled;

    if (!next) {
      stopStoryPlayback();
    }

    setVoiceEnabled(next);
    setStatus(next ? "Voice enabled. Stories play with ElevenLabs Brian." : "Voice disabled.");
  }

  function playBrowserBrianFallback(card: LegendCard, requestId: number) {
    if (!("speechSynthesis" in window)) {
      return false;
    }

    const storyVoice = selectBrowserBrianStoryVoice(window.speechSynthesis.getVoices());
    if (!storyVoice) {
      return false;
    }

    stopBrowserStoryVoice();
    const storyVoiceDisplayName = getStoryVoiceDisplayName(storyVoice);
    const utterance = new SpeechSynthesisUtterance(createLegendCardVoiceText(card));
    utterance.lang = storyVoice.lang ?? storyVoiceLanguage;
    utterance.voice = storyVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (storyVoiceRequestIdRef.current === requestId) {
        setSpeakingCardId(null);
      }
    };
    utterance.onerror = () => {
      if (storyVoiceRequestIdRef.current === requestId) {
        setSpeakingCardId(null);
        setStatus("Brian voice playback stopped.");
      }
    };

    setSpeakingCardId(card.id);
    setStatus(
      `${card.title} story is playing with browser ${storyVoiceDisplayName}. Set ElevenLabs env vars for the studio Brian voice.`,
    );
    window.speechSynthesis.speak(utterance);
    return true;
  }

  async function speakStory(card: LegendCard) {
    if (speakingCardId === card.id) {
      stopStoryPlayback("Story stopped.");
      return;
    }

    stopStoryPlayback();

    if (!voiceEnabled) {
      setVoiceEnabled(true);
    }

    const requestId = storyVoiceRequestIdRef.current + 1;
    storyVoiceRequestIdRef.current = requestId;
    setSpeakingCardId(card.id);
    setStatus(`${card.title} story is preparing with ElevenLabs Brian.`);

    try {
      const response = await fetch("/api/legend-cards/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: card.id }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => ({}));
        throw new Error(isRecord(payload) && typeof payload.error === "string" ? payload.error : "Brian voice failed.");
      }

      const audioBlob = await response.blob();
      if (storyVoiceRequestIdRef.current !== requestId) {
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      storyAudioUrlRef.current = audioUrl;
      storyAudioRef.current = audio;

      audio.onended = () => {
        if (storyVoiceRequestIdRef.current === requestId) {
          setSpeakingCardId(null);
        }
      };
      audio.onerror = () => {
        if (storyVoiceRequestIdRef.current === requestId) {
          setSpeakingCardId(null);
          setStatus("ElevenLabs Brian playback stopped.");
        }
      };

      await audio.play();
      markCardListened(card);
      setStatus(`${card.title} story is playing with ElevenLabs Brian. Open the YouTube episode to collect the card.`);
    } catch (error) {
      if (storyVoiceRequestIdRef.current !== requestId) {
        return;
      }

      clearStoryAudio();
      if (allowBrowserStoryVoiceFallback && playBrowserBrianFallback(card, requestId)) {
        markCardListened(card);
        return;
      }

      setSpeakingCardId(null);
      setStatus(
        error instanceof Error
          ? `${error.message} Add ELEVENLABS_API_KEY and ELEVENLABS_BRIAN_VOICE_ID on the server to use Brian on every card.`
          : "Could not play ElevenLabs Brian. Add ELEVENLABS_API_KEY and ELEVENLABS_BRIAN_VOICE_ID on the server.",
      );
    }
  }

  function chooseCardFilter(nextFilter: LegendCardFilter) {
    setCardFilter(nextFilter);
    setCollectionExpanded(false);
  }

  function updateCardSearch(nextSearch: string) {
    setCardSearch(nextSearch);
    setCollectionExpanded(false);
  }

  function resetAlbumFilters() {
    setCardFilter("all");
    setCardSearch("");
    setCollectionExpanded(false);
    setStatus("Album filters reset. Continue the card loop from any story.");
  }

  function runAlbumEmptyAction() {
    if (normalizedCardSearch) {
      setCardSearch("");
      setCollectionExpanded(false);
      setStatus("Legend card search cleared. Continue from the current album step.");
      return;
    }

    if (cardFilter === "need-youtube") {
      chooseCardFilter(needStoryCount > 0 ? "need-story" : readyCount > 0 ? "ready" : "all");
      setStatus(
        needStoryCount > 0
          ? "Pick a story card to hear first. YouTube next fills after the story plays."
          : "No YouTube-next cards are waiting. Continue from the available album cards.",
      );
      return;
    }

    if (cardFilter === "ready") {
      chooseCardFilter(needYouTubeCount > 0 ? "need-youtube" : needStoryCount > 0 ? "need-story" : "collected");
      setStatus(
        needYouTubeCount > 0
          ? "Open YouTube for a heard story, then return to collect."
          : needStoryCount > 0
            ? "Start with a story card, then open YouTube to make it collectible."
            : "No ready cards are waiting. Showing collected cards.",
      );
      return;
    }

    if (cardFilter === "need-story") {
      chooseCardFilter(needYouTubeCount > 0 ? "need-youtube" : readyCount > 0 ? "ready" : "collected");
      setStatus(
        needYouTubeCount > 0
          ? "Story heard. Open the matching YouTube episode next."
          : readyCount > 0
            ? "No more story cards in this view. Collect the ready cards next."
            : "No more story cards in this view. Showing collected cards.",
      );
      return;
    }

    resetAlbumFilters();
  }

  function runFocusCardAction() {
    if (!focusCard || !focusCardAction || focusCardAction.step === "locked") {
      return;
    }

    if (focusCardAction.step === "collect") {
      void unlockCard(focusCard);
      return;
    }

    if (focusCardAction.step === "watch") {
      startWatch(focusCard);
      return;
    }

    speakStory(focusCard);
  }

  function showFocusCardInAlbum(card: LegendCard) {
    setCardFilter("all");
    setCardSearch(card.title);
    setCollectionExpanded(false);
    setStatus(`${card.title} is selected in the album.`);
    window.setTimeout(() => scrollToLegendSection("legend-card-grid"), 0);
  }

  function scrollToLegendSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function continueCollectorPath() {
    if (readyCount > 0) {
      setCardSearch("");
      chooseCardFilter("ready");
      scrollToLegendSection("legend-card-grid");
      return;
    }

    if (needYouTubeCount > 0) {
      setCardSearch("");
      chooseCardFilter("need-youtube");
      setStatus("Story heard. Open the matching YouTube episode, then return to collect.");
      scrollToLegendSection("legend-card-grid");
      return;
    }

    scrollToLegendSection("collector-quest");
  }

  function browseWallpaperCards() {
    setCardSearch("");
    chooseCardFilter("wallpapers");
    setCollectionExpanded(true);
    setStatus("Showing one HD supporter wallpaper per nation.");
    window.setTimeout(() => scrollToLegendSection("legend-card-grid"), 0);
  }

  function browseCollectionFilter(nextFilter: LegendCardFilter, nextStatus: string) {
    setCardSearch("");
    chooseCardFilter(nextFilter);
    setStatus(nextStatus);
    window.setTimeout(() => scrollToLegendSection("legend-card-grid"), 0);
  }

  function readPulse(item: LegendPulseItem) {
    const card = legendCardById.get(item.cardId);
    if (!card) {
      return;
    }

    setCompletedQuestCardId((cardId) => (cardId === card.id ? cardId : null));
    const nextReadIds = new Set(readCurrentStoredIds(pulseReadStorageKey, validPulseIds));
    nextReadIds.add(item.id);
    writeStoredIds(pulseReadStorageKey, nextReadIds);
    syncAccountLegendEvent(card.id, "pulse_read");

    const nextPreview = createPulsePreview(card.id);
    writeStoredPulsePreview(nextPreview);
    setPreviewSecondsRemaining(pulsePreviewDurationMs / 1000);
    setCardFilter("all");
    setCardSearch("");
    setCollectionExpanded(false);
    setStatus(
      `${card.title} preview unlocked for 60 seconds. Watch the YouTube episode to collect it permanently.`,
    );
  }

  async function enableCardNotifications() {
    const notificationApi = typeof window === "undefined" ? undefined : window.Notification;

    if (!notificationApi) {
      try {
        window.localStorage.setItem(notificationStorageKey, "on");
        window.dispatchEvent(new Event(storageEventName));
      } catch {
        // Preference text can still update for this session.
      }
      setNotificationStatusOverride("In-app alerts on");
      setStatus("Browser notifications are unavailable here; in-app Pulse alerts are on.");
      return;
    }

    if (notificationApi.permission === "denied") {
      setNotificationStatusOverride("Alerts blocked");
      setStatus("Browser notifications are blocked. You can still use the Pulse feed in the app.");
      return;
    }

    const permission =
      notificationApi.permission === "granted"
        ? "granted"
        : await notificationApi.requestPermission();

    if (permission === "granted") {
      try {
        window.localStorage.setItem(notificationStorageKey, "on");
        window.dispatchEvent(new Event(storageEventName));
      } catch {
        // A granted browser permission is still useful without persisted local state.
      }
      setNotificationStatusOverride("Card alerts on");
      setStatus("Card alerts enabled. New Pulse reads can open a 60-second card preview.");
      return;
    }

    setNotificationStatusOverride("Card alerts off");
    setStatus("Notifications stayed off. You can still read Pulse items anytime.");
  }

  return (
    <section id="legend-cards" className="legend-collection" aria-labelledby="legend-collection-title">
      <div className="legend-collection__hero">
        <div>
          <p className="wc-card-eyebrow">WorldCup26 Legends</p>
          <h1 id="legend-collection-title">Legend Card Collection</h1>
          <p>
            Collect one unique card per series video, supporter nation, bonus legend, and Did You Know short. Video
            cards use the matching YouTube story; supporter cards unlock from their own in-app Brian story.
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

      <nav className="legend-section-menu" aria-label="Legend collection shortcuts">
        <button type="button" className="legend-section-menu__item is-primary" onClick={continueCollectorPath}>
          <Sparkles size={17} aria-hidden="true" />
          <span>
            <strong>Next step</strong>
            <small>{roadmapActionLabel}</small>
          </span>
          <em>{collectorQuestProgressPercent}%</em>
        </button>
        <button
          type="button"
          className="legend-section-menu__item"
          onClick={() => browseCollectionFilter("legends", "Showing the 4 Did You Know shorts cards.")}
        >
          <Newspaper size={17} aria-hidden="true" />
          <span>
            <strong>Legends</strong>
            <small>Did You Know shorts</small>
          </span>
          <em>{didYouKnowCount}</em>
        </button>
        <button
          type="button"
          className="legend-section-menu__item"
          onClick={() => browseCollectionFilter("stories", "Showing the YouTube story series cards.")}
        >
          <ExternalLink size={17} aria-hidden="true" />
          <span>
            <strong>Series</strong>
            <small>Episode cards</small>
          </span>
          <em>{storyCount}</em>
        </button>
        <button type="button" className="legend-section-menu__item" onClick={browseWallpaperCards}>
          <Smartphone size={17} aria-hidden="true" />
          <span>
            <strong>Wallpapers</strong>
            <small>Phone portraits</small>
          </span>
          <em>{wallpaperCount}</em>
        </button>
        <button
          type="button"
          className="legend-section-menu__item"
          onClick={() => browseCollectionFilter("ready", "Showing cards ready to collect.")}
        >
          <Check size={17} aria-hidden="true" />
          <span>
            <strong>Ready</strong>
            <small>Collect now</small>
          </span>
          <em>{readyCount}</em>
        </button>
        <button
          type="button"
          className="legend-section-menu__item"
          onClick={() => browseCollectionFilter("need-youtube", "Showing cards waiting for YouTube.")}
        >
          <Search size={17} aria-hidden="true" />
          <span>
            <strong>YouTube next</strong>
            <small>Open episode</small>
          </span>
          <em>{needYouTubeCount}</em>
        </button>
      </nav>

      {collectorQuestCard ? (
        <section id="collector-quest" className="legend-quest" aria-labelledby="collector-quest-title">
          <div className="legend-quest__header">
            <div>
              <p className="wc-card-eyebrow">Today&apos;s Collector Quest</p>
              <h2 id="collector-quest-title">Finish the card loop</h2>
              <p>
                Read the Pulse, listen to the story, open the YouTube episode, then collect the card.
              </p>
            </div>
            <div className="legend-quest__progress" aria-label={`${collectorQuestProgressPercent}% complete`}>
              <strong>{collectorQuestCompletedCount} / {collectorQuestSteps.length}</strong>
              <span>{collectorQuestProgressPercent}% complete</span>
              {collectorQuestCompletedCount === collectorQuestSteps.length && hasNextCollectorQuest ? (
                <button type="button" className="legend-quest__next" onClick={() => setCompletedQuestCardId(null)}>
                  Next quest
                </button>
              ) : null}
            </div>
          </div>

          <div className="legend-quest__bar" aria-hidden="true">
            <span style={{ width: `${collectorQuestProgressPercent}%` }} />
          </div>

          <div className="legend-quest__grid">
            <article className="legend-quest__target">
              <div className="legend-quest__image">
                <Image
                  src={collectorQuestCard.image}
                  alt={`${collectorQuestCard.title} collector quest card`}
                  fill
                  loading="eager"
                  sizes="(max-width: 760px) 92vw, 260px"
                />
              </div>
              <div className="legend-quest__copy">
                <span>{getEpisodeLabel(collectorQuestCard)}</span>
                <h3>{collectorQuestCard.title}</h3>
                <p>{collectorQuestCard.teams}</p>
              </div>
            </article>

            <div className="legend-quest__steps" aria-label="Collector quest steps">
              {collectorQuestSteps.map((step) => {
                const stepDisabled =
                  step.id === "read"
                    ? !collectorQuestItem
                    : step.id === "collect"
                      ? unlockedIds.has(collectorQuestCard.id) || !watchedIds.has(collectorQuestCard.id)
                      : false;

                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`legend-quest-step ${step.complete ? "is-complete" : ""}`}
                    disabled={stepDisabled}
                    onClick={() => {
                      if (step.id === "read" && collectorQuestItem) {
                        readPulse(collectorQuestItem);
                      } else if (step.id === "listen") {
                        speakStory(collectorQuestCard);
                      } else if (step.id === "watch") {
                        startWatch(collectorQuestCard);
                      } else if (step.id === "collect") {
                        void unlockCard(collectorQuestCard);
                      }
                    }}
                  >
                    <span className="legend-quest-step__mark" aria-hidden="true">
                      {step.complete ? <Check size={16} /> : <Sparkles size={16} />}
                    </span>
                    <span className="legend-quest-step__copy">
                      <strong>{step.label}</strong>
                      <small>{step.detail}</small>
                    </span>
                    <span className="legend-quest-step__action">{step.actionLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="legend-roadmap" aria-labelledby="legend-roadmap-title">
        <div className="legend-roadmap__header">
          <div>
            <p className="wc-card-eyebrow">Collector path</p>
            <h2 id="legend-roadmap-title">Your album loop</h2>
            <p>{roadmapActionDetail}</p>
          </div>
          <button type="button" className="legend-roadmap__action" onClick={continueCollectorPath}>
            {roadmapActionLabel}
          </button>
        </div>

        <div className="legend-roadmap__track" aria-label="Legend album collection path">
          {collectorRoadmapItems.map((item) => (
            <article key={item.id} className="legend-roadmap-card">
              <div className="legend-roadmap-card__top">
                <span>{item.label}</span>
                <strong>
                  {item.value} / {item.total}
                </strong>
              </div>
              <div className="legend-roadmap-card__bar" aria-hidden="true">
                <span style={{ width: `${item.percent}%` }} />
              </div>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="legend-wallpapers" className="legend-wallpaper" aria-labelledby="legend-wallpaper-title">
        <div className="legend-wallpaper__icon" aria-hidden="true">
          <Smartphone size={24} />
        </div>
        <div className="legend-wallpaper__copy">
          <p className="wc-card-eyebrow">Supporter wallpapers</p>
          <h2 id="legend-wallpaper-title">Phone portrait cards</h2>
          <p>
            {wallpaperCount} nation cards are exported as 1080 x 1920 portraits. Collect the supporter card, then save
            the HD version to your phone.
          </p>
        </div>
        <dl className="legend-wallpaper__stats" aria-label="Supporter wallpaper progress">
          <div>
            <dt>Unlocked</dt>
            <dd>{unlockedWallpaperCount}</dd>
          </div>
          <div>
            <dt>Left</dt>
            <dd>{remainingWallpaperCount}</dd>
          </div>
        </dl>
        <button type="button" className="legend-wallpaper__action" onClick={browseWallpaperCards}>
          <Download size={16} />
          Browse wallpapers
        </button>
      </section>

      {pulseDisplayCard ? (
        <section id="news" className="legend-pulse" aria-labelledby="legend-pulse-title">
          <div className="legend-pulse__header">
            <div>
              <p className="wc-card-eyebrow">News / Pulse</p>
              <h2 id="legend-pulse-title">Read the Pulse, preview a card</h2>
              <p>
                Short daily story drops open a temporary 60-second card preview. Permanent
                collection still requires the matching YouTube episode.
              </p>
            </div>
            <div className="legend-pulse__actions">
              {!accountToken ? (
                <Link
                  className="legend-pulse__signin"
                  href={{ pathname: "/login", query: { returnTo: "/predictions#news" } }}
                >
                  <LogIn size={16} />
                  Sign in for saved cards
                </Link>
              ) : null}
              <button
                type="button"
                className={`legend-notification-button ${
                  notificationStatus === "Card alerts on" || notificationStatus === "In-app alerts on"
                    ? "is-on"
                    : ""
                }`}
                onClick={enableCardNotifications}
              >
                <Bell size={16} />
                {notificationStatus}
              </button>
            </div>
          </div>

          <div className="legend-pulse__grid">
            <article className={`legend-pulse__preview ${activePreviewCard ? "is-open" : ""}`}>
              <div className="legend-pulse__preview-image">
                <Image
                  src={pulseDisplayCard.image}
                  alt={`${pulseDisplayCard.title} Pulse preview card`}
                  fill
                  sizes="(max-width: 760px) 92vw, 260px"
                />
                <span>
                  {activePreviewCard ? `${previewSecondsRemaining}s preview` : "Preview reward"}
                </span>
              </div>
              <div className="legend-pulse__preview-body">
                <p className="wc-card-eyebrow">
                  {activePreviewCard ? "Temporary card preview" : "Next reader reward"}
                </p>
                <h3>{pulseDisplayCard.title}</h3>
                <p>{pulseDisplayCard.teams}</p>
                <small>
                  {activePreviewCard
                    ? "Preview is open now. Watch the episode to keep the card."
                    : "Read a Pulse item to open this card for 60 seconds."}
                </small>
                <div className="legend-pulse__preview-actions">
                  {activePreviewCard ? (
                    <button type="button" className="button" onClick={() => startWatch(activePreviewCard)}>
                      <ExternalLink size={16} />
                      Watch to collect
                    </button>
                  ) : nextPulseItem ? (
                    <button type="button" className="button" onClick={() => readPulse(nextPulseItem)}>
                      <Newspaper size={16} />
                      Read for preview
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => speakStory(pulseDisplayCard)}
                  >
                    <Volume2 size={16} />
                    Listen story
                  </button>
                </div>
              </div>
            </article>

            <div className="legend-pulse__feed" aria-label="WorldCup26 Legends Pulse items">
              {legendPulseItems.map((item) => {
                const hasRead = readPulseIds.has(item.id);
                const card = legendCardById.get(item.cardId);
                const hasActivePreview = activePreviewCard?.id === item.cardId;

                return (
                  <article
                    key={item.id}
                    className={`legend-pulse-item ${hasActivePreview ? "is-active" : ""}`}
                  >
                    <button type="button" onClick={() => readPulse(item)}>
                      <span className="legend-pulse-item__label">{item.label}</span>
                      <strong>{item.headline}</strong>
                      <span>{item.summary}</span>
                      <em>
                        {hasActivePreview
                          ? `${previewSecondsRemaining}s preview open`
                          : hasRead
                            ? "Preview again"
                            : `Read for ${pulsePreviewDurationMs / 1000}s preview`}
                      </em>
                    </button>
                    {card ? <a href={`#legend-card-${card.id}`}>View card</a> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

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
                loading="eager"
                sizes="(max-width: 760px) 92vw, 260px"
              />
              {!unlockedIds.has(focusCard.id) ? (
                <span className="legend-feature-card__state">
                  {focusCardAction?.step === "listen" ? <Volume2 size={16} /> : null}
                  {focusCardAction?.step === "watch" ? <ExternalLink size={16} /> : null}
                  {focusCardAction?.step === "collect" ? <Sparkles size={16} /> : null}
                  {focusCardAction?.step === "locked" ? <LockKeyhole size={16} /> : null}
                  {focusCardAction?.badge ?? "Next to collect"}
                </span>
              ) : (
                <span className="legend-feature-card__state is-collected">
                  <Check size={16} />
                  {focusCardAction?.badge ?? "Collected"}
                </span>
              )}
            </div>
            <div className="legend-feature-card__body">
              <p className="wc-card-eyebrow">{focusCardAction?.eyebrow ?? "Next best action"}</p>
              <h2>{focusCard.title}</h2>
              <p>{focusCard.teams}</p>
              <small>{getEpisodeLabel(focusCard)} · {focusCard.subtitle}</small>
              <p className="legend-feature-card__guidance">
                {focusCardAction?.detail ?? "Continue the card loop from this episode."}
              </p>
              <div className="legend-feature-card__actions legend-feature-card__actions--guided">
                <button
                  type="button"
                  className="button legend-feature-card__primary-action"
                  disabled={focusCardAction?.step === "locked"}
                  onClick={runFocusCardAction}
                >
                  {focusCardAction?.step === "collect" ? <Sparkles size={16} /> : null}
                  {focusCardAction?.step === "watch" ? <ExternalLink size={16} /> : null}
                  {focusCardAction?.step === "listen" || focusCardAction?.step === "collected" ? (
                    speakingCardId === focusCard.id ? <VolumeX size={16} /> : <Volume2 size={16} />
                  ) : null}
                  {focusCardAction?.step === "locked" ? <LockKeyhole size={16} /> : null}
                  {focusCardAction?.ctaLabel ?? "Continue"}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => showFocusCardInAlbum(focusCard)}
                >
                  <Search size={16} />
                  Find in album
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
                <dt>Series</dt>
                <dd>{storyCount}</dd>
              </div>
              <div>
                <dt>Supporters</dt>
                <dd>{supporterCount}</dd>
              </div>
              <div>
                <dt>Legends</dt>
                <dd>{didYouKnowCount}</dd>
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

      <div className="legend-search" role="search">
        <label className="sr-only" htmlFor="legend-card-search">
          Search Legend cards
        </label>
        <Search size={17} aria-hidden="true" />
        <input
          id="legend-card-search"
          type="search"
          value={cardSearch}
          onChange={(event) => updateCardSearch(event.target.value)}
          placeholder="Search teams or cards"
          autoComplete="off"
        />
        {normalizedCardSearch ? (
          <button type="button" onClick={() => updateCardSearch("")} aria-label="Clear Legend card search">
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <span>{filteredCards.length} cards</span>
        )}
      </div>

      <div className="legend-filter-bar" aria-label="Filter Legend cards">
        {legendCardFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`legend-filter-button ${filter.id === "legends" ? "legend-filter-button--legends" : ""} ${
              cardFilter === filter.id ? "is-active" : ""
            }`}
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
          const isPreviewing = activePreviewCard?.id === card.id;
          const hasWatchedEpisode = watchedIds.has(card.id);
          const hasListenedStory = listenedIds.has(card.id);
          const watchProof = watchProofs.get(card.id);
          const watchSecondsRemaining = getWatchSecondsRemaining(watchProof, watchTimerTick);
          const isWatchPending = Boolean(card.youtube && !hasWatchedEpisode && watchSecondsRemaining > 0);
          const canUnlock = canCollectLegendCard(card, unlockedIds, listenedIds, watchedIds);
          const isSpeaking = speakingCardId === card.id;
          const downloadHref = getSupporterWallpaperHref(card);
          const downloadApiHref = getSupporterWallpaperDownloadHref(card);
          const isSupporterCard = Boolean(downloadHref);
          const isRealLegendCardAsset = card.image.startsWith("/legend-cards/");
          const canDownloadWallpaper = Boolean(downloadHref && unlockedWallpaperHrefs.has(downloadHref));
          const downloadFileName = downloadHref?.split("/").pop();

          return (
            <article
              key={card.id}
              id={`legend-card-${card.id}`}
              className={`legend-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${
                canUnlock ? "is-ready" : ""
              } ${isPreviewing ? "is-previewing" : ""} ${isSupporterCard ? "legend-card--supporter" : ""} ${
                isRealLegendCardAsset ? "legend-card--real-asset" : ""
              }`}
            >
              <div className="legend-card__image">
                <Image
                  src={card.image}
                  alt={`${card.title} collectible card`}
                  fill
                  loading={index < 2 ? "eager" : "lazy"}
                  sizes="(max-width: 760px) 92vw, (max-width: 1180px) 45vw, 320px"
                />
                {!isUnlocked ? (
                  <div className="legend-card__lock" aria-hidden="true">
                    {isPreviewing ? <Newspaper size={26} /> : <LockKeyhole size={26} />}
                    <span>{isPreviewing ? `Preview ${previewSecondsRemaining}s` : "Locked"}</span>
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

                <div className="legend-card__journey" aria-label={`${card.title} collection progress`}>
                  <span className={hasListenedStory ? "is-done" : ""}>
                    <Check size={13} aria-hidden="true" />
                    Story
                  </span>
                  <span
                    className={
                      card.youtube
                        ? hasWatchedEpisode
                          ? "is-done"
                          : isWatchPending
                            ? "is-next"
                            : ""
                        : hasListenedStory
                          ? "is-done"
                          : ""
                    }
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    {card.youtube ? "YouTube" : "Own story"}
                  </span>
                  <span className={isUnlocked ? "is-done" : canUnlock ? "is-next" : ""}>
                    <Sparkles size={13} aria-hidden="true" />
                    Collect
                  </span>
                </div>

                <div className="legend-card__actions">
                  {card.youtube ? (
                    <button
                      type="button"
                      className="button legend-card__watch"
                      onClick={() => startWatch(card)}
                    >
                      <ExternalLink size={16} />
                      {hasWatchedEpisode || isWatchPending ? "Open again" : "Open YouTube"}
                    </button>
                  ) : (
                    <span className="button secondary legend-card__disabled" aria-disabled="true">
                      Story unlock
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

                  {downloadHref ? (
                    canDownloadWallpaper ? (
                      <a
                        className="button secondary legend-card__download"
                        href={downloadApiHref ?? downloadHref}
                        download={downloadFileName}
                        aria-label={`Download ${card.title} HD phone card`}
                      >
                        <Download size={16} />
                        Download HD
                      </a>
                    ) : (
                      <span className="button secondary legend-card__download is-disabled" aria-disabled="true">
                        <Download size={16} />
                        Collect one to download
                      </span>
                    )
                  ) : null}

                  {isWatchPending ? (
                    <p className="legend-card__watch-note">
                      Keep YouTube open. {getWatchSecondsLabel(watchSecondsRemaining)} left before this card is ready.
                    </p>
                  ) : null}

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
        <div className="legend-card-empty">
          <strong>{albumEmptyState.title}</strong>
          <p>{albumEmptyState.detail}</p>
          <button type="button" onClick={runAlbumEmptyAction}>
            {albumEmptyState.actionLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
