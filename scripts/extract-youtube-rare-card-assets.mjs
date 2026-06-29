import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { tmpdir } from "node:os";

const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@DansLab-WorldCup/videos";
const CHANNEL_SHORTS_URL = "https://www.youtube.com/@DansLab-WorldCup/shorts";
const PUBLIC_OUT = "public/legend-cards/youtube-rare";
const PROMOTE_OUT = "Promote/cards/youtube-rare-end-cards";
const TMP_OUT = join(tmpdir(), "worldcup26-youtube-rare-card-assets");
const VIDEO_LIMIT = Number(process.env.WC26_RARE_LIMIT ?? "0");
const INCLUDE_SHORTS = process.env.WC26_RARE_INCLUDE_SHORTS === "1";
const DOWNLOAD_SECONDS = 45;
const ANIMATION_SECONDS = 8;

const manualEpisodeById = new Map([
  ["myNgytIwZ0U", 1],
  ["53d_4pQcY_8", 2],
  ["qicbV-pTVdM", 3],
  ["zWAcb4CLOWs", 11],
]);

const knownSpecialCards = new Map([
  ["NGyPLObwq4c", { cardId: "bonus-launch-film", kind: "series", title: "WorldCup26 Launch Film" }],
  ["Yo4q-_iHoKM", { cardId: "bonus-lukaku-promise", kind: "bonus", title: "Lukaku: The Promise" }],
  ["3AuPzxScrac", { cardId: "bonus-luis-diaz", kind: "bonus", title: "Luis Diaz" }],
  ["zb4W9KkVESU", { cardId: "bonus-world-cup-secrets", kind: "bonus", title: "World Cup Monopoly Round 2" }],
  ["0oHkstIXqjk", { cardId: "bonus-world-cup-secrets", kind: "bonus", title: "World Cup Monopoly" }],
]);

const didYouKnowShorts = new Map([
  ["bSFDrewxg9s", "short-gaetjens-vanished"],
  ["0rmcr7dmwSc", "short-garrincha-broken-magic"],
  ["rqQ_xVUzic8", "short-carbajal-five-world-cups"],
  ["e3-SVYS33xk", "short-socrates-sunday"],
  ["a4Za3AjOeEE", "short-milla-corner-flag"],
  ["Wj-k6syhVcY", "short-laurent-first-goal"],
  ["ZUsFa2mNki0", "short-escobar-own-goal"],
  ["N7wiebdbI-E", "short-yashin-black-spider"],
  ["VeB_RKVhPv0", "short-monti-two-finals"],
  ["KZ15CaO-y4E", "short-tostao-eyes"],
  ["Mv-GBCDS-EQ", "short-castro-one-armed-champion"],
  ["_kbLwv0R38k", "short-pak-secret-hero"],
]);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
    maxBuffer: 1024 * 1024 * 80,
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim(),
    );
  }

  return result.stdout ?? "";
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function parseJsonl(value) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function fetchPlaylist(url) {
  return parseJsonl(run("yt-dlp", ["--flat-playlist", "--dump-json", url]));
}

function parseEpisode(record) {
  const title = record.title ?? "";
  const explicit = title.match(/(?:Ep\.?|Episode)\s*(\d+)/i);
  const manual = manualEpisodeById.get(record.id);

  return explicit ? Number(explicit[1]) : manual ?? null;
}

function parseTeams(title) {
  const cleaned = title
    .replace(/\s*[-|—]\s*WorldCup26.*$/i, "")
    .replace(/\s*[-|—]\s*World Cup 2026.*$/i, "")
    .replace(/\s*\(Ep\.\d+\).*$/i, "")
    .replace(/^\s*Ep\d+\s*[—-]\s*/i, "")
    .trim();
  const candidates = [
    cleaned,
    title.split("|").reverse()[0] ?? title,
    title.split("—").reverse()[0] ?? title,
  ];

  for (const candidate of candidates) {
    const match = candidate.match(/([A-Za-zÀ-ÿ.'&\s]+?)\s+v(?:s|\.)\s+([A-Za-zÀ-ÿ.'&\s]+?)(?:$|,|:|—|-|\|)/i);

    if (match) {
      return `${match[1].trim()} vs ${match[2].replace(/:.+$/, "").trim()}`;
    }
  }

  return cleaned;
}

