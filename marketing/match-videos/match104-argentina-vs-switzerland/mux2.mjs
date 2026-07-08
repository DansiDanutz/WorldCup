// mux2.mjs — Ep100 chunked-render finisher. Builds ONLY the audio master (Brian VO + music +
// SFX + clip FX, per clips.json/narration.json), then muxes it onto the ALREADY-ENCODED
// body_video.mp4 (produced by the chunked render_local.mjs + ffmpeg passes) using stream copy —
// no second video re-encode. Adapted from mux.mjs's audio-graph logic (stage 1 only).
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const DURATION = Number(process.env.DURATION || 318.05);
const BODY_IN = process.env.BODY_IN || 'body_video.mp4';
const OUT = process.env.OUTFILE || 'body_s.mp4';

const { lines } = JSON.parse(fs.readFileSync('narration.json', 'utf8'));
const { clips, music, sfx } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));

const inputs = [];
const voFiles = lines.map((_, i) => `audio/line_${String(i).padStart(2, '0')}.mp3`);
for (const f of voFiles) inputs.push('-i', f);
const clipFiles = clips.filter(c => fs.existsSync(c.src) && (c.vol ?? 0) > 0);
for (const c of clipFiles) inputs.push('-i', c.src);
const hits = (sfx?.hits || []).filter(h => fs.existsSync(h.src));
for (const h of hits) inputs.push('-i', h.src);
const cues = (music?.cues || []).filter(c => fs.existsSync(c.src));
for (const c of cues) {
  if (c.loop) inputs.push('-stream_loop', String(Math.max(1, Math.ceil(c.dur / 60))));
  inputs.push('-i', c.src);
}

const chains = [];
const mixes = [];

function durOfSync(f) {
  const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error('no duration for ' + f);
  return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
}

const durs = voFiles.map(durOfSync);
const voLabels = [];
for (let i = 0; i < lines.length; i++) {
  const at = lines[i].at;
  const nextAt = i < lines.length - 1 ? lines[i + 1].at : DURATION;
  const budget = (nextAt - at) - 0.25;
  const ms = Math.round(at * 1000);
  let c = `[${i}:a]`;
  c += `adelay=${ms}:all=1,aresample=44100[v${i}]`;
  chains.push(c);
  voLabels.push(`[v${i}]`);
  console.log(`VO ${String(i).padStart(2)}: at ${at}s dur ${durs[i].toFixed(2)}s budget ${budget.toFixed(2)}s`);
}
chains.push(`${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[vo]`);

const fxLabels = [];
clipFiles.forEach((c, k) => {
  const idx = voFiles.length + k;
  const ms = Math.round(c.at * 1000);
  chains.push(`[${idx}:a]volume=${(c.vol ?? 0.4).toFixed(2)},afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0.5, Math.min(c.dur, 10) - 1).toFixed(2)}:d=1,adelay=${ms}:all=1,aresample=44100[f${k}]`);
  fxLabels.push(`[f${k}]`);
});
if (fxLabels.length) {
  chains.push(`${fxLabels.join('')}amix=inputs=${fxLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[fx]`);
}

if (hits.length) {
  const hitLabels = [];
  hits.forEach((h, k) => {
    const idx = voFiles.length + clipFiles.length + k;
    chains.push(`[${idx}:a]volume=${(h.vol ?? 0.6).toFixed(2)},adelay=${Math.round(h.at * 1000)}:all=1,aresample=44100[s${k}]`);
    hitLabels.push(`[s${k}]`);
  });
  chains.push(`${hitLabels.join('')}amix=inputs=${hitLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[sfxmix]`);
}

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
  chains.push(`[vo]asplit=2[voa][vob]`);
  chains.push(`[bgraw][vob]sidechaincompress=threshold=0.02:ratio=5:attack=120:release=700:makeup=1[bg]`);
  mixes.push('[voa]', '[bg]');
} else {
  mixes.push('[vo]');
}
if (fxLabels.length) mixes.push('[fx]');
if (hits.length) mixes.push('[sfxmix]');

chains.push(`${mixes.join('')}amix=inputs=${mixes.length}:normalize=0:dropout_transition=0[mx];` +
            `[mx]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:${DURATION},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

const filter = chains.join(';');
fs.writeFileSync('filter.txt', filter);

console.log('stage 1: audio master -> audio_master.m4a');
execFileSync(ffmpegPath, [
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[aout]',
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(DURATION),
  'audio_master.m4a',
], { stdio: 'inherit' });

console.log('stage 2: mux onto', BODY_IN, '->', OUT);
execFileSync(ffmpegPath, [
  '-y',
  '-i', BODY_IN,
  '-i', 'audio_master.m4a',
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'copy',
  '-t', String(DURATION),
  '-movflags', '+faststart',
  OUT,
], { stdio: 'inherit' });
console.log('MUX2 DONE ->', OUT);
