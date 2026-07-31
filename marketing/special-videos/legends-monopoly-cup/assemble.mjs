#!/usr/bin/env node
/*
 * The Legends' Monopoly Cup — assembler.
 * Builds a continuous ~5min film from Seedance clips + VO + music + SFX.
 * Stages: (1) slow-mo/normalize each clip, (2) xfade-concat to a silent master,
 *         (3) build the audio bed (VO + music + SFX), (4) mux.
 * Driven by manifest.json. Uses ffmpeg-static. No external deps beyond that.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import ffmpegPath from 'ffmpeg-static';

const DIR = new URL('.', import.meta.url).pathname;
const M = JSON.parse(readFileSync(DIR + 'manifest.json', 'utf8'));
const W = M.W || 1920, H = M.H || 1080, FPS = M.fps || 30, XF = M.xfade ?? 0.5;
const PREP = DIR + 'prep/'; mkdirSync(PREP, { recursive: true });
const OUT = DIR + (M.outfile || 'LegendsMonopolyCup.mp4');
const ff = (args) => execFileSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

const stage = process.argv[2] || 'all';

// ---------- STAGE 1: normalize + slow-mo each clip to its screen duration ----------
function prepClips() {
  M.clips.forEach((c, i) => {
    const factor = (c.screen / c.raw).toFixed(4); // >1 => slow down
    const out = `${PREP}${String(i).padStart(2,'0')}_${c.id}.mp4`;
    console.log(`prep ${c.id}: raw ${c.raw}s -> screen ${c.screen}s (x${factor})`);
    ff(['-i', DIR + c.file,
        '-an',
        '-vf', `setpts=${factor}*PTS,scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},format=yuv420p`,
        '-t', String(c.screen),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out]);
  });
}

// ---------- STAGE 2: xfade chain -> silent master ----------
function concatXfade() {
  const inputs = [];
  M.clips.forEach((c, i) => inputs.push('-i', `${PREP}${String(i).padStart(2,'0')}_${c.id}.mp4`));
  // normalize every input (SAR/fps/timebase/format) so xfade never rejects a mismatch
  let filter = M.clips.map((_, i) => `[${i}:v]settb=AVTB,fps=30,setsar=1,format=yuv420p[n${i}]`).join(';') + ';';
  let prev = '[n0]', accDur = M.clips[0].screen;
  for (let i = 1; i < M.clips.length; i++) {
    const xf = M.clips[i].xf ?? XF;            // per-clip transition (hard-cut intro vs smooth body)
    const offset = accDur - xf;
    const out = (i === M.clips.length - 1) ? '[v]' : `[x${i}]`;
    filter += `${prev}[n${i}]xfade=transition=fade:duration=${xf}:offset=${offset.toFixed(3)}${out};`;
    prev = out;
    accDur = offset + M.clips[i].screen;
  }
  filter = filter.replace(/;$/, '');
  ff([...inputs, '-filter_complex', filter, '-map', '[v]',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      DIR + 'silent_master.mp4']);
  console.log('silent_master.mp4 written');
}

// ---------- STAGE 3: audio bed (VO + music + SFX) ----------
function buildAudio() {
  const inputs = [], parts = [];
  let idx = 0;
  // music cues
  (M.music || []).forEach((m) => {
    inputs.push('-i', DIR + m.file);
    const fO = m.dur - (m.fadeOut ?? 3);
    parts.push(`[${idx}:a]atrim=0:${m.dur},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${m.fadeIn ?? 2},afade=t=out:st=${fO}:d=${m.fadeOut ?? 3},volume=${m.vol ?? 0.18},adelay=${Math.round(m.at*1000)}|${Math.round(m.at*1000)}[m${idx}]`);
    idx++;
  });
  const musicLabels = parts.map((_, i) => `[m${i}]`).join('');
  const musicMix = musicLabels ? `${musicLabels}amix=inputs=${parts.length}:normalize=0[music];` : '';
  // VO lines
  const voParts = [], voLabels = [];
  (M.vo || []).forEach((v) => {
    inputs.push('-i', DIR + v.file);
    voParts.push(`[${idx}:a]adelay=${Math.round(v.at*1000)}|${Math.round(v.at*1000)},volume=${v.vol ?? 1.0}[v${idx}]`);
    voLabels.push(`[v${idx}]`); idx++;
  });
  const voMix = voLabels.length ? `${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0[vo];` : '';
  // SFX
  const sfxParts = [], sfxLabels = [];
  (M.sfx || []).forEach((s) => {
    inputs.push('-i', DIR + s.file);
    sfxParts.push(`[${idx}:a]adelay=${Math.round(s.at*1000)}|${Math.round(s.at*1000)},volume=${s.vol ?? 0.5}[s${idx}]`);
    sfxLabels.push(`[s${idx}]`); idx++;
  });
  const sfxMix = sfxLabels.length ? `${sfxLabels.join('')}amix=inputs=${sfxLabels.length}:normalize=0[sfx];` : '';

  // final mix: duck music under VO via sidechaincompress
  let filter = [...parts, ...voParts, ...sfxParts].join(';') + ';' + musicMix + voMix + sfxMix;
  if (voMix) filter += `[vo]asplit=2[vosc][vomix];`;  // one copy keys the duck, one feeds the mix
  const stems = [];
  if (voMix) stems.push('[vomix]');
  if (sfxMix) stems.push('[sfx]');
  if (musicMix) {
    if (voMix) { filter += `[music][vosc]sidechaincompress=threshold=0.04:ratio=8:attack=20:release=400[ducked];`; stems.unshift('[ducked]'); }
    else stems.unshift('[music]');
  }
  filter += `${stems.join('')}amix=inputs=${stems.length}:normalize=0:dropout_transition=0,alimiter=limit=0.95,aresample=48000[a]`;
  ff([...inputs, '-filter_complex', filter, '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', DIR + 'audio_master.m4a']);
  console.log('audio_master.m4a written');
}

// ---------- STAGE 4: mux ----------
function mux() {
  ff(['-i', DIR + 'silent_master.mp4', '-i', DIR + 'audio_master.m4a',
      '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      '-shortest', '-movflags', '+faststart', OUT]);
  console.log('FINAL ->', OUT);
}

if (stage === 'prep' || stage === 'all') prepClips();
if (stage === 'concat' || stage === 'all') concatXfade();
if (stage === 'audio' || stage === 'all') buildAudio();
if (stage === 'mux' || stage === 'all') mux();
