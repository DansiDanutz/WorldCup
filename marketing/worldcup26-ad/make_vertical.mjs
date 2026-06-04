// Reframe the 16:9 ad into a 1080x1920 (9:16) TikTok cut: the ad plays as a
// centered card over a blurred, brand-tinted backdrop, with a transparent
// brand overlay (overlay.png: wordmark + CTA + accent lines) composited on top.
// Audio is taken from the source. Build overlay.png first via render_overlay.mjs.
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const IN = process.env.INPUT || 'WorldCup26_Ad.mp4';
const OVERLAY = process.env.OVERLAY || 'overlay.png';
const OUT = process.env.OUTFILE || 'WorldCup26_Ad_TikTok.mp4';

// card: full-width 1080, height 608 (16:9), centered vertically at y=656.
const filter = [
  `[0:v]split=2[a][b]`,
  `[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.08:saturation=1.08[bg]`,
  `[b]scale=1080:-2[card]`,
  `[bg][card]overlay=x=0:y=656[base]`,
  `[base][1:v]overlay=x=0:y=0,setsar=1[vout]`,
].join(';');

const args = [
  '-y', '-i', IN, '-i', OVERLAY,
  '-filter_complex', filter,
  '-map', '[vout]', '-map', '0:a',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart',
  OUT,
];
console.log('ffmpeg ->', OUT);
execFileSync(ffmpegPath, args, { stdio: 'inherit' });
console.log('TIKTOK DONE ->', OUT);
