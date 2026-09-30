import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  WATCH_UNLOCK_FRACTION,
  addWatchRange,
  getWatchedSeconds,
  getYouTubeVideoId,
  isWatchComplete,
  parseWatchRanges,
  recordPlaybackSample,
  type WatchRanges,
} from "@/lib/youtube-watch-progress";

function playThrough(from: number, to: number, ranges: WatchRanges = []) {
  let previous = from;
  for (let t = from + 1; t <= to; t += 1) {
    ranges = recordPlaybackSample(ranges, previous, t);
    previous = t;
  }
  return ranges;
}

describe("YouTube video id parsing", () => {
  it("reads watch, short, embed and youtu.be links", () => {
    assert.equal(getYouTubeVideoId("https://www.youtube.com/watch?v=myNgytIwZ0U"), "myNgytIwZ0U");
    assert.equal(getYouTubeVideoId("https://m.youtube.com/watch?v=abc123&t=30"), "abc123");
    assert.equal(getYouTubeVideoId("https://youtube.com/shorts/Yo4q-_iHoKM"), "Yo4q-_iHoKM");
    assert.equal(getYouTubeVideoId("https://www.youtube.com/embed/xyz"), "xyz");
    assert.equal(getYouTubeVideoId("https://youtu.be/qicbV-pTVdM"), "qicbV-pTVdM");
  });

  it("rejects non-YouTube and malformed links", () => {
    assert.equal(getYouTubeVideoId("https://example.com/watch?v=abc"), null);
    assert.equal(getYouTubeVideoId("not a url"), null);
    assert.equal(getYouTubeVideoId(null), null);
  });
});

describe("verified watch accounting", () => {
  it("unlocks only after 80% of the video has really been played", () => {
    assert.equal(WATCH_UNLOCK_FRACTION, 0.8);
    assert.equal(isWatchComplete(playThrough(0, 79), 100), false);
    assert.equal(isWatchComplete(playThrough(0, 80), 100), true);
  });

  it("does not count a seek to the end as watching", () => {
    let ranges = playThrough(0, 10);
    ranges = recordPlaybackSample(ranges, 10, 99); // scrub to the end
    assert.equal(getWatchedSeconds(ranges), 10);
    assert.equal(isWatchComplete(ranges, 100), false);
  });

  it("does not let the same stretch be replayed to reach the threshold", () => {
    let ranges: WatchRanges = [];
    for (let pass = 0; pass < 10; pass += 1) {
      ranges = playThrough(0, 30, ranges);
    }
    assert.equal(getWatchedSeconds(ranges), 30);
    assert.equal(isWatchComplete(ranges, 100), false);
  });

  it("counts 2x playback but ignores pauses and rewinds", () => {
    let ranges = recordPlaybackSample([], 0, 2); // 2x speed
    ranges = recordPlaybackSample(ranges, 2, 2); // paused
    ranges = recordPlaybackSample(ranges, 2, 1); // rewound
    assert.equal(getWatchedSeconds(ranges), 2);
  });

  it("accumulates separate stretches watched across sessions", () => {
    const first = playThrough(0, 40);
    const resumed = playThrough(40, 85, first);
    assert.equal(getWatchedSeconds(resumed), 85);
    assert.equal(isWatchComplete(resumed, 100), true);
  });

  it("never completes when the duration is unknown", () => {
    assert.equal(isWatchComplete(playThrough(0, 50), 0), false);
  });

  it("merges overlapping ranges and survives a storage round-trip", () => {
    const ranges = addWatchRange(addWatchRange([], 0, 10), 5, 20);
    assert.deepEqual(ranges, [[0, 20]]);
    assert.deepEqual(parseWatchRanges(JSON.parse(JSON.stringify(ranges))), [[0, 20]]);
    assert.deepEqual(parseWatchRanges("garbage"), []);
    assert.deepEqual(parseWatchRanges([[1, "x"], [2, 4]]), [[2, 4]]);
  });
});
