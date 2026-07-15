import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const ROOT = process.cwd();
const PORT = 8131;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]); if (rel === '/') rel = '/thumbnail.html';
  const fp = path.join(ROOT, path.normalize(rel));
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGEERROR:', e.message));
await page.goto(`http://127.0.0.1:${PORT}/thumbnail.html`, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: 'thumbnail.png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
console.log('THUMB OK');
await browser.close(); server.close(); process.exit(0);
