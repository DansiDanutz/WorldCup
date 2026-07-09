// Ep75 Brazil vs Japan — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 32 distinct photoreal clips, each used ONCE, each window <= its ~5.04s source.
// NO BLANK FRAMES (#25): text beats over clips (often dimmed) or rich motion graphics.
// PLAYER SHOWCASE windows SYNCED to measured VO name onsets (#23).
// CANON-CONSISTENT (no Stories file — authored fresh): OUR PREDICTION Brazil 2-1 Japan
// (Ueda 18' shock; Vinicius 55' equaliser; Endrick 84' winner). Legend 075 = The Curupira.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (Curupira/Amazon + Fuji + samba + torii) 0–23 ──
  C('bra-amazon', 'bra-amazon.mp4', 0.0, 5.0),
  C('jpn-fuji', 'jpn-fuji.mp4', 5.0, 5.0),
  C('bra-carnival', 'bra-carnival.mp4', 10.0, 4.0),
  C('jpn-torii', 'jpn-torii.mp4', 14.0, 4.0),
  C('texture-emerald', 'texture-emerald.mp4', 18.0, 5.0),   // dim under the title reveal
  // ── STADIUM / WALKOUT 33–44 ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ── BRAZIL 44–79.5 (showcase synced to names) ──
  C('bra-crowd', 'bra-crowd.mp4', 44.0, 5.0),
  C('bra-tifo', 'bra-tifo.mp4', 49.0, 5.0),
  C('bra-vinicius', 'bra-vinicius.mp4', 55.5, 3.6),     // "Vinicius Junior" onset 55.5
  C('bra-raphinha', 'bra-raphinha.mp4', 59.1, 3.6),     // "Raphinha" onset ~59.1
  C('bra-endrick', 'bra-endrick.mp4', 62.7, 5.0),       // "Endrick" onset ~62.7
  C('bra-bruno', 'bra-bruno.mp4', 68.0, 2.9),           // "Bruno Guimaraes" onset 68.0
  C('bra-marquinhos', 'bra-marquinhos.mp4', 70.9, 5.0), // "Marquinhos" onset ~70.9
  // ── JAPAN 79.5–113 (showcase synced to names) ──
  C('jpn-crowd', 'jpn-crowd.mp4', 79.5, 5.0),
  C('jpn-tifo', 'jpn-tifo.mp4', 84.5, 5.0),
  C('jpn-kubo', 'jpn-kubo.mp4', 90.6, 4.3),             // "Takefusa Kubo" onset 90.6
  C('jpn-ueda', 'jpn-ueda.mp4', 94.9, 2.4),             // "Ayase Ueda" onset ~94.9
  C('jpn-kamada', 'jpn-kamada.mp4', 97.3, 5.0),         // "Daichi Kamada" onset ~97.3
  C('jpn-itakura', 'jpn-itakura.mp4', 103.0, 4.6),      // "Ko Itakura" onset ~103.0
  C('jpn-doan', 'jpn-doan.mp4', 107.6, 5.0),            // "Ritsu Doan" onset ~107.6
  // ── RIDDLE / DUEL 113–132 ──
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // ── DRAMA 132–203.32 (Ueda 18' shock; keeper holds; Vinicius 55'; Endrick 84' winner) ──
  C('jpn-goal', 'jpn-goal.mp4', 132.0, 5.0),            // 18' Ueda shock lead
  C('keeper-save', 'keeper-save.mp4', 142.0, 5.0),      // Japan defiant
  C('vini-goal', 'vini-goal.mp4', 164.37, 5.0),         // 55' equaliser
  C('endrick-goal', 'endrick-goal.mp4', 189.58, 4.4),   // 84' winner
  // (graphic ScoreBug + 55'/84' titles + prediction card over AuroraBeat motion graphics)
  // ── VERDICT 203.32–244 (the bow; 3 distinct clips + panel) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-applaud', 'vd-applaud.mp4', 208.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // ── CTA 303.05–318 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep75 Brazil vs Japan PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED to VO names (#23). OUR PREDICTION BRA 2-1 JPN (Ueda 18, Vinicius 55, Endrick 84). Legend 075 The Curupira Guardian of the Wild Green. vol=0.',
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
    { src: 'sfx/goal.mp3', at: 166.0, vol: 0.9 }, { src: 'sfx/whoosh.mp3', at: 178.46, vol: 0.6 },
    { src: 'sfx/goal.mp3', at: 191.0, vol: 0.92 }, { src: 'sfx/stamp.mp3', at: 195.0, vol: 0.6 },
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
console.log('Ep75:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
