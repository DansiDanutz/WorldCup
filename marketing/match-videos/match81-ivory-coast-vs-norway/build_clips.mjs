// Ep81 Ivory Coast vs Norway (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP.
// 29 distinct clips, each ONCE, window <= ~5.04s source. NO BLANK FRAMES.
// PLAYER SHOWCASE windows SYNCED to VO name onsets (#23).
// OUR PREDICTION Norway 2-1 Ivory Coast (Haller early; Haaland equalise; Haaland late winner = brace).
// Legend 081 = Fenrir the Unbound Wolf. Theme: the Wolf (Norway/Fenrir) vs the Elephant (Les Elephants).
// no-goal-1 (Haaland equalizer) is rendered from a STILL (Ken-Burns) in match-scenes.jsx — not a clip.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN 0-23 (Fenrir wolf + fjord + sacred elephant + savanna)
  C('no-fenrir', 'no-fenrir.mp4', 0.0, 5.0),
  C('texture-fjord', 'texture-fjord.mp4', 5.0, 5.0),
  C('ci-elephant', 'ci-elephant.mp4', 10.0, 5.0),
  C('texture-savanna', 'texture-savanna.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // IVORY COAST 44-79.5 (showcase synced: Pepe 55.5, Haller 59.8, Kessie 63.2, Singo 68.0, Adingra 75.2)
  C('ci-crowd', 'ci-crowd.mp4', 44.0, 5.0),
  C('ci-attack', 'ci-attack.mp4', 49.0, 5.0),
  C('ci-surge', 'ci-surge.mp4', 54.0, 1.5),
  C('ci-pepe', 'ci-pepe.mp4', 55.5, 4.3),
  C('ci-haller', 'ci-haller.mp4', 59.8, 3.4),
  C('ci-kessie', 'ci-kessie.mp4', 63.2, 4.8),
  C('ci-singo', 'ci-singo.mp4', 68.0, 5.0),
  C('ci-adingra', 'ci-adingra.mp4', 75.2, 4.3),
  // NORWAY 79.5-113 (showcase synced: Haaland 90.6, Odegaard 95.5, Sorloth 99.1, Nusa 103.0, Berge 109.2)
  C('no-crowd', 'no-crowd.mp4', 79.5, 5.0),
  C('no-press', 'no-press.mp4', 84.5, 5.0),
  C('no-haaland', 'no-haaland.mp4', 90.6, 4.9),
  C('no-odegaard', 'no-odegaard.mp4', 95.5, 3.6),
  C('no-sorloth', 'no-sorloth.mp4', 99.1, 3.9),
  C('no-nusa', 'no-nusa.mp4', 103.0, 5.0),
  C('no-berge', 'no-berge.mp4', 109.2, 3.8),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Haller 1-0; Haaland 1-1 [STILL]; Haaland 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 142.0, 5.0),
  C('ci-goal', 'ci-goal.mp4', 152.21, 5.0),
  C('no-goal-2', 'no-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep81 Ivory Coast vs Norway PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Norway 2-1 Ivory Coast (Haaland brace, late winner). Legend 081 Fenrir the Unbound Wolf. Theme: the Wolf vs the Elephant. no-goal-1 equalizer is a Ken-Burns STILL in scenes. vol=0.',
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
console.log('Ep81:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
