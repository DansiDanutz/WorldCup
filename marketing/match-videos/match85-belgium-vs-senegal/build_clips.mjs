// Ep85 Belgium vs Senegal (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP.
// 30 distinct clips. Belgium + Senegal GENERATED fresh (no prior photoreal assets existed).
// Establishing (pitch-walkout/stadium-wide/stadium-aerial) REUSED from library (Rule #26, 0 credits).
// PLAYER SHOWCASE windows SYNCED to VO name onsets (#23).
// OUR PREDICTION Senegal 2-1 Belgium (De Bruyne early shock; Jackson equalise; Mané late winner).
// Legend 085 = the Lion of Teranga. Theme: the Devil (Belgium) vs the Lion (Senegal).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN 0-20 (the Red Devil + Belgium flag + the Lion + the savanna)
  C('be-devil', 'be-devil.mp4', 0.0, 5.0),
  C('texture-belgium', 'texture-belgium.mp4', 5.0, 5.0),
  C('sn-lion', 'sn-lion.mp4', 10.0, 5.0),
  C('texture-senegal', 'texture-senegal.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // BELGIUM 44-79.5 (showcase synced: De Bruyne 55.5, Lukaku 61.1, Doku 65.7, Tielemans 68.0, Onana 71.8)
  C('be-crowd', 'be-crowd.mp4', 44.0, 5.0),
  C('be-attack', 'be-attack.mp4', 49.0, 5.0),
  C('be-surge', 'be-surge.mp4', 54.0, 1.5),
  C('be-debruyne', 'be-debruyne.mp4', 55.5, 5.0),
  C('be-lukaku', 'be-lukaku.mp4', 61.5, 3.96),
  C('be-doku', 'be-doku.mp4', 65.46, 2.54),
  C('be-tielemans', 'be-tielemans.mp4', 68.0, 3.07),
  C('be-onana', 'be-onana.mp4', 71.07, 5.0),
  // SENEGAL 79.5-113 (showcase synced: Mané 90.6, Jackson 93.6, Koulibaly 96.6, Pape Sarr 103.0, Ismaïla Sarr 106.6)
  C('sn-crowd', 'sn-crowd.mp4', 79.5, 5.0),
  C('sn-attack', 'sn-attack.mp4', 84.5, 5.0),
  C('sn-mane', 'sn-mane.mp4', 90.6, 4.71),
  C('sn-jackson', 'sn-jackson.mp4', 95.31, 3.25),
  C('sn-koulibaly', 'sn-koulibaly.mp4', 98.56, 4.44),
  C('sn-papesarr', 'sn-papesarr.mp4', 103.0, 3.51),
  C('sn-ismailasarr', 'sn-ismailasarr.mp4', 106.51, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (De Bruyne BEL 1-0; Jackson 1-1; Mané 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('be-goal', 'be-goal.mp4', 152.21, 5.0),
  C('sn-goal-1', 'sn-goal-1.mp4', 178.46, 5.0),
  C('sn-goal-2', 'sn-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep85 Belgium vs Senegal PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Senegal 2-1 Belgium (Mané late winner). Legend 085 the Lion of Teranga. Establishing reused from library (Rule #26). vol=0.',
  clips,
  music: { cues: [
    { src: 'music/cue-tense.mp3', at: 0, dur: 33, vol: 0.5, fadeIn: 0.5, fadeOut: 3, loop: false },
    { src: 'music/cue-epic.mp3', at: 33, dur: 256, vol: 0.4, fadeIn: 2.5, fadeOut: 4, loop: true },
    { src: 'music/cue-heroic.mp3', at: 272, dur: 46, vol: 0.46, fadeIn: 2.5, fadeOut: 3, loop: true },
  ]},
  sfx: { hits: [
    { src: 'sfx/heartbeat.mp3', at: 0.3, vol: 0.9 }, { src: 'sfx/braam.mp3', at: 5.2, vol: 0.8 },
    { src: 'sfx/mystic.mp3', at: 10.2, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 22.6, vol: 0.6 },
    { src: 'sfx/braam.mp3', at: 33.0, vol: 0.55 }, { src: 'sfx/pop.mp3', at: 55.5, vol: 0.5 },
    { src: 'sfx/whoosh.mp3', at: 79.5, vol: 0.5 }, { src: 'sfx/pop.mp3', at: 90.6, vol: 0.5 },
    { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 }, { src: 'sfx/goal.mp3', at: 153.6, vol: 0.9 },
    { src: 'sfx/whoosh.mp3', at: 164.37, vol: 0.6 }, { src: 'sfx/goal.mp3', at: 179.9, vol: 0.92 },
    { src: 'sfx/goal.mp3', at: 191.0, vol: 0.95 }, { src: 'sfx/stamp.mp3', at: 195.0, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 203.32, vol: 0.55 }, { src: 'sfx/mystic.mp3', at: 255.5, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 263.0, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 303.05, vol: 0.55 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt = {}; clips.forEach(c => cnt[c.src] = (cnt[c.src] || 0) + 1);
const reused = Object.entries(cnt).filter(([, k]) => k > 1);
if (reused.length) { console.error('NO-REPEAT VIOLATION:', reused); process.exit(1); }
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep85:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
