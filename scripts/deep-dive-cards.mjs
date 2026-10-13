// Deep Dive cards: put an episode's legend card live in the app once its video is
// on YouTube (the card unlocks by watching that video, so it can't go live sooner).
//
//   node scripts/deep-dive-cards.mjs add <episode-dir> <youtube-url-or-id>
//   node scripts/deep-dive-cards.mjs sync      # match built episodes to the channel feed
//
// Writes src/lib/deep-dive-cards.json and marks the episode "published" in
// marketing/deep-dives/plan.json. Refuses videos that aren't public + embeddable
// on the canonical channel.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CARDS = path.join(ROOT, "src/lib/deep-dive-cards.json");
const PLAN = path.join(ROOT, "marketing/deep-dives/plan.json");
const EPISODES = path.join(ROOT, "marketing/deep-dives/episodes");
const CHANNEL = "@DansLab-WorldCup";
const CHANNEL_ID = "UC7kFHZYDL2Z5eB8i9CVNyWg";
const EPISODE_BASE = 920; // album episode numbers 920+ are Deep Dives

const readJson = (f, fallback) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : fallback);
const writeJson = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + "\n");

function videoId(input) {
  const m = String(input).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/) || String(input).match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

async function checkVideo(id) {
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
  if (res.status === 401) throw new Error(`${id}: embedding is disabled — the card could never unlock in the app`);
  if (!res.ok) throw new Error(`${id}: YouTube returned ${res.status} (private, unlisted-and-unembeddable, or removed?)`);
  const body = await res.json();
  const channel = body.author_url?.split("/").pop();
  if (channel !== CHANNEL) throw new Error(`${id}: video is on ${channel}, not ${CHANNEL}`);
  return body.title;
}

async function add(epDir, input) {
  const ep = readJson(path.join(epDir, "episode.json"), null);
  if (!ep) throw new Error(`no episode.json in ${epDir}`);
  const id = videoId(input);
  if (!id) throw new Error(`not a YouTube link or id: ${input}`);
  const image = `/legend-cards/deep-dive/${ep.slug}.png`;
  if (!fs.existsSync(path.join(ROOT, "public", image))) throw new Error(`card art missing: public${image} (run engine/make-art.mjs)`);
  const title = await checkVideo(id);

  const cards = readJson(CARDS, []);
  const entry = {
    id: ep.card.id,
    episode: EPISODE_BASE + ep.number,
    slug: ep.slug,
    title: ep.card.title,
    subtitle: ep.card.subtitle,
    teams: ep.card.teams,
    story: ep.card.story,
    youtube: `https://www.youtube.com/watch?v=${id}`,
    image,
  };
  const at = cards.findIndex((c) => c.id === entry.id);
  if (at >= 0) cards[at] = entry; else cards.push(entry);
  cards.sort((a, b) => a.episode - b.episode);
  writeJson(CARDS, cards);

  const plan = readJson(PLAN, null);
  if (plan) {
    const row = plan.episodes.find((e) => e.slug === ep.slug);
    if (row) { row.status = "published"; row.youtube = entry.youtube; writeJson(PLAN, plan); }
  }
  console.log(`card live: ${entry.id} -> ${entry.youtube} ("${title}")`);
}

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

async function sync() {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  if (!res.ok) throw new Error(`channel feed returned ${res.status}`);
  const xml = await res.text();
  const feed = [...xml.matchAll(/<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>(.*?)<\/title>/g)]
    .map((m) => ({ id: m[1], title: m[2].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") }));
  const live = new Set(readJson(CARDS, []).map((c) => c.slug));
  let added = 0;
  for (const dir of fs.existsSync(EPISODES) ? fs.readdirSync(EPISODES).sort() : []) {
    const epDir = path.join(EPISODES, dir);
    const ep = readJson(path.join(epDir, "episode.json"), null);
    if (!ep || live.has(ep.slug)) continue;
    const surname = norm(ep.player.name).split(" ").pop();
    // exact title first; otherwise the player's surname + "did you know" (titles get tweaked in Studio)
    const hit = feed.find((v) => norm(v.title) === norm(ep.title))
      ?? feed.find((v) => norm(v.title).includes(surname) && norm(v.title).includes("did you know"));
    if (!hit) { console.log(`not uploaded yet: ${ep.slug}`); continue; }
    await add(epDir, hit.id);
    added++;
  }
  console.log(`sync done: ${added} card(s) added`);
}

const [cmd, a, b] = process.argv.slice(2);
try {
  if (cmd === "add" && a && b) await add(path.resolve(a), b);
  else if (cmd === "sync") await sync();
  else { console.error("usage: deep-dive-cards.mjs add <episode-dir> <youtube> | sync"); process.exit(2); }
} catch (error) {
  console.error("ERROR", error.message);
  process.exit(1);
}
