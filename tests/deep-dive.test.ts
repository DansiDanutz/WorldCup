import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { LEGEND_CARDS } from "@/lib/legend-cards";
import { DEEP_DIVE_CARDS } from "@/lib/legend-card-registry";

// "Did You Know? Deep Dives": 5-minute films about famous players, every visual drawn
// in code. These checks keep the series' hard rules in CI, not just in the render-time
// preflight: no faces (code-drawn scene types only), no on-screen sentences, no
// gambling or prize wording, cited sources, and a card that really unlocks.

const EPISODES = "marketing/deep-dives/episodes";
const CODE_SCENES = new Set([
  "date", "nameplate", "title", "chapter", "kinetic", "stadium", "route", "stat", "impact", "artifact",
  "timeline", "jersey", "pitch", "cardwall", "versus", "clock", "ballnet", "card", "phone", "heartbeat",
]);
const BANNED = /\b(odds|bets?|betting|wager|stakes?|jackpot|bookmaker|coefficients?|prize money|cash prizes?|win money|payout)\b/i;
const words = (s: unknown) => String(s).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

type Scene = Record<string, unknown> & { type: string; words?: { w: string }[] };
type Episode = {
  number: number;
  slug: string;
  title: string;
  player: { name: string };
  thumbnail: { hook: string };
  card: { id: string; title: string; story: string };
  beats: { vo: string; scene: Scene | Scene[] }[];
  sources: { claim: string; url: string }[];
};

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
      for (const beat of ep.beats) {
        text.push(beat.vo);
        for (const scene of Array.isArray(beat.scene) ? beat.scene : [beat.scene]) {
          assert.ok(CODE_SCENES.has(scene.type), `scene "${scene.type}" is not code-drawn (no faces, no footage)`);
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
      assert.equal((Array.isArray(last.scene) ? last.scene.at(-1)! : last.scene).type, "phone");
      assert.match(last.vo, /worldcup26\.world/i);
      assert.match(last.vo, /no prizes/i);
      const wordCount = ep.beats.reduce((n, b) => n + words(b.vo), 0);
      assert.ok(wordCount >= 600 && wordCount <= 820, `${wordCount} words is not a ~5 minute script`);
    });
  }

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
