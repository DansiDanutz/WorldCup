// Stage 1 — the audio master, built straight from film.json so picture and sound
// can never drift. Brian VO (already rendered for each Short, story-only) sits on
// top; the cleared Kevin MacLeod cues are side-chain ducked under him.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const F = 'node_modules/ffmpeg-static/ffmpeg';
const f = JSON.parse(fs.readFileSync('film.json', 'utf8'));
const D = f.duration;

const inputs = [], chains = [], mixes = [];
let idx = 0;

// ── Brian VO ────────────────────────────────────────────────────────────────
const voLabels = [];
f.vo.forEach((v, i) => {
  inputs.push('-i', v.src);
  chains.push(`[${idx}:a]adelay=${Math.round(v.at * 1000)}:all=1,aresample=44100[v${i}]`);
  voLabels.push(`[v${i}]`); idx++;
});
chains.push(`${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${D}[vo]`);

// ── sound design hits ───────────────────────────────────────────────────────
const hits = f.sfx.hits.filter(h => fs.existsSync(h.src));
const hitLabels = [];
hits.forEach((h, i) => {
  inputs.push('-i', h.src);
  chains.push(`[${idx}:a]volume=${(h.vol ?? 0.5).toFixed(2)},adelay=${Math.round(h.at * 1000)}:all=1,aresample=44100[s${i}]`);
  hitLabels.push(`[s${i}]`); idx++;
});
if (hitLabels.length) chains.push(`${hitLabels.join('')}amix=inputs=${hitLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${D}[sfx]`);

// ── music cues ──────────────────────────────────────────────────────────────
const cues = f.music.cues.filter(c => fs.existsSync(c.src));
const cueLabels = [];
cues.forEach((c, i) => {
  if (c.loop) inputs.push('-stream_loop', String(Math.max(1, Math.ceil(c.dur / 60))));
  inputs.push('-i', c.src);
  const fi = c.fadeIn ?? 2, fo = c.fadeOut ?? 4;
  chains.push(`[${idx}:a]atrim=0:${c.dur},volume=${(c.vol ?? 0.34).toFixed(2)},` +
    `afade=t=in:st=0:d=${fi},afade=t=out:st=${(c.dur - fo).toFixed(2)}:d=${fo},` +
    `adelay=${Math.round(c.at * 1000)}:all=1,aresample=44100[m${i}]`);
  cueLabels.push(`[m${i}]`); idx++;
});
chains.push(`${cueLabels.join('')}amix=inputs=${cueLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${D}[bgraw]`);
// duck the score under Brian
chains.push(`[vo]asplit=2[voa][vob]`);
chains.push(`[bgraw][vob]sidechaincompress=threshold=0.02:ratio=5:attack=120:release=700:makeup=1[bg]`);
mixes.push('[voa]', '[bg]');
if (hitLabels.length) mixes.push('[sfx]');

chains.push(`${mixes.join('')}amix=inputs=${mixes.length}:normalize=0:dropout_transition=0[mx];` +
  `[mx]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:${D},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

fs.writeFileSync('build/filter.txt', chains.join(';'));
console.log(`audio: ${f.vo.length} VO + ${hits.length} sfx + ${cues.length} cues -> audio_master.m4a`);
execFileSync(F, ['-y', ...inputs, '-filter_complex', chains.join(';'), '-map', '[aout]',
  '-c:a', 'aac', '-b:a', '192k', '-t', String(D), 'audio_master.m4a'], { stdio: 'inherit' });
