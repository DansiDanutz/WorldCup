// Frame-perfect renderer for the Match 2 video.
// Drives window.__seek(t) and screenshots #stage-canvas (1920x1080) per frame.
// Unlike the plain ad renderer, this waits for every mounted <video> clip to
// finish seeking (window.__videosSettled) so generated clips are frame-exact.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HTML = process.env.URL || 'http://127.0.0.1:8098/match.html';
const EXEC = process.env.CHROMIUM_PATH || undefined;
const FPS = Number(process.env.FPS || 30);
const DURATION = Number(process.env.DURATION || 300);
const OUT = process.env.OUT || 'frames';
const START = Number(process.env.START || 0); // resume support: first frame index
const SHOTS = process.env.SHOTS ? process.env.SHOTS.split(',').map(Number) : null;
const QUALITY = Number(process.env.QUALITY || 92);

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb',
         '--hide-scrollbars', '--disable-dev-shm-usage', '--ignore-certificate-errors',
         '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1124 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true,
});
page.on('pageerror', e => console.error('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto(HTML, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => typeof window.__seek === 'function', { timeout: 60000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.addStyleTag({ content: `
  #stage-canvas{ transform:none !important; box-shadow:none !important; }
` });
await page.waitForTimeout(400);

const canvas = page.locator('#stage-canvas');

async function frameAt(t) {
  // 1) advance the scene timeline (swaps every ClipSprite to its exact image-
  //    sequence frame for this t — deterministic, no <video> seeking involved)
  await page.evaluate((tt) => new Promise((res) => {
    window.__seek(tt);
    requestAnimationFrame(() => requestAnimationFrame(() => res()));
  }), t);
  // 2) wait for the freshly-swapped sequence frames to fully decode before capture
  await page.evaluate(() => Promise.all(
    Array.prototype.slice.call(document.querySelectorAll('img[data-seq]'))
      .map((i) => (i.complete && i.naturalWidth > 0) ? Promise.resolve() : (i.decode ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; })))
  )).catch(() => {});
  // 3) one more rAF so the decoded frames are painted
  await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
}

if (SHOTS) {
  for (const t of SHOTS) {
    await frameAt(t);
    const f = path.join(OUT, `shot_${String(t).padStart(5, '0')}.png`);
    await canvas.screenshot({ path: f });
    console.log('shot', t, '->', f);
  }
} else {
  const total = Math.round(DURATION * FPS);
  const END = process.env.END ? Math.min(Number(process.env.END), total) : total;
  const t0 = Date.now();
  for (let i = START; i < END; i++) {
    const t = Math.min(DURATION - 1e-3, i / FPS);
    await frameAt(t);
    await canvas.screenshot({
      path: path.join(OUT, `f_${String(i).padStart(5, '0')}.jpg`),
      type: 'jpeg', quality: QUALITY,
    });
    if (i % 100 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${i}/${END}  t=${t.toFixed(2)}s  (${el.toFixed(1)}s, ${((i - START) / Math.max(el, 0.001)).toFixed(1)} fps)`);
    }
  }
  console.log(`DONE ${END - START} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await browser.close();
