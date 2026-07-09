import pkg from './node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch({ args: ['--no-sandbox','--disable-gpu','--force-color-profile=srgb','--hide-scrollbars','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto('file://' + process.cwd() + '/scorechip.html', { waitUntil: 'load', timeout: 60000 });
try { await p.evaluate(() => document.fonts.ready); } catch {}
await p.waitForTimeout(400);
await p.screenshot({ path: 'scorechip.png', omitBackground: true });
await b.close();
console.log('CHIP_DONE');
