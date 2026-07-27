// Builds the 23 brand cards: card.html --(Playwright frame-exact)--> PNGs
// --(ffmpeg)--> hf/<id>.mp4 (h264 yuv420p 1920x1080, exact slot duration).
// Animation runs ~4.2s then the LAST frame is held (tpad clone) to the slot
// duration, so VideoSprite never loops a count-up mid-slot.
// Run: node hf/build-cards.mjs   (from the project root)
import { chromium } from 'playwright';
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const FPS = 30, ANIM = 4.2;
const spec = JSON.parse(fs.readFileSync(path.join(HERE, 'cards-spec.json'), 'utf8'));
const only = process.argv[2]; // optional: build a single card id

// Sandbox note: the pinned Playwright build may not match the pre-installed
// browsers — fall back to the shared /opt/pw-browsers binary when present.
const shared = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(
  fs.existsSync(shared) ? { executablePath: shared } : {},
);
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

for (const card of spec.cards) {
  if (only && card.id !== only) continue;
  const out = path.join(HERE, `${card.id}.mp4`);
  const fdir = path.join(HERE, `_frames-${card.id}`);
  fs.rmSync(fdir, { recursive: true, force: true });
  fs.mkdirSync(fdir, { recursive: true });

  const u = url.pathToFileURL(path.join(HERE, 'card.html')).href +
    '?spec=' + encodeURIComponent(JSON.stringify(card));
  await page.goto(u, { waitUntil: 'load' });

  const frames = Math.round(ANIM * FPS);
  for (let f = 0; f <= frames; f++) {
    await page.evaluate((t) => window.__setT(t), f / FPS);
    await page.screenshot({ path: path.join(fdir, `f${String(f).padStart(4, '0')}.png`) });
  }
  const hold = Math.max(0, card.dur - ANIM);
  execFileSync(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.png'),
    '-vf', `tpad=stop_mode=clone:stop_duration=${hold.toFixed(2)}`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out,
  ], { stdio: 'pipe' });
  fs.rmSync(fdir, { recursive: true, force: true });
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`built ${card.id}.mp4  dur=${card.dur}s  ${mb}MB`);
}
await browser.close();
console.log('all cards done');
