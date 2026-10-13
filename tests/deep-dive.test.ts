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
const LIBRARY: Record<string, { src: string; url: string | null; who: string | null; faces: string; dur: number }> = JSON.parse(
  readFileSync("marketing/deep-dives/library/clips.json", "utf8"),
);
const CODE_SCENES = new Set([
  "date", "nameplate", "title", "chapter", "kinetic", "stadium", "route", "stat", "impact", "artifact",
  "timeline", "jersey", "pitch", "cardwall", "versus", "clock", "ballnet", "card", "phone", "heartbeat", "faceoff",
]);
const BANNED = /\b(odds|bets?|betting|wager|stakes?|jackpot|bookmaker|coefficients?|prize money|cash prizes?|win money|payout)\b/i;
const words = (s: unknown) => String(s).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

type Scene = Record<string, unknown> & { type: string; words?: { w: string }[] };
type Shot = { clip?: string; tag?: string; over?: Scene; scene?: Scene; w?: number; offset?: number };
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
      const clips = new Map<string, number | undefined>();
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
            // once — or as segments with their own offsets (preflight checks no frame repeats)
            assert.ok(!clips.has(shot.clip) || (shot.offset != null && clips.get(shot.clip) != null),
              `clip "${shot.clip}" plays twice (no-repeat rule)`);
            clips.set(shot.clip, shot.offset);
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
          for (const face of (scene.faces as { clip: string }[] | undefined) ?? []) {
            const who = LIBRARY[face.clip]?.who;
            assert.ok(who && named.includes(who), `faceoff panel "${face.clip}" is not an approved, named face`);
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

  it("keeps a re-downloadable source for every library clip", () => {
    for (const [alias, clip] of Object.entries(LIBRARY)) {
      assert.match(alias, /^[a-z0-9-]+$/);
      // MP4s are gitignored: each needs a CDN URL, or must be a file tracked in the repo
      assert.ok(clip.url ? /^https:\/\//.test(clip.url) : existsSync(clip.src), `${alias} has no source`);
      assert.ok(clip.dur > 1, `${alias} has no duration`);
      assert.match(clip.faces, /^(none|crowd|player)$/, `${alias} must say what faces it shows`);
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
