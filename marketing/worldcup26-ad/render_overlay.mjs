// Render the transparent 1080x1920 brand overlay (wordmark + CTA + accent
// lines, in Inter) to overlay.png for compositing into the TikTok cut.
import { chromium } from 'playwright';
import path from 'node:path';

const EXEC = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb', '--ignore-certificate-errors'],
});
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true,
});
await page.goto('file://' + path.resolve('overlay.html'), { waitUntil: 'load', timeout: 60000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: 'overlay.png', omitBackground: true });
await browser.close();
console.log('overlay.png written');
