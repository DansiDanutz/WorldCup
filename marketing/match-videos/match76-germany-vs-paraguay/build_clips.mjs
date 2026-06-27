// Ep76 Germany vs Paraguay — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 33 distinct photoreal clips, each used ONCE, each window <= its ~5.04s source.
// NO BLANK FRAMES (#25): text beats over clips (often dimmed) or rich motion graphics.
// PLAYER SHOWCASE windows SYNCED to measured VO name onsets (#23).
// CANON-CONSISTENT (no Stories file): OUR PREDICTION Germany 1-0 Paraguay (Havertz heads the
// winner in the 88th, rhyming with the REAL 2002 R16 Germany 1-0 Paraguay, Neuville 88').
// Paraguay resist heroically (Gomez block, keeper) and nearly steal it (Enciso shot WIDE).
// Legend 076 = The Pombero, Lord of the Night.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (Barbarossa + Pombero + Black Forest + ravens) 0–23 ──
  C('ger-barbarossa', 'ger-barbarossa.mp4', 0.0, 5.0),
  C('par-pombero', 'par-pombero.mp4', 5.0, 5.0),
  C('ger-blackforest', 'ger-blackforest.mp4', 10.0, 5.0),
  C('texture-ravens', 'texture-ravens.mp4', 15.0, 5.0),   // dim under the title reveal (NightField tail 20–23)
  // ── STADIUM / WALKOUT 33–44 ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ── GERMANY 44–79.5 (showcase synced to names) ──
  C('ger-crowd', 'ger-crowd.mp4', 44.0, 5.0),
  C('ger-tifo', 'ger-tifo.mp4', 49.0, 5.0),
  C('ger-attack', 'ger-attack.mp4', 54.0, 1.5),
  C('ger-wirtz', 'ger-wirtz.mp4', 55.5, 4.0),         // "Florian Wirtz" onset 55.5
  C('ger-musiala', 'ger-musiala.mp4', 59.5, 4.4),     // "Jamal Musiala" onset ~59.5
  C('ger-havertz', 'ger-havertz.mp4', 63.9, 4.1),     // "Kai Havertz" onset ~63.9
  C('ger-kimmich', 'ger-kimmich.mp4', 68.0, 2.8),     // "Joshua Kimmich" onset 68.0
  C('ger-rudiger', 'ger-rudiger.mp4', 70.8, 5.0),     // "Antonio Rudiger" onset ~70.8
  // ── PARAGUAY 79.5–113 (showcase synced to names) ──
  C('par-crowd', 'par-crowd.mp4', 79.5, 5.0),
  C('par-tifo', 'par-tifo.mp4', 84.5, 5.0),
  C('par-gomez', 'par-gomez.mp4', 90.6, 4.3),         // "Gustavo Gomez" onset 90.6
  C('par-almiron', 'par-almiron.mp4', 94.9, 2.5),     // "Miguel Almiron" onset ~94.9
  C('par-enciso', 'par-enciso.mp4', 97.4, 5.0),       // "Julio Enciso" onset ~97.4
  C('par-diego', 'par-diego.mp4', 103.0, 2.9),        // "Diego Gomez" onset 103.0
  C('par-sanabria', 'par-sanabria.mp4', 105.9, 5.0),  // "Antonio Sanabria" onset ~105.9
  // ── RIDDLE / DUEL 113–132 ──
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // ── DRAMA 132–203.32 (Paraguay resist; Enciso WIDE; Gomez block; Havertz 88' winner) ──
  C('keeper-save', 'keeper-save.mp4', 132.0, 5.0),        // Paraguay defiant
  C('enciso-shot', 'enciso-shot.mp4', 152.21, 5.0),       // the near-miss (shot WIDE)
  C('gomez-block', 'gomez-block.mp4', 172.0, 5.0),        // heroic last-ditch block
  C('wirtz-magic', 'wirtz-magic.mp4', 178.46, 5.0),       // the buildup
  C('havertz-goal', 'havertz-goal.mp4', 189.58, 4.4),     // 88' winner
  // ── VERDICT 203.32–244 (3 distinct clips + panel) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-applaud', 'vd-applaud.mp4', 208.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // ── CTA 303.05–318 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep76 Germany vs Paraguay PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED to VO names (#23). OUR PREDICTION GER 1-0 PAR (Havertz 88, rhyming the real 2002 Neuville 88). Legend 076 The Pombero Lord of the Night. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 }, { src: 'sfx/braam.mp3', at: 152.7, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 178.46, vol: 0.6 }, { src: 'sfx/goal.mp3', at: 191.0, vol: 0.92 },
    { src: 'sfx/stamp.mp3', at: 195.0, vol: 0.6 }, { src: 'sfx/whoosh.mp3', at: 203.32, vol: 0.55 },
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
console.log('Ep76:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
