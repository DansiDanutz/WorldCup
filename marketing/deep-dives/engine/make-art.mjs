// make-art.mjs <episode-dir> — renders the episode's album card
// (public/legend-cards/deep-dive/<slug>.png, 1080x1920) and YouTube thumbnail
// (<episode>/output/thumbnail.jpg, 1280x720) from art.html. The thumbnail can put
// faces on it: `thumbnail.faces` = [{clip, t, crop: [x, y, w, h]}] grabs a frame of a
// library clip (crop as fractions; keep kit logos and crests out of the crop).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { ENGINE, ROOT, FFMPEG, loadEpisode, cardArtPath, loadLibrary } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const P = ep.player;
const LIB = loadLibrary();
const faces = (ep.thumbnail.faces || []).map((f, i) => {
  const c = LIB[f.clip];
  if (!c) throw new Error(`thumbnail face clip "${f.clip}" is not in the library`);
  const [x, y, w, h] = f.crop || [0, 0, 1, 1];
  const out = path.join(epDir, 'build', `thumb_face_${i}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(f.t || 0), '-i', path.join(ROOT, c.src), '-frames:v', '1',
    '-vf', `crop=iw*${w}:ih*${h}:iw*${x}:ih*${y}`, out]);
  return 'file://' + out;
});
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function shoot(mode, out, size) {
  const page = await browser.newPage({ viewport: size });
  await page.addInitScript((a) => { window.__ART = a; }, {
    mode, name: P.short, number: P.number, colors: P.colors, hook: ep.thumbnail.hook, faces,
  });
  await page.goto('file://' + path.join(ENGINE, 'art.html'));
  await page.waitForFunction(() => window.__artReady === true);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.locator('#art').screenshot({ path: out, ...(out.endsWith('.jpg') ? { type: 'jpeg', quality: 92 } : {}) });
  await page.close();
  console.log(mode, '->', path.relative(process.cwd(), out));
}

await shoot('card', cardArtPath(ep), { width: 1080, height: 1920 });
await shoot('thumb', path.join(epDir, 'output', 'thumbnail.jpg'), { width: 1280, height: 720 });
await browser.close();
