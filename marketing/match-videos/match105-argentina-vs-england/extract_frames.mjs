// extract_frames.mjs — pre-extract every clip in clips.json to a JPG image sequence
// so VideoSprite (match-kit.jsx) can show the exact frame per timeline time in headless
// Chromium (which cannot seek-decode <video>). Writes assets/seq/<name>/NNNNN.jpg and
// assets/seq/manifest.json = { <name>: { n, fps } }.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const FPS = Number(process.env.SEQ_FPS || 15);
const OUTQ = process.env.SEQ_Q || '3';
const { clips } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));
const srcs = [...new Set(clips.map(c => c.src))];
fs.mkdirSync('assets/seq', { recursive: true });
const manifest = {};
for (const src of srcs) {
  if (!fs.existsSync(src)) { console.error('MISSING CLIP', src); process.exit(1); }
  const base = src.replace(/^assets\//, '').replace(/\.mp4$/, '');
  const outdir = `assets/seq/${base}`;
  fs.rmSync(outdir, { recursive: true, force: true });
  fs.mkdirSync(outdir, { recursive: true });
  const r = spawnSync('ffmpeg', ['-y', '-i', src, '-vf', `fps=${FPS},scale=1280:-2:flags=lanczos`,
    '-q:v', OUTQ, `${outdir}/%05d.jpg`], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('ffmpeg failed for', src, r.stderr?.slice(-400)); process.exit(1); }
  const n = fs.readdirSync(outdir).filter(f => f.endsWith('.jpg')).length;
  if (!n) { console.error('no frames for', src); process.exit(1); }
  manifest[base] = { n, fps: FPS };
  console.log(`seq ${base}: ${n} frames @${FPS}fps`);
}
fs.writeFileSync('assets/seq/manifest.json', JSON.stringify(manifest, null, 2));
console.log('EXTRACT DONE:', Object.keys(manifest).length, 'clips');
