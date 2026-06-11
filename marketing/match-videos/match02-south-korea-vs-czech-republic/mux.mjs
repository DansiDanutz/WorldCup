// Final assembly for the Match 2 video:
//   frames/  (from render.mjs)
// + audio/line_NN.mp3  (Brian VO from gen_audio.mjs)
// + music/anthem-source.mp4 -> looped, side-chain ducked background anthem
// + each generated clip's own crowd/FX audio at its clips.json timeline slot
// -> WorldCup26_Match02_KOR_CZE.mp4 (H.264/AAC, 1920x1080)
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const FPS = Number(process.env.FPS || 30);
const DURATION = Number(process.env.DURATION || 300);
const OUT = process.env.OUTFILE || 'WorldCup26_Match02_KOR_CZE.mp4';
const NO_VO = process.env.NO_VO === '1'; // music+FX preview before the ElevenLabs pass

const { lines } = JSON.parse(fs.readFileSync('narration.json', 'utf8'));
const { clips, music } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));

function durOf(f) {
  const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error('no duration for ' + f);
  return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
}

// ── Prep: extract the anthem audio once (music/bgm.m4a) ─────────────────────
const bgmSrc = 'music/anthem-source.mp4';
const bgm = music?.src || 'music/bgm.m4a';
if (!fs.existsSync(bgm) && fs.existsSync(bgmSrc)) {
  console.log('extracting background anthem ->', bgm);
  execFileSync(ffmpegPath, ['-y', '-i', bgmSrc, '-vn', '-c:a', 'aac', '-b:a', '192k', bgm], { stdio: 'inherit' });
}
const hasBgm = fs.existsSync(bgm);
if (!hasBgm) console.warn('WARNING: no background music found at', bgm, '- muxing without it');

// ── Inputs ──────────────────────────────────────────────────────────────────
// input 0: frames; then VO lines; then clip audios; then bgm (last).
const inputs = ['-framerate', String(FPS), '-start_number', '0', '-i', 'frames/f_%05d.jpg'];
const voFiles = NO_VO ? [] : lines.map((_, i) => `audio/line_${String(i).padStart(2, '0')}.mp3`);
for (const f of voFiles) inputs.push('-i', f);
const clipFiles = clips.filter(c => fs.existsSync(c.src) && (c.vol ?? 0) > 0);
for (const c of clipFiles) inputs.push('-i', c.src);
if (hasBgm) inputs.push('-stream_loop', '-1', '-i', bgm);

const chains = [];
const mixes = [];

// ── Brian VO: time-fit each line to its slot (same approach as the 90s ad) ──
if (!NO_VO) {
  const durs = voFiles.map(durOf);
  const voLabels = [];
  for (let i = 0; i < lines.length; i++) {
    const at = lines[i].at;
    const nextAt = i < lines.length - 1 ? lines[i + 1].at : DURATION;
    const budget = (nextAt - at) - 0.25;
    let tempo = budget > 0.3 ? durs[i] / budget : 1;
    tempo = Math.min(1.4, Math.max(0.95, tempo)); // only fit when spilling; keep Brian natural
    if (tempo < 1) tempo = 1;                      // never slow him down on a 300s bed
    const ms = Math.round(at * 1000);
    const idx = i + 1;
    let c = `[${idx}:a]`;
    if (Math.abs(tempo - 1) > 0.02) c += `atempo=${tempo.toFixed(4)},`;
    c += `adelay=${ms}:all=1,aresample=44100[v${i}]`;
    chains.push(c);
    voLabels.push(`[v${i}]`);
    console.log(`VO ${String(i).padStart(2)}: at ${at}s dur ${durs[i].toFixed(2)}s budget ${budget.toFixed(2)}s tempo ${tempo.toFixed(3)}`);
  }
  chains.push(`${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[vo]`);
}

// ── Clip FX audio at their timeline slots ────────────────────────────────────
const fxLabels = [];
clipFiles.forEach((c, k) => {
  const idx = 1 + voFiles.length + k;
  const ms = Math.round(c.at * 1000);
  // play the clip's own sound once (5-10s), faded out so loops don't pop
  chains.push(`[${idx}:a]volume=${(c.vol ?? 0.4).toFixed(2)},afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0.5, Math.min(c.dur, 10) - 1).toFixed(2)}:d=1,adelay=${ms}:all=1,aresample=44100[f${k}]`);
  fxLabels.push(`[f${k}]`);
});
if (fxLabels.length) {
  chains.push(`${fxLabels.join('')}amix=inputs=${fxLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[fx]`);
}

// ── Background anthem: loop for 300s, duck under the VO ─────────────────────
if (hasBgm) {
  const bgmIdx = 1 + voFiles.length + clipFiles.length;
  const vol = (music?.vol ?? 0.4).toFixed(2);
  chains.push(`[${bgmIdx}:a]atrim=0:${DURATION},volume=${vol},afade=t=in:st=0:d=1.5,afade=t=out:st=${DURATION - 3}:d=3,aresample=44100[bgraw]`);
  if (!NO_VO) {
    chains.push(`[vo]asplit=2[voa][vob]`);
    chains.push(`[bgraw][vob]sidechaincompress=threshold=0.02:ratio=6:attack=120:release=600:makeup=1[bg]`);
    mixes.push('[voa]', '[bg]');
  } else {
    mixes.push('[bgraw]');
  }
} else if (!NO_VO) {
  mixes.push('[vo]');
}
if (fxLabels.length) mixes.push('[fx]');

chains.push(`${mixes.join('')}amix=inputs=${mixes.length}:normalize=0:dropout_transition=0[mx];` +
            `[mx]alimiter=limit=0.97,apad,atrim=0:${DURATION},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

// crop the stray sub-pixel row so dimensions are even (libx264 needs even w/h)
chains.push(`[0:v]crop=1920:1080:0:0,fps=${FPS},format=yuv420p[vout]`);

const filter = chains.join(';');
fs.writeFileSync('filter.txt', filter);

const args = [
  '-y',
  ...inputs,
  '-filter_complex', filter,
  '-map', '[vout]', '-map', '[aout]',
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
