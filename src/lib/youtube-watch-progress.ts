// Verified-watch accounting for Legend card unlocks.
//
// A card unlocks when the viewer has actually played WATCH_UNLOCK_FRACTION of the
// video inside the embedded YouTube player. Progress is tracked as the set of
// video seconds that were covered by real playback — not wall-clock time, and not
// the playhead position — so:
//   - scrubbing to the end covers nothing (a seek is a jump, not playback);
//   - replaying the same 30 seconds ten times still counts as 30 seconds;
//   - reaching ENDED never unlocks on its own.
//
// This is playback-gated UX, not anti-fraud proof: the client reports progress and
// nothing server-side can confirm a YouTube view. It must never gate money.

export const WATCH_UNLOCK_FRACTION = 0.8;

// Largest playhead advance per sample that still counts as playback. Samples are
// taken about once a second; 2x speed advances ~2s, so anything past this is a seek.
export const MAX_PLAYBACK_STEP_SECONDS = 2.5;

// Covered video time as sorted, non-overlapping [start, end) second ranges.
export type WatchRanges = Array<[number, number]>;

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const watchId = parsed.searchParams.get("v");
      if (watchId) {
        return watchId;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      const index = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
      if (index >= 0) {
        return parts[index + 1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function addWatchRange(ranges: WatchRanges, start: number, end: number): WatchRanges {
  if (!(end > start) || !Number.isFinite(start) || !Number.isFinite(end)) {
    return ranges;
  }

  const merged: WatchRanges = [];
  let [nextStart, nextEnd] = [Math.max(0, start), end];

  for (const [rangeStart, rangeEnd] of ranges) {
    if (rangeEnd < nextStart || rangeStart > nextEnd) {
      merged.push([rangeStart, rangeEnd]);
    } else {
      nextStart = Math.min(nextStart, rangeStart);
      nextEnd = Math.max(nextEnd, rangeEnd);
    }
  }

  merged.push([nextStart, nextEnd]);
  return merged.sort((a, b) => a[0] - b[0]);
}

// Feed one playhead sample. Returns the ranges with the stretch between the
// previous and current position added — only when it looks like playback.
export function recordPlaybackSample(ranges: WatchRanges, previous: number | null, current: number): WatchRanges {
  if (previous === null || !Number.isFinite(current)) {
    return ranges;
  }

  const step = current - previous;
  if (step <= 0 || step > MAX_PLAYBACK_STEP_SECONDS) {
    return ranges; // paused, rewound, or seeked forward
  }

  return addWatchRange(ranges, previous, current);
}

export function getWatchedSeconds(ranges: WatchRanges): number {
  return ranges.reduce((total, [start, end]) => total + Math.max(0, end - start), 0);
}

export function getWatchedFraction(ranges: WatchRanges, duration: number): number {
  if (!(duration > 0)) {
    return 0;
  }

  return Math.min(1, getWatchedSeconds(ranges) / duration);
}

export function isWatchComplete(ranges: WatchRanges, duration: number): boolean {
  return duration > 0 && getWatchedFraction(ranges, duration) >= WATCH_UNLOCK_FRACTION;
}

export function parseWatchRanges(value: unknown): WatchRanges {
  if (!Array.isArray(value)) {
    return [];
  }

  let ranges: WatchRanges = [];
  for (const entry of value) {
    if (Array.isArray(entry) && typeof entry[0] === "number" && typeof entry[1] === "number") {
      ranges = addWatchRange(ranges, entry[0], entry[1]);
    }
  }

  return ranges;
}
