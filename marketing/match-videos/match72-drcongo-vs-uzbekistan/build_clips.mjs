// Ep72 DR Congo vs Uzbekistan — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 35 distinct photoreal clips, each used ONCE, each window <= its 5.04s source
// (ffprobe-checked). Long card/title/verdict/legend/app scenes are CSS motion-graphics
// (no video behind → never loops). PLAYER SHOWCASE windows are SYNCED to the VO name
// timestamps (rule #23): measured onsets — Wissa 55.9, Silas 62.6, Bakambu 65.5,
// Wan-Bissaka 67.2, Mbemba 70.5 / Fayzullaev 91.2, Shomurodov 96.3, Masharipov 98.1,
// Khamdamov 99.2, Khusanov 105.4. OUR PREDICTION COD 0-1 UZB (Shomurodov header 62').
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (the Leopard + the White Wolf) 0–23 ──
  C('cod-leopard', 'cod-leopard.mp4', 0.0, 5.0),
  C('uzb-wolf', 'uzb-wolf.mp4', 5.0, 5.0),
  C('cod-kinshasa', 'cod-kinshasa.mp4', 10.0, 5.0),
  C('uzb-registan', 'uzb-registan.mp4', 15.0, 5.0),
  // ── STADIUM / WALKOUT 33–44 (Title 23–33 graphic) ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.0, 5.0),
  // ── DR CONGO 44–79.5 (showcase synced to names) ──
  C('cod-crowd', 'cod-crowd.mp4', 44.0, 5.0),
  C('cod-tifo', 'cod-tifo.mp4', 49.0, 5.0),
  C('s-wissa', 's-wissa.mp4', 55.0, 5.0),
  C('cod-attack', 'cod-attack.mp4', 60.0, 2.6),
  C('s-silas', 's-silas.mp4', 62.6, 2.9),
  C('s-bakambu', 's-bakambu.mp4', 65.5, 1.7),
  C('s-wanbissaka', 's-wanbissaka.mp4', 67.2, 2.8),
  C('s-mbemba', 's-mbemba.mp4', 70.0, 5.0),
  C('cod-defend', 'cod-defend.mp4', 75.0, 4.5),
  // ── UZBEKISTAN 79.5–113 (showcase synced to names) ──
  C('uzb-crowd', 'uzb-crowd.mp4', 79.5, 5.0),
  C('uzb-tifo', 'uzb-tifo.mp4', 84.5, 5.0),
  C('s-fayzullaev', 's-fayzullaev.mp4', 90.6, 5.0),
  C('s-shomurodov', 's-shomurodov.mp4', 96.0, 2.1),
  C('s-masharipov', 's-masharipov.mp4', 98.1, 1.4),
  C('s-khamdamov', 's-khamdamov.mp4', 99.5, 3.5),
  C('s-khusanov', 's-khusanov.mp4', 103.0, 5.0),
  C('uzb-cross-build', 'uzb-cross-build.mp4', 108.0, 5.0),
  // ── REVOLT / DUEL 113–132 ──
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('duel-wing', 'duel-wing.mp4', 118.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 123.0, 5.0),
  // ── DRAMA / THE 62ND MINUTE 132–203.32 ──
  C('cod-chance', 'cod-chance.mp4', 132.0, 5.0),
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('goal-fayzullaev-cross', 'goal-fayzullaev-cross.mp4', 152.21, 5.0),
  C('goal-shomurodov', 'goal-shomurodov.mp4', 164.37, 5.0),
  // (graphic GOAL flash + ScoreBug 0-1 + prediction card fill 169–203)
  // ── VERDICT 203.32–244 (3 distinct clips + graphic panel) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-applaud', 'vd-applaud.mp4', 208.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // (Mystery/Legend 255–282.5 + App 282.5–303.05 graphic; App has the phone-collect)
  // ── CTA 303.05–318 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep72 DR Congo vs Uzbekistan PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED to VO names (#23). OUR PREDICTION COD 0-1 UZB (Shomurodov 62 header). Legend 072 The White Wolf of Samarkand. vol=0.',
  clips,
  music: { cues: [
    { src: 'music/cue-tense.mp3', at: 0, dur: 33, vol: 0.5, fadeIn: 0.5, fadeOut: 3, loop: false },
    { src: 'music/cue-epic.mp3', at: 33, dur: 256, vol: 0.4, fadeIn: 2.5, fadeOut: 4, loop: true },
    { src: 'music/cue-heroic.mp3', at: 272, dur: 46, vol: 0.46, fadeIn: 2.5, fadeOut: 3, loop: true },
  ]},
  sfx: { hits: [
    { src: 'sfx/heartbeat.mp3', at: 0.3, vol: 0.9 }, { src: 'sfx/braam.mp3', at: 5.2, vol: 0.8 },
    { src: 'sfx/mystic.mp3', at: 15.2, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 22.6, vol: 0.6 },
    { src: 'sfx/braam.mp3', at: 33.0, vol: 0.55 }, { src: 'sfx/pop.mp3', at: 55.0, vol: 0.5 },
    { src: 'sfx/whoosh.mp3', at: 79.5, vol: 0.5 }, { src: 'sfx/pop.mp3', at: 90.6, vol: 0.5 },
    { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 }, { src: 'sfx/braam.mp3', at: 159.0, vol: 0.7 },
    { src: 'sfx/goal.mp3', at: 166.5, vol: 0.92 }, { src: 'sfx/whoosh.mp3', at: 178.6, vol: 0.6 },
    { src: 'sfx/stamp.mp3', at: 190.0, vol: 0.6 }, { src: 'sfx/whoosh.mp3', at: 203.32, vol: 0.55 },
    { src: 'sfx/mystic.mp3', at: 255.5, vol: 0.85 }, { src: 'sfx/pop.mp3', at: 263.0, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 303.05, vol: 0.55 },
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
console.log('Ep72:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
