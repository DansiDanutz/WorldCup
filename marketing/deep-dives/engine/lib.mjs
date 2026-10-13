// Shared paths + episode loading for the Deep Dive engine.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

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

// The clip library: paid generations we already own (library/clips.json), each
// with who it shows. Episodes reference clips by alias.
export const LIBRARY = path.join(ROOT, 'marketing/deep-dives/library/clips.json');
export const loadLibrary = () => JSON.parse(fs.readFileSync(LIBRARY, 'utf8'));

// A beat is either one drawn scene (`scene`, or a list that splits the beat) or a
// list of `shots`: {clip, rate?, offset?, tag?, over?} plays a library clip (with an
// optional drawn overlay on top), {scene} plays a drawn scene. `w` weights a shot's
// share of the beat (default 1). Returns [{share, clip?, scene?, ...}] in order.
export function beatShots(beat) {
  const shots = beat.shots || (Array.isArray(beat.scene) ? beat.scene : [beat.scene]).map((scene) => ({ scene }));
  const total = shots.reduce((n, s) => n + (s.w || 1), 0);
  return shots.map((s) => ({ ...s, share: (s.w || 1) / total }));
}
// the drawn scenes of a beat: standalone scenes plus overlays on clips
export const beatScenes = (beat) => beatShots(beat).flatMap((s) => (s.scene ? [s.scene] : s.over ? [s.over] : []));
// slowest we let a clip play to fill its shot (a clip may set its own `minRate`)
export const MIN_RATE = 0.5;

// IDENTITY LAW (owner, 13 Oct 2026: "how can you add images that don't look like Messi
// and Yamal in a video about Messi and Yamal?"). A real person appears ONLY through a
// library clip whose `who` is that person (owner-approved). Every other clip either
// shows no identifiable face (`faces: none|crowd`) or, if it shows a player
// (`faces: player`, who null), may only run while the narration names nobody.
// episode.json `people` maps each spoken name to its `who` key (or null when we have
// no approved likeness). Returns the who-keys a beat's VO names.
export function namedIn(ep, vo) {
  return Object.entries(ep.people || {}).filter(([name]) => vo.toLowerCase().includes(name.toLowerCase()))
    .map(([name, who]) => who || `unapproved:${name}`);
}

// a still from a library clip (a face panel or the thumbnail), cropped as fractions
export function clipFrame(clip, t, crop, out) {
  const [x, y, w, h] = crop || [0, 0, 1, 1];
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(t || 0), '-i', path.join(ROOT, clip.src), '-frames:v', '1',
    '-vf', `crop=iw*${w}:ih*${h}:iw*${x}:ih*${y}`, out]);
  return out;
}
