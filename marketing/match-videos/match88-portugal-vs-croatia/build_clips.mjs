// Ep88 Portugal vs Croatia (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// Portugal REUSED from Ep71 (same nation, Rule #26): Ronaldo/Bruno/Leao/Dias/Bernardo + crowd/
// attack/fog. Croatia generated fresh (checkerboard). Beat backdrops = 9 ANONYMOUS atmosphere
// clips reused from Ep86 (#27). Establishing + keeper + crowd-tense reused.
// PLAYER SHOWCASE windows SYNCED to VO onsets (#23).
// OUR PREDICTION Portugal 2-1 Croatia (Kramaric early; Ronaldo equalise; Bruno late winner).
// Legend 088 = the Navigator. Theme: the Navigator (Portugal) vs the Fire (Croatia, Vatreni).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (navigator still 0-5 in scene) + Portugal fog king + Croatia fire + Croatia flag
  C('portugal-fog', 'portugal-fog.mp4', 5.0, 5.0),
  C('cro-fire', 'cro-fire.mp4', 10.0, 5.0),
  C('texture-croatia', 'texture-croatia.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // PORTUGAL 44-79.5 (Ronaldo 55.5, Bruno 60.84, Leao 64.75, Dias 68.0, Bernardo 70.82)
  C('por-crowd', 'por-crowd.mp4', 44.0, 5.0),
  C('por-attack', 'por-attack.mp4', 49.0, 5.0),
  C('por-surge', 'por-surge.mp4', 54.0, 1.5),
  C('por-ronaldo', 'por-ronaldo.mp4', 55.5, 5.0),
  C('por-bruno', 'por-bruno.mp4', 60.84, 3.91),
  C('por-leao', 'por-leao.mp4', 64.75, 3.25),
  C('por-dias', 'por-dias.mp4', 68.0, 2.82),
  C('por-bernardo', 'por-bernardo.mp4', 70.82, 5.0),
  // CROATIA 79.5-113 (Modric 90.6, Gvardiol 95.1, Kramaric 98.16, Kovacic 103.0, Perisic 106.2)
  C('cro-crowd', 'cro-crowd.mp4', 79.5, 5.0),
  C('cro-attack', 'cro-attack.mp4', 84.5, 5.0),
  C('cro-modric', 'cro-modric.mp4', 90.6, 4.5),
  C('cro-gvardiol', 'cro-gvardiol.mp4', 95.1, 3.06),
  C('cro-kramaric', 'cro-kramaric.mp4', 98.16, 4.84),
  C('cro-kovacic', 'cro-kovacic.mp4', 103.0, 3.2),
  C('cro-perisic', 'cro-perisic.mp4', 106.2, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Kramaric CRO 1-0; Ronaldo 1-1; Bruno 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('cro-goal', 'cro-goal.mp4', 152.21, 5.0),
  C('por-goal-1', 'por-goal-1.mp4', 178.46, 5.0),
  C('por-goal-2', 'por-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
  // BEAT BACKDROPS (#27): dimmed ANONYMOUS atmosphere reused from Ep86 (0 credits). May loop.
  C('bg-riddle', 'bg-riddle.mp4', 123.0, 9.0),
  C('bg-firing', 'bg-firing.mp4', 132.0, 5.0),
  C('bg-shaken', 'bg-shaken.mp4', 142.0, 10.21),
  C('bg-rise', 'bg-rise.mp4', 159.0, 13.0),
  C('bg-believe', 'bg-believe.mp4', 172.0, 6.46),
  C('bg-roar', 'bg-roar.mp4', 185.0, 4.58),
  C('bg-verdict', 'bg-verdict.mp4', 208.32, 5.0),
  C('bg-winner', 'bg-winner.mp4', 213.32, 5.0),
  C('bg-stats', 'bg-stats.mp4', 218.32, 25.68),
];
const out = {
  comment: 'Ep88 Portugal vs Croatia PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Portugal 2-1 Croatia (Bruno late winner). Legend 088 the Navigator. Portugal reused Ep71; Croatia fresh; atmo backdrops reused Ep86. vol=0.',
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
  if (m && !c.id.startsWith('bg-')) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep88:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
