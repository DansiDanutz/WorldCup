// Ep77 South Africa vs Canada — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 33 distinct photoreal clips, each used ONCE, each window <= its ~5.04s source.
// NO BLANK FRAMES (#25): clips punctuate; SceneDrama/Verdict gradients+text fill the gaps.
// PLAYER SHOWCASE windows SYNCED to measured VO name onsets (#23).
// CANON-CONSISTENT (no Stories file): OUR PREDICTION 1-1 a.e.t., South Africa WIN ON PENALTIES
// (Jonathan David puts Canada ahead; Lyle Foster equalises; Ronwen Williams — the real AFCON
// four-save keeper — saves the decisive kick). Legend 077 = The Impundulu, the Lightning Bird.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (Thunderbird + Canadian aurora + Impundulu + savanna storm) 0–23 ──
  C('can-thunderbird', 'can-thunderbird.mp4', 0.0, 5.0),
  C('texture-aurora', 'texture-aurora.mp4', 5.0, 5.0),
  C('rsa-impundulu', 'rsa-impundulu.mp4', 10.0, 5.0),
  C('texture-storm', 'texture-storm.mp4', 15.0, 5.0),   // dim under title reveal (StormTitle tail 20–23)
  // ── STADIUM / WALKOUT 33–44 ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ── CANADA 44–79.5 (showcase synced to names) ──
  C('can-crowd', 'can-crowd.mp4', 44.0, 5.0),
  C('can-tifo', 'can-tifo.mp4', 49.0, 5.0),
  C('can-attack', 'can-attack.mp4', 54.0, 1.5),
  C('can-davies', 'can-davies.mp4', 55.5, 5.0),       // "Alphonso Davies" onset 55.5
  C('can-david', 'can-david.mp4', 61.6, 4.0),         // "Jonathan David" onset ~61.6
  C('can-larin', 'can-larin.mp4', 65.76, 2.3),        // "Cyle Larin" onset ~65.76
  C('can-eustaquio', 'can-eustaquio.mp4', 68.0, 5.0), // "Stephen Eustaquio" onset 68.0
  C('can-buchanan', 'can-buchanan.mp4', 74.46, 5.0),  // "Tajon Buchanan" onset ~74.46
  // ── SOUTH AFRICA 79.5–113 (showcase synced to names) ──
  C('rsa-crowd', 'rsa-crowd.mp4', 79.5, 5.0),
  C('rsa-tifo', 'rsa-tifo.mp4', 84.5, 5.0),
  C('rsa-williams', 'rsa-williams.mp4', 90.6, 5.0),     // "Ronwen Williams" onset 90.6
  C('rsa-foster', 'rsa-foster.mp4', 96.21, 2.6),        // "Lyle Foster" onset ~96.21
  C('rsa-mokoena', 'rsa-mokoena.mp4', 98.84, 4.1),      // "Teboho Mokoena" onset ~98.84
  C('rsa-zwane', 'rsa-zwane.mp4', 103.13, 5.0),         // "Themba Zwane" onset ~103.13
  C('rsa-mofokeng', 'rsa-mofokeng.mp4', 110.48, 2.5),   // "Relebohile Mofokeng" onset ~110.48
  // ── RIDDLE / DUEL 113–132 ──
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // ── DRAMA 132–198.58 (Canada lead via David; Foster equalises; shootout; Williams saves) ──
  C('can-wave', 'can-wave.mp4', 132.0, 5.0),             // Canada come in waves
  C('david-goal', 'david-goal.mp4', 152.21, 5.0),        // David finishes — Canada 1-0
  C('rsa-surge', 'rsa-surge.mp4', 164.37, 5.0),          // Bafana fight back
  C('foster-equalizer', 'foster-equalizer.mp4', 178.46, 5.0), // Foster equalises — 1-1
  C('pen-buildup', 'pen-buildup.mp4', 189.58, 4.0),      // the shootout, nerves of glass
  C('williams-save', 'williams-save.mp4', 193.58, 5.0),  // Williams saves the decisive kick
  // ── VERDICT 203.32–244 (2 distinct clips + panel) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // ── CTA 303.05–318 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep77 South Africa vs Canada PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED to VO names (#23). OUR PREDICTION 1-1 a.e.t., SOUTH AFRICA WIN ON PENALTIES (Williams saves). Legend 077 The Impundulu Lightning Bird. vol=0.',
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
    { src: 'sfx/braam.mp3', at: 189.58, vol: 0.7 }, { src: 'sfx/stamp.mp3', at: 194.8, vol: 0.7 },
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
console.log('Ep77:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
