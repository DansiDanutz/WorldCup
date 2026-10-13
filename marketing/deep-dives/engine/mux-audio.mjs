// mux-audio.mjs <episode-dir> — the audio master, built straight from film.json so
// picture and sound can never drift: Brian VO on top, sfx hits, and the cleared
// Kevin MacLeod cues side-chain ducked under him. Loudness: -14 LUFS.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, FFMPEG } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const f = JSON.parse(fs.readFileSync(path.join(epDir, 'build/film.json'), 'utf8'));
const D = f.duration;
const abs = (p) => path.join(ROOT, p);
const inputs = [], chains = [];
let idx = 0;

const vo = f.vo.filter((v) => v.src);
const voLabels = vo.map((v, i) => {
  inputs.push('-i', abs(v.src));
  chains.push(`[${idx++}:a]adelay=${Math.round(v.at * 1000)}:all=1,aresample=44100[v${i}]`);
  return `[v${i}]`;
});

const hits = f.sfx.hits.filter((h) => fs.existsSync(abs(h.src)));
const hitLabels = hits.map((h, i) => {
  inputs.push('-i', abs(h.src));
  chains.push(`[${idx++}:a]volume=${(h.vol ?? 0.5).toFixed(2)},adelay=${Math.round(h.at * 1000)}:all=1,aresample=44100[s${i}]`);
  return `[s${i}]`;
});

const cues = f.music.cues.filter((c) => fs.existsSync(abs(c.src)));
if (cues.length < f.music.cues.length) { console.error('music cues missing — run engine/fetch-music.sh'); process.exit(1); }
const cueLabels = cues.map((c, i) => {
  if (c.loop) inputs.push('-stream_loop', String(Math.max(1, Math.ceil(c.dur / 60))));
  inputs.push('-i', abs(c.src));
  const fi = c.fadeIn ?? 2, fo = c.fadeOut ?? 4;
  chains.push(`[${idx++}:a]atrim=0:${c.dur},volume=${(c.vol ?? 0.3).toFixed(2)},` +
    `afade=t=in:st=0:d=${fi},afade=t=out:st=${Math.max(0, c.dur - fo).toFixed(2)}:d=${fo},` +
    `adelay=${Math.round(c.at * 1000)}:all=1,aresample=44100[m${i}]`);
  return `[m${i}]`;
});
const mix = (labels, out) => chains.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${D}[${out}]`);
mix(cueLabels, 'bgraw');
const finals = [];
if (voLabels.length) {
  mix(voLabels, 'vo');
  chains.push('[vo]asplit=2[voa][vob]');
  chains.push('[bgraw][vob]sidechaincompress=threshold=0.02:ratio=5:attack=120:release=700:makeup=1[bg]');
  finals.push('[voa]', '[bg]');
} else {
  finals.push('[bgraw]');
}
if (hitLabels.length) { mix(hitLabels, 'sfx'); finals.push('[sfx]'); }
chains.push(`${finals.join('')}amix=inputs=${finals.length}:normalize=0:dropout_transition=0[mx];` +
  `[mx]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:${D},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

const out = path.join(epDir, 'build/audio_master.m4a');
console.log(`audio: ${vo.length} VO + ${hits.length} sfx + ${cues.length} cues -> ${path.relative(ROOT, out)}`);
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', chains.join(';'), '-map', '[aout]',
  '-c:a', 'aac', '-b:a', '192k', '-t', String(D), out], { stdio: 'inherit' });
