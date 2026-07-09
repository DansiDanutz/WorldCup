// Ep84 England vs DR Congo (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP.
// 30 distinct clips. England GENERATED fresh; DR Congo + leopard + Kinshasa + crowd + attack +
// keeper-save REUSED from Ep72 (Rule #26, 0 credits). Establishing reused from library.
// PLAYER SHOWCASE windows SYNCED to VO name onsets (#23).
// OUR PREDICTION England 2-1 DR Congo (Bakambu early shock; Kane equalise; Bellingham late winner).
// Legend 084 = the Three Lions. Theme: the Lions (England) vs the Leopard (DR Congo).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN 0-23 (Three Lions + England + the Leopard + Kinshasa street)
  C('eng-lions', 'eng-lions.mp4', 0.0, 5.0),
  C('texture-england', 'texture-england.mp4', 5.0, 5.0),
  C('cod-leopard', 'cod-leopard.mp4', 10.0, 5.0),
  C('cod-kinshasa', 'cod-kinshasa.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ENGLAND 44-79.5 (showcase synced: Kane 55.5, Bellingham 61.1, Saka 65.7, Foden 68.0, Rice 71.8)
  C('eng-crowd', 'eng-crowd.mp4', 44.0, 5.0),
  C('eng-attack', 'eng-attack.mp4', 49.0, 5.0),
  C('eng-surge', 'eng-surge.mp4', 54.0, 1.5),
  C('eng-kane', 'eng-kane.mp4', 55.5, 5.0),
  C('eng-bellingham', 'eng-bellingham.mp4', 61.1, 4.6),
  C('eng-saka', 'eng-saka.mp4', 65.7, 2.3),
  C('eng-foden', 'eng-foden.mp4', 68.0, 3.8),
  C('eng-rice', 'eng-rice.mp4', 71.8, 5.0),
  // DR CONGO 79.5-113 (showcase synced: Wissa 90.6, Silas 93.6, Mbemba 96.6, Bakambu 103.0, Wan-Bissaka 106.6)
  C('cod-crowd', 'cod-crowd.mp4', 79.5, 5.0),
  C('cod-attack', 'cod-attack.mp4', 84.5, 5.0),
  C('dc-wissa', 'dc-wissa.mp4', 90.6, 3.0),
  C('dc-silas', 'dc-silas.mp4', 93.6, 3.0),
  C('dc-mbemba', 'dc-mbemba.mp4', 96.6, 5.0),
  C('dc-bakambu', 'dc-bakambu.mp4', 103.0, 3.6),
  C('dc-wanbissaka', 'dc-wanbissaka.mp4', 106.6, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Bakambu DRC 1-0; Kane 1-1; Bellingham 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('cd-goal', 'cd-goal.mp4', 152.21, 5.0),
  C('eng-goal-1', 'eng-goal-1.mp4', 178.46, 5.0),
  C('eng-goal-2', 'eng-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep84 England vs DR Congo PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION England 2-1 DR Congo (Bellingham late winner). Legend 084 the Three Lions. DR Congo reused from Ep72 (Rule #26). vol=0.',
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
console.log('Ep84:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
