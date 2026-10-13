// Shared paths + episode loading for the Deep Dive engine.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ENGINE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(ENGINE, '../../..');
export const FFMPEG = path.join(ENGINE, 'node_modules/ffmpeg-static/ffmpeg');
export const rel = (p) => path.relative(ROOT, path.resolve(p)).split(path.sep).join('/');

// Brian (ElevenLabs) — the series narrator. Never substitute another voice.
export const BRIAN_VOICE_ID = process.env.ELEVENLABS_BRIAN_VOICE_ID || 'nPczCjzI2devNBz1zQrb';

export function loadEpisode(epDir) {
  const file = path.join(epDir, 'episode.json');
  if (!fs.existsSync(file)) throw new Error(`no episode.json in ${epDir}`);
  const ep = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const k of ['number', 'slug', 'title', 'player', 'card', 'beats', 'sources']) {
    if (ep[k] == null) throw new Error(`episode.json missing "${k}"`);
  }
  return ep;
}

// The collectible card this episode unlocks. It lives in the app's public folder
// so the same PNG is both the in-video reveal and the album art.
export const cardArtPath = (ep) => path.join(ROOT, 'public/legend-cards/deep-dive', `${ep.slug}.png`);
export const outputName = (ep) =>
  `DidYouKnow_${String(ep.number).padStart(2, '0')}_${ep.player.name.replace(/[^A-Za-z0-9]+/g, '_')}.mp4`;