function createEntry(record, source) {
  const special = knownSpecialCards.get(record.id);
  const shortCardId = didYouKnowShorts.get(record.id);
  const episode = parseEpisode(record);
  const title = record.title ?? record.id;

  if (special) {
    return {
      id: record.id,
      youtube: `https://www.youtube.com/watch?v=${record.id}`,
      cardId: special.cardId,
      kind: special.kind,
      title: special.title,
      source,
      slug: slugify(`${special.cardId}-${record.id}`),
    };
  }

  if (shortCardId) {
    return {
      id: record.id,
      youtube: `https://www.youtube.com/shorts/${record.id}`,
      cardId: shortCardId,
      kind: "did-you-know-short",
      title,
      source,
      slug: slugify(`${shortCardId}-${record.id}`),
    };
  }

  if (episode) {
    const teams = parseTeams(title);

    return {
      id: record.id,
      youtube: `https://www.youtube.com/watch?v=${record.id}`,
      episode,
      kind: "episode-special",
      title,
      teams,
      source,
      slug: slugify(`ep${String(episode).padStart(3, "0")}-${teams}-${record.id}`),
    };
  }

  return null;
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function downloadTail(entry, target) {
  ensureDir(dirname(target));
  rmSync(target, { force: true });

  const commonArgs = [
      "-q",
      "--download-sections",
      `*-00:${DOWNLOAD_SECONDS}-inf`,
      "--force-keyframes-at-cuts",
      "--force-overwrites",
      "--no-part",
      "-o",
      target,
      entry.youtube,
  ];

  try {
    run("yt-dlp", ["-f", "bv*[height<=720]/b[height<=720]/18", ...commonArgs], { stdio: "inherit" });
  } catch (error) {
    run("yt-dlp", ["-f", "18/b[height<=720]/best", ...commonArgs], { stdio: "inherit" });
  }
}

function classifyAssetForApp(entry, imagePath, revealPath) {
  if (entry.kind === "bonus") {
    return {
      layout: "production-bonus",
      appImagePath: null,
      appImageNote: "Use the polished production bonus PNGs in public/legend-cards/bonus.",
    };
  }

  if (entry.kind !== "episode-special") {
    return {
      layout: "archive-only",
      appImagePath: null,
      appImageNote: "Archived for Promote; not a collectible card image in the app.",
    };
  }

  const episode = entry.episode ?? 0;
  const hasPortraitCard =
    (episode >= 40 && episode <= 43) ||
    (episode >= 61 && episode <= 66) ||
    episode >= 69;
  const hasWideRevealCard = episode >= 44 && episode <= 60;

  if (hasPortraitCard) {
    return {
      layout: "portrait-card",
      appImagePath: imagePath,
      appImageNote: "Clean portrait-style end-card crop from the YouTube video.",
    };
  }

  if (hasWideRevealCard) {
    return {
      layout: "wide-reveal",
      appImagePath: revealPath,
      appImageNote: "Wide end-card reveal from the YouTube video; shown with a wide app frame.",
    };
  }

  return {
    layout: "archive-only",
    appImagePath: null,
    appImageNote: "The video tail is a score, prediction, player, or CTA frame rather than a card.",
  };
}

function extractAssets(entry, clipPath) {
  const publicReveal = join(PUBLIC_OUT, "reveal-frames", `${entry.slug}.jpg`);
  const publicCard = join(PUBLIC_OUT, "cards", `${entry.slug}.jpg`);
  const promoteReveal = join(PROMOTE_OUT, "reveal-frames", `${entry.slug}.jpg`);
  const promoteCard = join(PROMOTE_OUT, "cards", `${entry.slug}.jpg`);
  const promoteClip = join(PROMOTE_OUT, "animated", `${entry.slug}.mp4`);

  for (const path of [publicReveal, publicCard, promoteReveal, promoteCard, promoteClip]) {
    ensureDir(dirname(path));
  }

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    clipPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    publicReveal,
  ]);

  execFileSync("python3", [
    "-c",
    `
import sys
from PIL import Image
source, target = sys.argv[1], sys.argv[2]
im = Image.open(source).convert("RGB")
w, h = im.size
if w >= h:
    # The rare reveal uses a 16:9 card centered near x=50%, y=43%.
    crop_w = max(1, int(w * 0.25))
    crop_h = max(1, int(h * 0.611))
    x = max(0, min(w - crop_w, int(w * 0.375)))
    y = max(0, min(h - crop_h, int(h * 0.125)))
else:
    crop_w = max(1, int(w * 0.72))
    crop_h = max(1, int(h * 0.72))
    x = max(0, (w - crop_w) // 2)
    y = max(0, int(h * 0.12))
card = im.crop((x, y, x + crop_w, y + crop_h))
card = card.resize((640, 880), Image.Resampling.LANCZOS)
card.save(target, quality=92)
`,
    publicReveal,
    publicCard,
  ]);

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    clipPath,
    "-t",
    String(ANIMATION_SECONDS),
    "-vf",
    "scale=960:-2",
    "-an",
    "-movflags",
    "+faststart",
    "-c:v",
    "libx264",
    "-crf",
    "24",
    "-preset",
    "veryfast",
    promoteClip,
  ]);

  for (const [from, to] of [
    [publicReveal, promoteReveal],
    [publicCard, promoteCard],
  ]) {
    run("cp", [from, to]);
  }

  const imagePath = `/${publicCard.replace(/^public\//, "")}`;
  const revealPath = `/${publicReveal.replace(/^public\//, "")}`;

  return {
    ...entry,
    imagePath,
    revealPath,
    ...classifyAssetForApp(entry, imagePath, revealPath),
    promoteImagePath: promoteCard,
    promoteRevealPath: promoteReveal,
    promoteAnimatedPath: promoteClip,
  };
}

