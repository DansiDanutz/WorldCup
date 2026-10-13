// finish.mjs <episode-dir> — frame-gap check -> encode -> mux -> QA -> the MP4.
// Frames render at 1920x1081, so the crop is mandatory (libx264 needs even sizes).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { FFMPEG, loadEpisode, outputName } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const B = path.join(epDir, 'build');
const film = JSON.parse(fs.readFileSync(path.join(B, 'film.json'), 'utf8'));
const FPS = 30, want = Math.round(film.duration * FPS);
const frames = path.join(B, 'frames');
const have = new Set(fs.readdirSync(frames).filter((f) => /^f_\d+\.jpg$/.test(f)).map((f) => +f.slice(2, -4)));
const missing = []; for (let i = 0; i < want; i++) if (!have.has(i)) missing.push(i);
if (missing.length) { console.error(`frames incomplete: ${missing.length} missing, first ${missing[0]}`); process.exit(1); }

const video = path.join(B, 'video_full.mp4');
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', '0',
  '-i', path.join(frames, 'f_%05d.jpg'), '-vf', 'crop=1920:1080:0:0', '-c:v', 'libx264', '-preset', 'medium',
  '-crf', '20', '-pix_fmt', 'yuv420p', video], { stdio: 'inherit' });
const name = film.preview ? outputName(ep).replace('.mp4', '_PREVIEW.mp4') : outputName(ep);
const OUT = path.join(epDir, 'output', name);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', video, '-i', path.join(B, 'audio_master.m4a'),
  '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy', '-t', String(film.duration),
  '-movflags', '+faststart', OUT], { stdio: 'inherit' });

// ── QA ────────────────────────────────────────────────────────────────────────
const probe = spawnSync(FFMPEG, ['-i', OUT], { encoding: 'utf8' }).stderr;
console.log('\n=== QA', path.basename(OUT), '===');
console.log(probe.match(/Duration:.*/)[0]);
probe.match(/Stream #0:\d.*/g).forEach((s) => console.log(s.trim()));
console.log(`size: ${(fs.statSync(OUT).size / 1048576).toFixed(1)} MB`);
const vol = spawnSync(FFMPEG, ['-i', OUT, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
console.log(vol.match(/mean_volume.*/)[0].trim(), '|', vol.match(/max_volume.*/)[0].trim());
const qa = path.join(B, 'qa'); fs.mkdirSync(qa, { recursive: true });
let bad = 0;
for (const at of [3, film.duration * 0.25, film.duration * 0.5, film.duration * 0.75, film.duration - 6]) {
  const p = path.join(qa, `t${Math.round(at)}.jpg`);
  spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(at), '-i', OUT, '-frames:v', '1', '-q:v', '2', p]);
  const kb = Math.round(fs.statSync(p).size / 1024);
  if (kb <= 60) bad++;
  console.log(`  ${String(Math.round(at)).padStart(4)}s  ${String(kb).padStart(4)} KB  ${kb > 60 ? 'ok' : 'SUSPECT (flat/black?)'}`);
}
if (bad) { console.error('QA: suspect frames — inspect build/qa before delivering'); process.exit(1); }
fs.rmSync(video);
console.log('\nDONE ->', OUT);
