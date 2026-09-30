// Encode -> mux -> QA in one pass, once frames/ is complete.
// Frames render at 1920x1081, so the crop is mandatory (libx264 needs even dimensions).
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
const F = 'node_modules/ffmpeg-static/ffmpeg';
const film = JSON.parse(fs.readFileSync('film.json', 'utf8'));
const D = film.duration, FPS = 30;
const OUT = 'FORGOTTEN_Vol1_Ten_World_Cup_Legends.mp4';
const want = Math.round(D * FPS);

const have = fs.readdirSync('frames').filter(f => /^f_\d+\.jpg$/.test(f)).length;
if (have < want) { console.error(`frames incomplete: ${have}/${want}`); process.exit(1); }
const idx = new Set(fs.readdirSync('frames').filter(f => /^f_\d+\.jpg$/.test(f)).map(f => +f.slice(2, -4)));
const missing = []; for (let i = 0; i < want; i++) if (!idx.has(i)) missing.push(i);
if (missing.length) { console.error(`gaps: ${missing.length}, first ${missing[0]}`); process.exit(1); }
console.log(`frames ok: ${have}`);

console.log('encode ->', 'video_full.mp4');
execFileSync(F, ['-y', '-framerate', String(FPS), '-start_number', '0', '-i', 'frames/f_%05d.jpg',
  '-vf', 'crop=1920:1080:0:0', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-pix_fmt', 'yuv420p', 'video_full.mp4'], { stdio: 'inherit' });

console.log('mux ->', OUT);
execFileSync(F, ['-y', '-i', 'video_full.mp4', '-i', 'audio_master.m4a',
  '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy',
  '-t', String(D), '-movflags', '+faststart', OUT], { stdio: 'inherit' });

// ── QA ──────────────────────────────────────────────────────────────────────
const probe = spawnSync(F, ['-i', OUT], { encoding: 'utf8' }).stderr;
console.log('\n=== QA ===');
console.log(probe.match(/Duration:.*/)[0]);
probe.match(/Stream #0:\d.*/g).forEach(s => console.log(s.trim()));
console.log(`size: ${(fs.statSync(OUT).size / 1048576).toFixed(0)} MB`);
const vol = spawnSync(F, ['-i', OUT, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
console.log(vol.match(/mean_volume.*/)[0].trim(), '|', vol.match(/max_volume.*/)[0].trim());

fs.mkdirSync('qa', { recursive: true });
const spots = [26, 95, 300, film.chapters[5].at + 20, film.duration - 25];
for (const t of spots) {
  const p = `qa/t${Math.round(t)}.jpg`;
  spawnSync(F, ['-y', '-ss', String(t), '-i', OUT, '-frames:v', '1', '-q:v', '2', p]);
  const kb = Math.round(fs.statSync(p).size / 1024);
  console.log(`  ${String(Math.round(t)).padStart(4)}s  ${String(kb).padStart(4)} KB  ${kb > 100 ? 'ok' : 'SUSPECT (too flat/black?)'}`);
}
console.log('\nDONE ->', OUT);
