// Ep74 Argentina vs Jordan — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 36 distinct photoreal clips, each used ONCE, each window <= its ~5.04s source.
// NO BLANK FRAMES (#25): every text beat over a clip (often dimmed) or rich motion graphics.
// PLAYER SHOWCASE windows SYNCED to measured VO name onsets (#23).
// CANON: OUR PREDICTION Argentina 2-0 Jordan (Alvarez 23', Messi 71'); the 34th-min
// Al-Taamari drive flies JUST WIDE (no goal); Messi swaps shirts with Al-Taamari.
// Legend 074 = Aretas, Guardian of the Rose-Red Treasury (Petra / Nabataean).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (Sun of May + Petra + tango + Bedouin) 0–23 ──
  C('arg-solmayo', 'arg-solmayo.mp4', 0.0, 5.0),
  C('jor-petra', 'jor-petra.mp4', 5.0, 5.0),
  C('arg-tango', 'arg-tango.mp4', 10.0, 4.0),
  C('jor-bedouin', 'jor-bedouin.mp4', 14.0, 4.0),
  C('texture-rose-dust', 'texture-rose-dust.mp4', 18.0, 5.0),  // dim under the title reveal
  // ── STADIUM / WALKOUT 33–44 (Title 23–33 graphic) ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ── ARGENTINA 44–79.5 (showcase synced to names) ──
  C('arg-crowd', 'arg-crowd.mp4', 44.0, 5.0),
  C('arg-tifo', 'arg-tifo.mp4', 49.0, 5.0),
  C('arg-attack', 'arg-attack.mp4', 54.0, 1.5),
  C('arg-messi', 'arg-messi.mp4', 55.5, 4.6),       // "Lionel Messi" onset 55.5
  C('arg-alvarez', 'arg-alvarez.mp4', 60.1, 4.4),   // "Julián Álvarez" onset ~60.1
  C('arg-enzo', 'arg-enzo.mp4', 64.5, 3.5),         // "Enzo Fernández" onset ~64.5
  C('arg-macallister', 'arg-macallister.mp4', 68.0, 3.4), // "Mac Allister" onset 68.0
  C('arg-lautaro', 'arg-lautaro.mp4', 71.4, 5.0),   // "Lautaro Martínez" onset ~71.4
  // ── JORDAN 79.5–113 (showcase synced to names) ──
  C('jor-crowd', 'jor-crowd.mp4', 79.5, 5.0),
  C('jor-tifo', 'jor-tifo.mp4', 84.5, 5.0),
  C('jor-altaamari', 'jor-altaamari.mp4', 90.6, 5.0),  // "Musa Al-Taamari" onset 90.6
  C('jor-olwan', 'jor-olwan.mp4', 96.8, 3.8),          // "Ali Olwan" onset ~96.8
  C('jor-alarab', 'jor-alarab.mp4', 100.6, 2.4),       // "Yazan Al-Arab" onset ~100.6
  C('jor-rashdan', 'jor-rashdan.mp4', 103.0, 3.2),     // "Nizar Al-Rashdan" onset 103.0
  C('jor-keeper', 'jor-keeper.mp4', 106.2, 5.0),       // "a goalkeeper" onset ~106.2
  // ── RIDDLE / DUEL 113–132 ──
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('jor-wadirum', 'jor-wadirum.mp4', 118.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 123.0, 5.0),
  C('texture-gold-light', 'texture-gold-light.mp4', 128.0, 4.0),  // dim under "the one door"
  // ── DRAMA 132–203.32 (Alvarez 23' goal; Jordan defiant; 34' Al-Taamari WIDE; Messi 67'->71' goal) ──
  C('alvarez-goal', 'alvarez-goal.mp4', 132.0, 5.0),        // 23' opener
  C('keeper-save', 'keeper-save.mp4', 142.0, 5.0),          // Jordan hold
  C('altaamari-shot', 'altaamari-shot.mp4', 159.0, 5.0),    // 34' drive -> just WIDE (no goal)
  C('messi-magic', 'messi-magic.mp4', 178.46, 5.0),         // 67' time bends
  C('messi-goal', 'messi-goal.mp4', 189.58, 4.4),           // 71' the second goal
  // (graphic ScoreBug + 34' title + prediction card fill the gaps over AuroraBeat motion graphics)
  // ── VERDICT 203.32–244 (3 distinct clips + panel; vd-handshake = the shirt swap) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-applaud', 'vd-applaud.mp4', 208.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // ── CTA 303.05–318 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep74 Argentina vs Jordan PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED to VO names (#23). OUR PREDICTION ARG 2-0 JOR (Alvarez 23, Messi 71); 34th-min Al-Taamari shot WIDE; Messi swaps shirts. Legend 074 Aretas Guardian of the Rose-Red Treasury. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 }, { src: 'sfx/goal.mp3', at: 133.5, vol: 0.85 },
    { src: 'sfx/braam.mp3', at: 159.5, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 178.46, vol: 0.6 },
    { src: 'sfx/goal.mp3', at: 191.0, vol: 0.9 }, { src: 'sfx/stamp.mp3', at: 195.0, vol: 0.6 },
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
console.log('Ep74:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
