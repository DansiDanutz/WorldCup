// make-art.mjs <episode-dir> — renders the episode's album card
// (public/legend-cards/deep-dive/<slug>.png, 1080x1920) and YouTube thumbnail
// (<episode>/output/thumbnail.jpg, 1280x720) from art.html. Code-drawn, no faces.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { ENGINE, loadEpisode, cardArtPath } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const P = ep.player;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function shoot(mode, out, size) {
  const page = await browser.newPage({ viewport: size });
  await page.addInitScript((a) => { window.__ART = a; }, {
    mode, name: P.short, number: P.number, colors: P.colors, hook: ep.thumbnail.hook,
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
