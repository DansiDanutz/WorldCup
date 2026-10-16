import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { LEGEND_CARDS } from "@/lib/legend-cards";
import { DEEP_DIVE_CARDS } from "@/lib/legend-card-registry";

// "Did You Know? Deep Dives": 5-minute films about famous players, cut from the owned
// clip library plus drawn graphics. These checks keep the series' hard rules in CI, not
// just in the render-time preflight: footage only from library/clips.json, every clip
// once (rule #11), no on-screen sentences, no gambling or prize wording, cited sources,
// and a card that really unlocks.

const EPISODES = "marketing/deep-dives/episodes";
const LIBRARY: Record<string, { src: string; url: string | null; who: string | null; faces: string; dur: number; crop?: number[] }> = JSON.parse(
  readFileSync("marketing/deep-dives/library/clips.json", "utf8"),
);
const CODE_SCENES = new Set([
  "date", "nameplate", "title", "chapter", "kinetic", "stadium", "route", "stat", "impact", "artifact",
  "timeline", "jersey", "pitch", "cardwall", "versus", "clock", "ballnet", "card", "phone", "heartbeat", "faceoff",
]);
const BANNED = /\b(odds|bets?|betting|wager|stakes?|jackpot|bookmaker|coefficients?|prize money|cash prizes?|win money|payout)\b/i;
const words = (s: unknown) => String(s).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

type Scene = Record<string, unknown> & { type: string; words?: { w: string }[] };
type Shot = { clip?: string; tag?: string; over?: Scene; scene?: Scene; w?: number; offset?: number; until?: number };
type Episode = {
  number: number;
  slug: string;
  title: string;
  player: { name: string };
  thumbnail: { hook: string };
  card: { id: string; title: string; story: string };
  beats: { vo: string; scene?: Scene | Scene[]; shots?: Shot[] }[];
  sources: { claim: string; url: string }[];
  people?: Record<string, string | null>;
};

// mirrors engine/lib.mjs beatShots(): a beat is a list of shots, or the older scene form
const shotsOf = (beat: Episode["beats"][number]): Shot[] =>
  beat.shots ?? (Array.isArray(beat.scene) ? beat.scene : [beat.scene!]).map((scene) => ({ scene }));

// A clip plays once — or as segments with explicit, non-overlapping [offset, until] source
// ranges. A shot's real length comes from the VO timing, which CI doesn't have, so a reused
// clip must spell out `until` on every segment except one that runs to the clip's end
// (preflight re-checks the exact played spans on the built film).
type Spans = Map<string, [number, number, boolean][]>;
function claimClipRange(spans: Spans, shot: Shot, clipDur: number) {
  const used = spans.get(shot.clip!) ?? [];
  const range: [number, number, boolean] = [shot.offset ?? 0, shot.until ?? clipDur, shot.until != null];
  if (used.length) assert.ok(shot.offset != null, `clip "${shot.clip}" plays twice (no-repeat rule)`);
  for (const [a, z, explicit] of used) {
    const apart = range[0] >= z - 0.05 || range[1] <= a + 0.05;
    const hint = explicit && range[2] ? "" : " — give each segment of a reused clip an explicit `until`";
    assert.ok(apart, `clip "${shot.clip}" replays source ${a}-${z}s (no frame twice)${hint}`);
  }
  spans.set(shot.clip!, [...used, range]);
}

const episodes: Episode[] = existsSync(EPISODES)
  ? readdirSync(EPISODES).sort().map((dir) => JSON.parse(readFileSync(`${EPISODES}/${dir}/episode.json`, "utf8")))
  : [];

