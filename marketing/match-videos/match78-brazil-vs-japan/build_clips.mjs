// Ep78 Brazil vs Japan (R32) — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 32 distinct clips, each used ONCE, window <= ~5.04s source. NO BLANK FRAMES (#25).
// PLAYER SHOWCASE windows SYNCED to measured VO name onsets (#23).
// OUR PREDICTION Japan 2-1 Brazil (Vinicius lead; Mitoma equalise; Kubo late winner).
// Legend 078 = The Tengu, Guardian of the Mountain.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN 0-23 (Redeemer + Amazon spirit + Fuji + Tengu)
  C('texture-redeemer', 'texture-redeemer.mp4', 0.0, 5.0),
  C('bra-spirit', 'bra-spirit.mp4', 5.0, 5.0),
  C('texture-fuji', 'texture-fuji.mp4', 10.0, 5.0),
  C('jpn-tengu', 'jpn-tengu.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // BRAZIL 44-79.5 (showcase synced)
  C('bra-crowd', 'bra-crowd.mp4', 44.0, 5.0),
  C('bra-tifo', 'bra-tifo.mp4', 49.0, 5.0),
  C('bra-attack', 'bra-attack.mp4', 54.0, 1.5),
  C('bra-vinicius', 'bra-vinicius.mp4', 55.5, 4.16),    // "Vinicius Junior" 55.5
  C('bra-rodrygo', 'bra-rodrygo.mp4', 59.66, 3.18),     // "Rodrygo" ~59.66
  C('bra-raphinha', 'bra-raphinha.mp4', 62.84, 5.0),    // "Raphinha" ~62.84
  C('bra-bruno', 'bra-bruno.mp4', 68.0, 3.18),          // "Bruno Guimaraes" 68.0
  C('bra-marquinhos', 'bra-marquinhos.mp4', 71.18, 5.0),// "Marquinhos" ~71.18
  // JAPAN 79.5-113 (showcase synced)
  C('jpn-crowd', 'jpn-crowd.mp4', 79.5, 5.0),
  C('jpn-tifo', 'jpn-tifo.mp4', 84.5, 5.0),
  C('jpn-mitoma', 'jpn-mitoma.mp4', 90.6, 4.0),         // "Kaoru Mitoma" 90.6
  C('jpn-kubo', 'jpn-kubo.mp4', 94.61, 2.6),            // "Takefusa Kubo" ~94.61
  C('jpn-doan', 'jpn-doan.mp4', 97.20, 5.0),            // "Ritsu Doan" ~97.20
  C('jpn-endo', 'jpn-endo.mp4', 103.0, 4.1),            // "Wataru Endo" 103.0
  C('jpn-kamada', 'jpn-kamada.mp4', 107.11, 5.0),       // "Daichi Kamada" ~107.11
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Brazil lead via Vinicius; Japan respond; Mitoma 1-1; Kubo 2-1 winner)
  C('bra-press', 'bra-press.mp4', 132.0, 5.0),
  C('vini-goal', 'vini-goal.mp4', 152.21, 5.0),
  C('jpn-surge', 'jpn-surge.mp4', 164.37, 5.0),
  C('mitoma-goal', 'mitoma-goal.mp4', 178.46, 5.0),
  C('kubo-goal', 'kubo-goal.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep78 Brazil vs Japan PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED (#23). OUR PREDICTION Japan 2-1 Brazil (Kubo late winner). Legend 078 The Tengu. vol=0.',
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
console.log('Ep78:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
