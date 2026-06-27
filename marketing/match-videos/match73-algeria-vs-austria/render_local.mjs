// Self-contained renderer: starts an in-process static server AND drives the
// Playwright capture in ONE foreground node process (this environment kills any
// backgrounded `&` child, so serve+render must live in a single process).
// Env: SHOTS="t1,t2" (spot) OR START/END frame indices (full). FPS, DURATION, OUT.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 8099);
const FPS = Number(process.env.FPS || 30);
const DURATION = Number(process.env.DURATION || 318.05);
const OUT = process.env.OUT || 'frames';
const START = Number(process.env.START || 0);
const QUALITY = Number(process.env.QUALITY || 92);
const SHOTS = process.env.SHOTS ? process.env.SHOTS.split(',').map(Number) : null;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.jsx': 'text/babel; charset=utf-8', '.json': 'application/json; charset=utf-8', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  try {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/match.html';
    const fp = path.join(ROOT, path.normalize(rel));
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
console.log('in-process server on', PORT);

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb', '--hide-scrollbars', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1124 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
page.on('pageerror', e => console.error('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });
const PAGE = process.env.PAGE || 'match.html';
await page.goto(`http://127.0.0.1:${PORT}/${PAGE}`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => typeof window.__seek === 'function', { timeout: 60000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.addStyleTag({ content: `#stage-canvas{ transform:none !important; box-shadow:none !important; }` });
await page.waitForTimeout(400);
const canvas = page.locator('#stage-canvas');

async function frameAt(t) {
  await page.evaluate((tt) => new Promise((res) => { window.__seek(tt); requestAnimationFrame(() => requestAnimationFrame(() => res())); }), t);
  await page.evaluate(() => {
    const imgs = Array.prototype.slice.call(document.querySelectorAll('img[data-seq]'));
    return Promise.all(imgs.map((i) => {
      if (i.complete && i.naturalWidth > 0) return Promise.resolve();
      if (i.decode) return i.decode().catch(() => {});
      return new Promise((r) => { i.onload = r; i.onerror = r; });
    }));
  }).catch(() => {});
  await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
}

if (SHOTS) {
  for (const t of SHOTS) { await frameAt(t); const f = path.join(OUT, `shot_${String(t).padStart(5, '0')}.png`); await canvas.screenshot({ path: f }); console.log('shot', t, '->', f); }
} else {
  const total = Math.round(DURATION * FPS);
  const END = process.env.END ? Math.min(Number(process.env.END), total) : total;
  const t0 = Date.now();
  for (let i = START; i < END; i++) {
    const t = Math.min(DURATION - 1e-3, i / FPS);
    await frameAt(t);
    await canvas.screenshot({ path: path.join(OUT, `f_${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: QUALITY });
    if (i % 100 === 0) { const el = (Date.now() - t0) / 1000; console.log(`frame ${i}/${END}  t=${t.toFixed(2)}s  (${el.toFixed(1)}s, ${((i - START) / Math.max(el, 0.001)).toFixed(1)} fps)`); }
  }
  console.log(`DONE ${END - START} frames`);
}
await browser.close();
server.close();
console.log('RENDER_LOCAL_DONE');
process.exit(0);