describe("Did You Know? Deep Dives", () => {
  it("has at least one scripted episode, numbered in order", () => {
    assert.ok(episodes.length >= 1);
    episodes.forEach((ep, i) => {
      assert.equal(ep.number, i + 1);
      assert.match(ep.slug, new RegExp(`^${String(i + 1).padStart(2, "0")}-[a-z0-9-]+$`));
    });
  });

  for (const ep of episodes) {
    it(`${ep.slug}: follows the series rules`, () => {
      assert.ok(ep.title.length <= 100, "title over YouTube's 100 characters");
      assert.ok(ep.title.toLowerCase().includes(ep.player.name.toLowerCase().split(" ").pop()!), "title must lead with the player");
      assert.ok(words(ep.thumbnail.hook) <= 4, "thumbnail hook over 4 words");
      assert.ok(words(ep.card.story) <= 45, "card story over 45 words overflows the card's spoken story");
      assert.ok(ep.sources.filter((s) => /^https:\/\//.test(s.url)).length >= 3, "needs at least 3 cited sources");

      const text: string[] = [ep.title, ep.thumbnail.hook, ep.card.title, ep.card.story];
      // identity law needs the name map whenever the episode uses footage
      const usesClips = ep.beats.some((beat) => shotsOf(beat).some((shot) => shot.clip));
      if (usesClips) assert.ok(ep.people && typeof ep.people === "object", "footage-led episode needs a `people` map");
      const approved = new Set(Object.values(LIBRARY).map((c) => c.who).filter(Boolean));
      for (const [name, who] of Object.entries(ep.people ?? {})) {
        assert.ok(who === null || approved.has(who), `people["${name}"] = "${who}" is not an approved identity`);
      }
      // source ranges each clip plays ([offset, until]); no frame may be shown twice
      const spans: Spans = new Map();
      for (const beat of ep.beats) {
        text.push(beat.vo);
        // identity law: a face on screen must be the person the narration names
        const named = Object.entries(ep.people ?? {})
          .filter(([name]) => beat.vo.toLowerCase().includes(name.toLowerCase()))
          .map(([name, who]) => who ?? `unapproved:${name}`);
        for (const shot of shotsOf(beat)) {
          if (shot.clip) {
            const clip = LIBRARY[shot.clip];
            assert.ok(clip, `clip "${shot.clip}" is not in the library`);
            claimClipRange(spans, shot, clip.dur);
            if (clip.who) assert.ok(named.includes(clip.who), `"${shot.clip}" shows ${clip.who} but the narration doesn't name them`);
            if (clip.faces === "player" && !clip.who) {
              assert.equal(named.length, 0, `"${shot.clip}" shows an unnamed player while the narration names ${named.join(", ")}`);
            }
            if (shot.tag != null) {
              text.push(shot.tag);
              assert.ok(words(shot.tag) <= 4, `tag "${shot.tag}" is a sentence`);
            }
          }
          const scene = shot.scene ?? shot.over;
          if (!scene) {
            assert.ok(shot.clip, "a shot needs a clip or a scene");
            continue;
          }
          assert.ok(CODE_SCENES.has(scene.type), `scene "${scene.type}" is not a drawn scene`);
          for (const face of (scene.faces as { clip: string; name?: string; meta?: string }[] | undefined) ?? []) {
            const who = LIBRARY[face.clip]?.who;
            assert.ok(who && named.includes(who), `faceoff panel "${face.clip}" is not an approved, named face`);
            for (const label of [face.name, face.meta]) {
              if (label == null) continue;
              text.push(label);
              assert.ok(words(label) <= 4, `faceoff label "${label}" is a sentence`);
            }
          }
          for (const key of ["label", "title", "text", "sub", "meta", "name", "stat"]) {
            if (scene[key] != null) {
              text.push(String(scene[key]));
              assert.ok(words(scene[key]) <= 4, `on-screen ${key} "${scene[key]}" is a sentence`);
            }
          }
          (scene.words ?? []).forEach((w) => text.push(w.w));
        }
      }
      for (const t of text) assert.doesNotMatch(t, BANNED, t.slice(0, 80));

      const last = ep.beats[ep.beats.length - 1];
      assert.equal(shotsOf(last).at(-1)!.scene?.type, "phone");
      assert.match(last.vo, /worldcup26\.world/i);
      assert.match(last.vo, /no prizes/i);
      const wordCount = ep.beats.reduce((n, b) => n + words(b.vo), 0);
      assert.ok(wordCount >= 600 && wordCount <= 820, `${wordCount} words is not a ~5 minute script`);
    });
  }

  it("checks reused-clip segments for repeated frames", () => {
    // disjoint, explicit segments pass; the last one may run to the clip's end
    const ok: Spans = new Map();
    claimClipRange(ok, { clip: "c", offset: 0, until: 1.6 }, 5);
    claimClipRange(ok, { clip: "c", offset: 2.6 }, 5);
    // a non-terminal segment without `until` is assumed to run to the end, and the error says what to add
    const open: Spans = new Map();
    claimClipRange(open, { clip: "c", offset: 0 }, 5);
    assert.throws(() => claimClipRange(open, { clip: "c", offset: 2.6 }, 5), /explicit `until`/);
    // genuinely overlapping explicit ranges fail without the hint
    const overlap: Spans = new Map();
    claimClipRange(overlap, { clip: "c", offset: 0, until: 2 }, 5);
    assert.throws(() => claimClipRange(overlap, { clip: "c", offset: 1, until: 3 }, 5),
      (e: Error) => /replays source 0-2s/.test(e.message) && !/explicit/.test(e.message));
    // a second use with no offset at all is a plain repeat
    const twice: Spans = new Map();
    claimClipRange(twice, { clip: "c" }, 5);
    assert.throws(() => claimClipRange(twice, { clip: "c" }, 5), /plays twice/);
  });

  it("keeps a re-downloadable source for every library clip", () => {
    for (const [alias, clip] of Object.entries(LIBRARY)) {
      assert.match(alias, /^[a-z0-9-]+$/);
      // MP4s are gitignored: each needs a CDN URL, or must be a file tracked in the repo
      assert.ok(clip.url ? /^https:\/\//.test(clip.url) : existsSync(clip.src), `${alias} has no source`);
      assert.ok(clip.dur > 1, `${alias} has no duration`);
      assert.match(clip.faces, /^(none|crowd|player)$/, `${alias} must say what faces it shows`);
      if (clip.crop) {
        const [x, y, w, h] = clip.crop;
        assert.equal(clip.crop.length, 4, `${alias}: crop needs four coordinates`);
        assert.ok(clip.crop.every(Number.isFinite) && x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 1 && y + h <= 1,
          `${alias}: crop must stay inside the source frame`);
      }
    }
  });

  it("only lists cards whose video and art exist, each unlocking from its own video", () => {
    const ids = new Set<string>();
    for (const card of DEEP_DIVE_CARDS) {
      assert.ok(!ids.has(card.id), `duplicate deep dive card ${card.id}`);
      ids.add(card.id);
      assert.ok(card.episode >= 920);
      assert.match(card.youtube, /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/);
      assert.ok(existsSync(`public${card.image}`), `missing card art public${card.image}`);
      const live = LEGEND_CARDS.find((c) => c.id === card.id);
      assert.ok(live, `${card.id} not in the album`);
      assert.equal(live!.image, card.image);
      assert.equal(live!.kind, "legend-bonus");
    }
  });
});
