// Assemble the timed voiceover track and mux it with the rendered frames
// into a final H.264 MP4. Auto-fits any over-long line into its scene gap.
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const FPS = Number(process.env.FPS || 30);
const DURATION = Number(process.env.DURATION || 90);
const OUT = process.env.OUTFILE || 'WorldCup26_Ad.mp4';
const { lines } = JSON.parse(fs.readFileSync('narration.json', 'utf8'));

// duration of an audio file via ffmpeg banner parse
function durOf(f) {
  const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error('no duration for ' + f);
  return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
}

const files = lines.map((_, i) => `audio/line_${String(i).padStart(2, '0')}.mp3`);
const durs = files.map(durOf);

// Build per-line filter chains with auto-fit tempo so a line never spills past
// the next line's start (keeps the VO locked to the on-screen scene cuts).
const chains = [];
const labels = [];
for (let i = 0; i < lines.length; i++) {
  const at = lines[i].at;
  const nextAt = i < lines.length - 1 ? lines[i + 1].at : DURATION;
  const budget = (nextAt - at) - 0.12;
  let tempo = 1;
  if (durs[i] > budget && budget > 0.3) tempo = Math.min(1.8, durs[i] / budget);
  const ms = Math.round(at * 1000);
  const idx = i + 1; // input 0 = frames
  let c = `[${idx}:a]`;
  if (tempo > 1.001) c += `atempo=${tempo.toFixed(4)},`;
  c += `adelay=${ms}:all=1,aresample=44100[a${i}]`;
  chains.push(c);
  labels.push(`[a${i}]`);
  console.log(`line ${i}: at ${at}s dur ${durs[i].toFixed(2)}s budget ${budget.toFixed(2)}s tempo ${tempo.toFixed(3)}`);
}
const mix = `${labels.join('')}amix=inputs=${lines.length}:normalize=0:dropout_transition=0[mx];` +
            `[mx]alimiter=limit=0.97,apad,atrim=0:${DURATION},aformat=channel_layouts=stereo:sample_rates=44100[aout]`;
// crop the stray sub-pixel row so dimensions are even (libx264 needs even w/h)
const vid = `[0:v]crop=1920:1080:0:0,fps=${FPS},format=yuv420p[v]`;
const filter = chains.join(';') + ';' + mix + ';' + vid;
fs.writeFileSync('filter.txt', filter);

const args = [
  '-y',
  '-framerate', String(FPS), '-start_number', '0', '-i', 'frames/f_%05d.jpg',
  ...files.flatMap(f => ['-i', f]),
  '-filter_complex', filter,
  '-map', '[v]', '-map', '[aout]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
  '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(DURATION),
  '-movflags', '+faststart',
  OUT,
];
console.log('ffmpeg muxing ->', OUT);
execFileSync(ffmpegPath, args, { stdio: 'inherit' });
console.log('MUX DONE ->', OUT);
