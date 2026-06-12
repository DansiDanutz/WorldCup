// Final assembly for the Match 2 video:
//   frames/  (from render.mjs)
// + audio/line_NN.mp3  (Brian VO from gen_audio.mjs)
// + music cues from clips.json (looped/trimmed, side-chain ducked under the VO)
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
const { clips, music, sfx } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));

function durOf(f) {
  const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error('no duration for ' + f);
  return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
}

// ── Inputs (audio stage) ─────────────────────────────────────────────────────
// Stage 1 mixes audio only; stage 2 encodes the frames and muxes the result.
// (A single graph pairing the image2 sequence with 50+ audio inputs can
// deadlock ffmpeg's demuxer pacing near the tail - hence the two stages.)
const inputs = [];
const voFiles = NO_VO ? [] : lines.map((_, i) => `audio/line_${String(i).padStart(2, '0')}.mp3`);
for (const f of voFiles) inputs.push('-i', f);
const clipFiles = clips.filter(c => fs.existsSync(c.src) && (c.vol ?? 0) > 0);
for (const c of clipFiles) inputs.push('-i', c.src);
const hits = (sfx?.hits || []).filter(h => fs.existsSync(h.src));
for (const h of hits) inputs.push('-i', h.src);
const cues = (music?.cues || []).filter(c => fs.existsSync(c.src));
for (const c of cues) {
  // finite loop count (enough repeats to cover the window) - an infinite
  // -stream_loop can wedge amix at EOF time
  if (c.loop) inputs.push('-stream_loop', String(Math.max(1, Math.ceil(c.dur / 60))));
  inputs.push('-i', c.src);
}

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
    // NATURAL SPEED ALWAYS: lines are written/regenerated to fit their slots,
    // never tempo-stretched (Ep2 lesson: stretching is audible and amateurish).
    const tempo = 1;
    if (durs[i] > budget + 0.05) console.warn(`  WARNING line ${i} over budget by ${(durs[i]-budget).toFixed(2)}s - shorten & regen`);
    const ms = Math.round(at * 1000);
    const idx = i;
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
  const idx = voFiles.length + k;
  const ms = Math.round(c.at * 1000);
  // play the clip's own sound once (5-10s), faded out so loops don't pop
  chains.push(`[${idx}:a]volume=${(c.vol ?? 0.4).toFixed(2)},afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0.5, Math.min(c.dur, 10) - 1).toFixed(2)}:d=1,adelay=${ms}:all=1,aresample=44100[f${k}]`);
  fxLabels.push(`[f${k}]`);
});
if (fxLabels.length) {
  chains.push(`${fxLabels.join('')}amix=inputs=${fxLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[fx]`);
}

// ── Sound design hits (ElevenLabs SFX) at their story beats ──────────────────
if (hits.length) {
  const hitLabels = [];
  hits.forEach((h, k) => {
    const idx = voFiles.length + clipFiles.length + k;
    chains.push(`[${idx}:a]volume=${(h.vol ?? 0.6).toFixed(2)},adelay=${Math.round(h.at * 1000)}:all=1,aresample=44100[s${k}]`);
    hitLabels.push(`[s${k}]`);
  });
  chains.push(`${hitLabels.join('')}amix=inputs=${hitLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[sfxmix]`);
}

// ── Music score: each cue looped/trimmed to its window, then mixed ──────────
if (cues.length) {
  const cueLabels = [];
  cues.forEach((c, k) => {
    const idx = voFiles.length + clipFiles.length + hits.length + k;
    const ms = Math.round(c.at * 1000);
    const fi = c.fadeIn ?? 1.5, fo = c.fadeOut ?? 3;
    chains.push(
      `[${idx}:a]atrim=0:${c.dur},volume=${(c.vol ?? 0.4).toFixed(2)},` +
      `afade=t=in:st=0:d=${fi},afade=t=out:st=${(c.dur - fo).toFixed(2)}:d=${fo},` +
      `adelay=${ms}:all=1,aresample=44100[m${k}]`
    );
    cueLabels.push(`[m${k}]`);
  });
  chains.push(`${cueLabels.join('')}amix=inputs=${cueLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[bgraw]`);
  if (!NO_VO) {
    chains.push(`[vo]asplit=2[voa][vob]`);
    chains.push(`[bgraw][vob]sidechaincompress=threshold=0.02:ratio=5:attack=120:release=700:makeup=1[bg]`);
    mixes.push('[voa]', '[bg]');
  } else {
    mixes.push('[bgraw]');
  }
} else if (!NO_VO) {
  mixes.push('[vo]');
}
if (fxLabels.length) mixes.push('[fx]');
if (hits.length) mixes.push('[sfxmix]');

chains.push(`${mixes.join('')}amix=inputs=${mixes.length}:normalize=0:dropout_transition=0[mx];` +
            // loudnorm to the YouTube delivery target so the mix never lands quiet
            `[mx]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:${DURATION},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

const filter = chains.join(';');
fs.writeFileSync('filter.txt', filter);

// ── Stage 1: audio master ────────────────────────────────────────────────────
console.log('stage 1: audio master -> audio_master.m4a');
execFileSync(ffmpegPath, [
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[aout]',
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(DURATION),
  'audio_master.m4a',
], { stdio: 'inherit' });

// ── Stage 2: video encode + mux ──────────────────────────────────────────────
// crop the stray sub-pixel row so dimensions are even (libx264 needs even w/h)
console.log('stage 2: video encode ->', OUT);
execFileSync(ffmpegPath, [
  '-y',
  '-framerate', String(FPS), '-start_number', '0', '-i', 'frames/f_%05d.jpg',
  '-i', 'audio_master.m4a',
  '-filter_complex', `[0:v]crop=1920:1080:0:0,fps=${FPS},format=yuv420p[vout]`,
  '-map', '[vout]', '-map', '1:a',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
  '-r', String(FPS),
  '-c:a', 'copy',
  '-t', String(DURATION),
  '-movflags', '+faststart',
  OUT,
], { stdio: 'inherit' });
console.log('MUX DONE ->', OUT);
