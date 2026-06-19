// Add the ducked music score to an ALREADY-RENDERED mp4 (no frames needed).
// Video stream copied; music cues (clips.json) looped/trimmed/faded, side-chain
// ducked under the existing VO, then re-muxed. Usage: node add-music.mjs <mp4>
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const MP4 = process.argv[2];
if (!MP4 || !fs.existsSync(MP4)) { console.error('need existing mp4'); process.exit(1); }
const DURATION = 300;
const { music } = JSON.parse(fs.readFileSync('clips.json', 'utf8'));
const cues = (music?.cues || []).filter((c) => fs.existsSync(c.src));
if (!cues.length) { console.error('no music cues/files'); process.exit(1); }

// inputs: 0 = existing mp4 (video + VO audio); then each cue (stream-looped)
const inputs = ['-i', MP4];
for (const c of cues) inputs.push('-stream_loop', '-1', '-i', c.src);

const chains = [];
chains.push(`[0:a]aresample=44100[vo]`);
const cueLabels = [];
cues.forEach((c, k) => {
  const idx = k + 1;
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
chains.push(`[voa][bg]amix=inputs=2:normalize=0:dropout_transition=0[mx];[mx]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:${DURATION},aformat=channel_layouts=stereo:sample_rates=44100[aout]`);

const out = MP4.replace(/\.mp4$/, '_music.mp4');
execFileSync(ffmpegPath, [
  '-y', ...inputs,
  '-filter_complex', chains.join(';'),
  '-map', '0:v', '-map', '[aout]',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-t', String(DURATION), out,
], { stdio: 'inherit' });
fs.renameSync(out, MP4);
console.log('MUSIC ADDED ->', MP4, fs.statSync(MP4).size, 'bytes');
