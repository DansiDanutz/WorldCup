// Pre-extract every clip's frames at FPS via ffmpeg (a real decoder), so the
// browser can play them as an IMAGE SEQUENCE. Headless Chromium cannot seek-decode
// <video> frames (it freezes on frame 0), so we never rely on <video> for capture.
// Writes assets/seq/<base>/NNNNN.jpg + assets/seq/manifest.json {base:{n,fps}}.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const FPS = Number(process.env.FPS || 30);
const { clips } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));
const srcs = [...new Set(clips.map((c) => c.src))].filter((s) => fs.existsSync(s));
fs.mkdirSync('assets/seq', { recursive: true });
const manifest = {};

for (const src of srcs) {
  const base = src.replace(/^assets\//, '').replace(/\.mp4$/, '');
  const dir = `assets/seq/${base}`;
  fs.mkdirSync(dir, { recursive: true });
  // clean stale
  for (const f of fs.readdirSync(dir)) fs.unlinkSync(`${dir}/${f}`);
  const r = spawnSync(ffmpeg, [
    '-y', '-i', src,
    '-vf', `fps=${FPS},scale=1280:-2:flags=bicubic`,
    '-qscale:v', '3',
    `${dir}/%05d.jpg`,
  ], { encoding: 'utf8' });
  const n = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).length;
  manifest[base] = { n, fps: FPS };
  console.log(`${base.padEnd(26)} ${n} frames  ${r.status === 0 ? 'ok' : 'FFMPEG-ERR'}`);
}
fs.writeFileSync('assets/seq/manifest.json', JSON.stringify(manifest));
console.log('manifest:', Object.keys(manifest).length, 'clips,', Object.values(manifest).reduce((a, b) => a + b.n, 0), 'total frames');
