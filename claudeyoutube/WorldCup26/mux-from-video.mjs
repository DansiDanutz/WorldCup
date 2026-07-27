// Final assembly from a PRE-ENCODED video track (segmented-render workflow):
//   video_full.mp4      (concat of video_a + video_b, 1470s, 1080p h264)
// + audio/line_NN.mp3   (Brian VO)
// + music cues + clip FX + sfx hits from clips.json
// -> WorldCup26_Milestone_FIFA_Records.mp4 (video stream COPIED, audio mixed)
// Same audio filtergraph as mux.mjs; stage 2 skips the frames re-encode.
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const DURATION = Number(process.env.DURATION || 1470);
const VIDEO = process.env.VIDEO || 'video_full.mp4';
const OUT = process.env.OUTFILE || 'WorldCup26_Milestone_FIFA_Records.mp4';
const NO_VO = process.env.NO_VO === '1';

const { lines } = JSON.parse(fs.readFileSync('narration.json', 'utf8'));
const { clips, music, sfx } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));

function probe(f) { return spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' }).stderr || ''; }
function durOf(f) {
  const m = probe(f).match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error('no duration for ' + f);
  return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
}
const hasAudio = (f) => /Stream .*Audio:/.test(probe(f));

const inputs = [];
const voFiles = NO_VO ? [] : lines.map((_, i) => `audio/line_${String(i).padStart(2, '0')}.mp3`);
for (const f of voFiles) inputs.push('-i', f);
// only clips that really carry an audio stream (several AI clips and all cards are silent)
const clipFiles = clips.filter(c => fs.existsSync(c.src) && (c.vol ?? 0) > 0 && hasAudio(c.src));
console.log(`clip FX with audio: ${clipFiles.length}`);
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

if (!NO_VO) {
  const durs = voFiles.map(durOf);
  const voLabels = [];
  for (let i = 0; i < lines.length; i++) {
    const at = lines[i].at;
    const nextAt = i < lines.length - 1 ? lines[i + 1].at : DURATION;
    const budget = (nextAt - at) - 0.25;
    if (durs[i] > budget + 0.05) console.warn(`  WARNING line ${i} over budget by ${(durs[i] - budget).toFixed(2)}s`);
    chains.push(`[${i}:a]adelay=${Math.round(at * 1000)}:all=1,aresample=44100[v${i}]`);
    voLabels.push(`[v${i}]`);
  }
  chains.push(`${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${DURATION}[vo]`);
}

const fxLabels = [];
clipFiles.forEach((c, k) => {
  const idx = voFiles.length + k;
  chains.push(`[${idx}:a]volume=${(c.vol ?? 0.4).toFixed(2)},afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0.5, Math.min(c.dur, 10) - 1).toFixed(2)}:d=1,adelay=${Math.round(c.at * 1000)}:all=1,aresample=44100[f${k}]`);
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
    const fi = c.fadeIn ?? 1.5, fo = c.fadeOut ?? 3;
    chains.push(
      `[${idx}:a]atrim=0:${c.dur},volume=${(c.vol ?? 0.4).toFixed(2)},` +
      `afade=t=in:st=0:d=${fi},afade=t=out:st=${(c.dur - fo).toFixed(2)}:d=${fo},` +
      `adelay=${Math.round(c.at * 1000)}:all=1,aresample=44100[m${k}]`
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
            `[mx]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:${DURATION},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

fs.writeFileSync('filter.txt', chains.join(';'));

console.log('stage 1: audio master -> audio_master.m4a');
execFileSync(ffmpegPath, [
  '-y', ...inputs,
  '-filter_complex', chains.join(';'),
  '-map', '[aout]',
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(DURATION),
  'audio_master.m4a',
], { stdio: 'inherit' });

console.log('stage 2: mux (video copy) ->', OUT);
execFileSync(ffmpegPath, [
  '-y',
  '-i', VIDEO,
  '-i', 'audio_master.m4a',
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'copy',
  '-t', String(DURATION),
  '-movflags', '+faststart',
  OUT,
], { stdio: 'inherit' });
console.log('MUX DONE ->', OUT);
