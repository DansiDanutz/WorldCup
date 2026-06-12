// Cut 2-3 vertical Shorts (1080x1920) from the finished episode master.
// Layout: blurred zoomed copy as background + the full 16:9 frame inset,
// bold headline on top, channel CTA band at the bottom.
// Usage: node gen_shorts.mjs [master.mp4]
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const MASTER = process.argv[2] || 'WorldCup26_Match06_ARG_ALG.mp4';
const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

const SHORTS = [
  { out: 'short1_ghosts.mp4', from: 0.0, to: 16.0,
    head: 'TWO GHOSTS.\\nONE NIGHT.' },
  { out: 'short2_the_save.mp4', from: 205.0, to: 233.5,
    head: 'MINUTE 83.\\nTHE SAVE.' },
  { out: 'short3_legends_duo.mp4', from: 252.5, to: 272.5,
    head: 'LEGENDS\\n006 & 007' },
];

for (const s of SHORTS) {
  const dur = (s.to - s.from).toFixed(2);
  const filter =
    // background: blurred, cropped to fill 1080x1920
    `[0:v]split=2[bgs][fgs];` +
    `[bgs]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.18[bg];` +
    // foreground: the full 16:9 frame, 1080 wide, vertically centered a bit high
    `[fgs]scale=1080:-2[fg];` +
    `[bg][fg]overlay=0:560[v1];` +
    // headline + CTA
    `[v1]drawtext=fontfile=${FONT}:text='${s.head}':fontcolor=#FFD24A:fontsize=92:line_spacing=14:borderw=6:bordercolor=black:x=(w-text_w)/2:y=240,` +
    `drawtext=fontfile=${FONT}:text='FULL EPISODE ON THE CHANNEL':fontcolor=white:fontsize=44:borderw=5:bordercolor=black:x=(w-text_w)/2:y=1560,` +
    `drawtext=fontfile=${FONT}:text='worldcup26.world':fontcolor=#7fd6b5:fontsize=40:borderw=5:bordercolor=black:x=(w-text_w)/2:y=1640[vout]`;
  console.log('cutting', s.out, `${s.from}-${s.to}s`);
  execFileSync(ffmpegPath, [
    '-y', '-loglevel', 'error',
    '-ss', String(s.from), '-t', dur, '-i', MASTER,
    '-filter_complex', filter,
    '-map', '[vout]', '-map', '0:a',
    '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k',
    '-movflags', '+faststart',
    s.out,
  ], { stdio: 'inherit' });
}
console.log('SHORTS DONE');
