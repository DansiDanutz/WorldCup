// Cut 2-3 vertical Shorts (1080x1920) from the finished episode master.
// Layout: blurred zoomed copy as background + the full 16:9 frame inset,
// bold headline on top, channel CTA band at the bottom.
// ffmpeg-static has no drawtext (no freetype), so the text layer is rendered
// to a transparent PNG with Playwright/Chromium and composited via overlay.
// Usage: node gen_shorts.mjs [master.mp4]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import ffmpegPath from 'ffmpeg-static';
import { chromium } from 'playwright';

const MASTER = process.argv[2] || 'WorldCup26_Match03_CAN_BIH_upload.mp4';

const SHORTS = [
  { out: 'short1_who_is_he.mp4', from: 0.0, to: 16.0,
    head: 'WHO<br>IS HE?' },
  { out: 'short2_the_save.mp4', from: 186.0, to: 215.0,
    head: 'DAVIES<br>DETONATES' },
  { out: 'short3_maple_leaf_man.mp4', from: 254.0, to: 274.0,
    head: 'THE MAPLE<br>LEAF MAN' },
];

// ── 1. Render the text overlays (1080x1920, transparent) ────────────────────
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
for (let i = 0; i < SHORTS.length; i++) {
  const s = SHORTS[i];
  await page.setContent(`<!doctype html><html><body style="margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden">
    <div style="position:absolute;top:170px;left:0;right:0;text-align:center;
      font-family:'DejaVu Sans',sans-serif;font-weight:bold;font-size:96px;line-height:1.12;
      color:#FFD24A;-webkit-text-stroke:5px #000;paint-order:stroke fill;
      text-shadow:0 6px 30px rgba(0,0,0,0.85)">${s.head}</div>
    <div style="position:absolute;bottom:280px;left:0;right:0;text-align:center;
      font-family:'DejaVu Sans',sans-serif;font-weight:bold;font-size:46px;
      color:#fff;-webkit-text-stroke:4px #000;paint-order:stroke fill;
      text-shadow:0 4px 20px rgba(0,0,0,0.85)">FULL EPISODE ON THE CHANNEL</div>
    <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;
      font-family:'DejaVu Sans',sans-serif;font-weight:bold;font-size:42px;
      color:#7fd6b5;-webkit-text-stroke:4px #000;paint-order:stroke fill;
      text-shadow:0 4px 20px rgba(0,0,0,0.85)">worldcup26.world</div>
  </body></html>`);
  await page.screenshot({ path: `overlay_short${i + 1}.png`, omitBackground: true });
}
await browser.close();

// ── 2. Cut + composite each Short ────────────────────────────────────────────
SHORTS.forEach((s, i) => {
  const dur = (s.to - s.from).toFixed(2);
  const filter =
    `[0:v]split=2[bgs][fgs];` +
    `[bgs]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.18[bg];` +
    `[fgs]scale=1080:-2[fg];` +
    `[bg][fg]overlay=0:560[v1];` +
    `[v1][1:v]overlay=0:0[vout]`;
  console.log('cutting', s.out, `${s.from}-${s.to}s`);
  execFileSync(ffmpegPath, [
    '-y', '-loglevel', 'error',
    '-ss', String(s.from), '-t', dur, '-i', MASTER,
    '-i', `overlay_short${i + 1}.png`,
    '-filter_complex', filter,
    '-map', '[vout]', '-map', '0:a',
    '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k',
    '-movflags', '+faststart',
    s.out,
  ], { stdio: 'inherit' });
  fs.rmSync(`overlay_short${i + 1}.png`);
});
console.log('SHORTS DONE');
