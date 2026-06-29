// Ep83 Mexico vs Ecuador (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP.
// 27 distinct i2v clips + 3 reused establishing, each ONCE, window <= ~5.04s source. NO BLANK FRAMES.
// PLAYER SHOWCASE windows SYNCED to VO name onsets (#23).
// OUR PREDICTION Ecuador 2-1 Mexico (Gimenez early; Valencia equalise; Paez late winner).
// Legend 083 = the Andean Condor. Theme: the Serpent (Mexico/Quetzalcoatl) vs the Condor (Ecuador).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN 0-23 (Andean condor + Andes + Quetzalcoatl serpent + Mexican pyramid)
  C('ec-condor', 'ec-condor.mp4', 0.0, 5.0),
  C('texture-ecuador', 'texture-ecuador.mp4', 5.0, 5.0),
  C('mx-quetzal', 'mx-quetzal.mp4', 10.0, 5.0),
  C('texture-mexico', 'texture-mexico.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // MEXICO 44-79.5 (showcase synced: Gimenez 55.5, Lozano 59.0, Alvarez 62.4, Vega 68.0, Montes 73.9)
  C('mx-crowd', 'mx-crowd.mp4', 44.0, 5.0),
  C('mx-attack', 'mx-attack.mp4', 49.0, 5.0),
  C('mx-surge', 'mx-surge.mp4', 54.0, 1.5),
  C('mx-gimenez', 'mx-gimenez.mp4', 55.5, 3.5),
  C('mx-lozano', 'mx-lozano.mp4', 59.0, 3.4),
  C('mx-alvarez', 'mx-alvarez.mp4', 62.4, 5.0),
  C('mx-vega', 'mx-vega.mp4', 68.0, 5.0),
  C('mx-montes', 'mx-montes.mp4', 73.9, 5.0),
  // ECUADOR 79.5-113 (showcase synced: Valencia 90.6, Caicedo 94.5, Paez 98.5, Estupinan 103.0, Hincapie 106.7)
  C('ec-crowd', 'ec-crowd.mp4', 79.5, 5.0),
  C('ec-press', 'ec-press.mp4', 84.5, 5.0),
  C('ec-valencia', 'ec-valencia.mp4', 90.6, 3.9),
  C('ec-caicedo', 'ec-caicedo.mp4', 94.5, 4.0),
  C('ec-paez', 'ec-paez.mp4', 98.5, 4.5),
  C('ec-estupinan', 'ec-estupinan.mp4', 103.0, 3.7),
  C('ec-hincapie', 'ec-hincapie.mp4', 106.7, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Gimenez MEX 1-0; Valencia 1-1; Paez 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('mx-goal', 'mx-goal.mp4', 152.21, 5.0),
  C('ec-goal-1', 'ec-goal-1.mp4', 178.46, 5.0),
  C('ec-goal-2', 'ec-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep83 Mexico vs Ecuador PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Ecuador 2-1 Mexico (Paez late winner). Legend 083 the Andean Condor. Theme: the Serpent vs the Condor. vol=0.',
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
console.log('Ep83:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