function readExistingManifest() {
  const manifestPath = join(PUBLIC_OUT, "manifest.json");

  if (!existsSync(manifestPath)) {
    return [];
  }

  return JSON.parse(readFileSync(manifestPath, "utf8")).assets ?? [];
}

function writeManifest(assets) {
  const byId = new Map();

  for (const asset of assets) {
    byId.set(asset.id, asset);
  }

  const merged = [...byId.values()].sort((a, b) => {
    const aEpisode = a.episode ?? 9999;
    const bEpisode = b.episode ?? 9999;

    if (aEpisode !== bEpisode) {
      return aEpisode - bEpisode;
    }

    return String(a.cardId ?? a.id).localeCompare(String(b.cardId ?? b.id));
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "YouTube end-screen rare-card extraction",
    assets: merged,
  };

  ensureDir(PUBLIC_OUT);
  writeFileSync(join(PUBLIC_OUT, "manifest.json"), `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(join(PROMOTE_OUT, "manifest.json"), `${JSON.stringify(payload, null, 2)}\n`);
}

function makeContactSheet() {
  const sheetPath = "Promote/cards/sheets/youtube-rare-end-card-sheet.jpg";

  ensureDir(dirname(sheetPath));
  execFileSync("python3", [
    "-c",
    `
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
images = sorted(Path('${PROMOTE_OUT}/cards').glob('*.jpg'))
if not images:
    raise SystemExit(0)
thumb = (180, 248)
cols = 6
rows = (len(images) + cols - 1) // cols
label_h = 34
margin = 28
gap = 14
w = margin * 2 + cols * thumb[0] + (cols - 1) * gap
h = margin * 2 + 68 + rows * (thumb[1] + label_h) + (rows - 1) * gap
canvas = Image.new('RGB', (w, h), (2, 20, 15))
draw = ImageDraw.Draw(canvas)
draw.text((margin, 24), 'YouTube Rare End-Video Cards', fill=(255, 207, 102))
for i, p in enumerate(images):
    im = Image.open(p).convert('RGB')
    im.thumbnail(thumb, Image.Resampling.LANCZOS)
    x = margin + (i % cols) * (thumb[0] + gap)
    y = margin + 68 + (i // cols) * (thumb[1] + label_h + gap)
    frame = Image.new('RGB', thumb, (5, 32, 25))
    frame.paste(im, ((thumb[0] - im.width)//2, (thumb[1] - im.height)//2))
    canvas.paste(frame, (x, y))
    draw.text((x, y + thumb[1] + 6), p.stem[:22], fill=(230, 246, 239))
canvas.save('${sheetPath}', quality=92)
`,
  ]);
}

function main() {
  ensureDir(TMP_OUT);
  const videos = fetchPlaylist(CHANNEL_VIDEOS_URL).map((record) => createEntry(record, "youtube-videos")).filter(Boolean);
  const shorts = INCLUDE_SHORTS
    ? fetchPlaylist(CHANNEL_SHORTS_URL).map((record) => createEntry(record, "youtube-shorts")).filter(Boolean)
    : [];
  const entries = [...videos, ...shorts];
  const selectedEntries = VIDEO_LIMIT > 0 ? entries.slice(0, VIDEO_LIMIT) : entries;
  const extracted = [];

  console.log(`Found ${entries.length} card-linked YouTube videos. Extracting ${selectedEntries.length}.`);

  for (const [index, entry] of selectedEntries.entries()) {
    const clipPath = join(TMP_OUT, `${entry.slug}.mp4`);
    console.log(`[${index + 1}/${selectedEntries.length}] ${entry.title}`);

    try {
      downloadTail(entry, clipPath);
      extracted.push(extractAssets(entry, clipPath));
    } catch (error) {
      console.error(`Failed ${entry.youtube}`);
      console.error(error.message);
    }
  }

  writeManifest([...readExistingManifest(), ...extracted]);
  makeContactSheet();
  console.log(`Saved ${extracted.length} rare-card asset sets.`);
}

main();
