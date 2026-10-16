import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { it } from "node:test";

// Exercise VideoSprite's actual playback effect without a DOM/Chromium. Only
// its JSX return is removed; media operations run against an observable double.
function play(local: number, rate: number) {
  const source = readFileSync("marketing/deep-dives/engine/match-kit.jsx", "utf8");
  const effect = source.slice(source.indexOf("function VideoSprite("), source.indexOf("  if (!visible) return null;")) + "}";
  const media = { duration: 5, currentTime: local * rate, paused: true, playbackRate: 1, loop: true,
    plays: 0, pauses: 0,
    play() { this.plays++; this.paused = false; return Promise.resolve(); },
    pause() { this.pauses++; this.paused = true; },
  };
  const context = vm.createContext({ React: { useRef: () => ({ current: media }), useEffect: (f: () => void) => f() },
    useTime: () => local, useTimeline: () => ({ playing: true }) });
  vm.runInContext(effect + `;VideoSprite({src:'clip.mp4', start:0, dur:20, rate:${rate}, loop:false});`, context);
  return media;
}

it("interactive clip playback honours slow motion without repeated drift jumps", () => {
  const media = play(2, 0.315);
  assert.equal(media.playbackRate, 0.315);
  assert.equal(media.loop, false);
  assert.equal(media.plays, 1);
  assert.equal(media.currentTime, 0.63);
});

it("a non-looping clip holds its final frame instead of restarting playback", () => {
  const media = play(12, 0.5);
  assert.equal(media.plays, 0);
  assert.equal(media.paused, true);
  assert.equal(media.currentTime, 4.93);
});

it("regenerating an upload kit retains the AI visual disclosure", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "deep-dive-kit-"));
  try {
    mkdirSync(path.join(dir, "build"));
    writeFileSync(path.join(dir, "episode.json"), readFileSync("marketing/deep-dives/episodes/01-yamal-messi-bath-photo/episode.json"));
    writeFileSync(path.join(dir, "build/film.json"), JSON.stringify({ duration: 295, chapters: [], graphics: [] }));
    execFileSync(process.execPath, ["marketing/deep-dives/engine/kit.mjs", dir]);
    const kit = readFileSync(path.join(dir, "UPLOAD_KIT.md"), "utf8");
    assert.match(kit, /AI-generated football scenes/);
    assert.match(kit, /AI visuals and narration voice/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
