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
  viewport: { width: 1080, height: 1984 },
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
  await page.evaluate((tt) => new Promise((res) => {
    window.__seek(tt);
    requestAnimationFrame(() => requestAnimationFrame(() => res()));
  }), t);
  // A freshly-mounted clip screenshots black until it has decoded data — wait for
  // every on-screen <video> to reach readyState>=2 (HAVE_CURRENT_DATA) with real
  // dimensions BEFORE the seek wait, so the first frame of each clip is never black.
  // readyState>=2 (data present) AND currentTime>0.1 (the seek to 0.2s actually
  // landed — not still at 0 from a cold mount) AND real dimensions.
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('video')).every((v) => v.readyState >= 2 && v.videoWidth > 0 && v.currentTime > 0.1),
    { timeout: 8000 },
  ).catch(() => {});
  // Wait for any video clips on screen to land on their exact frame.
  await page.waitForFunction(() => window.__videosSettled(), { timeout: 5000 }).catch(() => {});
  // Re-assert the seek now that data is present, then let it paint.
  await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res()))));
  // Wait for any on-screen <img> (e.g. squad montage stills) to finish loading,
  // otherwise freshly-mounted images screenshot blank.
  await page.waitForFunction(
    () => Array.from(document.images).every((im) => im.complete && im.naturalWidth > 0),
    { timeout: 4000 },
  ).catch(() => {});
  await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => res())));
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
  const END = process.env.END ? Math.min(total, Number(process.env.END)) : total; // parallel chunking
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
      console.log(`frame ${i}/${total}  t=${t.toFixed(2)}s  (${el.toFixed(1)}s, ${((i - START) / Math.max(el, 0.001)).toFixed(1)} fps)`);
    }
  }
  console.log(`DONE ${total - START} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await browser.close();
