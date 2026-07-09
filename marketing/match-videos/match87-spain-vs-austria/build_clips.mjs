// Ep87 Spain vs Austria (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// Spain generated fresh (nano_banana_2 -> kling3_0_turbo). Austria REUSED from Ep73 (Rule #26,
// same nation). Beat backdrops = 9 ANONYMOUS atmosphere clips reused from Ep86 (#27). Establishing
// reused. PLAYER SHOWCASE windows SYNCED to VO onsets (#23).
// OUR PREDICTION Spain 2-1 Austria (Sabitzer early; Yamal equalise; Morata late winner).
// Legend 087 = the Spanish Bull. Theme: the Bull (Spain) vs the Eagle (Austria).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (bull still 0-5 in scene) + Spain flag + the Austrian Eagle + Austria flag
  C('texture-spain', 'texture-spain.mp4', 5.0, 5.0),
  C('aut-eagle', 'aut-eagle.mp4', 10.0, 5.0),
  C('texture-austria', 'texture-austria.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // SPAIN 44-79.5 (Morata 55.5, Yamal 61.47, Pedri 65.47, Rodri 68.0, Nico 74.19)
  C('spa-crowd', 'spa-crowd.mp4', 44.0, 5.0),
  C('spa-attack', 'spa-attack.mp4', 49.0, 5.0),
  C('spa-surge', 'spa-surge.mp4', 54.0, 1.5),
  C('spa-morata', 'spa-morata.mp4', 55.5, 5.0),
  C('spa-yamal', 'spa-yamal.mp4', 61.47, 4.0),
  C('spa-pedri', 'spa-pedri.mp4', 65.47, 2.53),
  C('spa-rodri', 'spa-rodri.mp4', 68.0, 5.0),
  C('spa-nicowilliams', 'spa-nicowilliams.mp4', 74.19, 5.0),
  // AUSTRIA 79.5-113 (Alaba 90.6, Sabitzer 96.07, Arnautovic 99.52, Laimer 103.0, Baumgartner 106.36)
  C('aut-crowd', 'aut-crowd.mp4', 79.5, 5.0),
  C('aut-attack', 'aut-attack.mp4', 84.5, 5.0),
  C('aut-alaba', 'aut-alaba.mp4', 90.6, 5.0),
  C('aut-sabitzer', 'aut-sabitzer.mp4', 96.07, 3.45),
  C('aut-arnautovic', 'aut-arnautovic.mp4', 99.52, 3.48),
  C('aut-laimer', 'aut-laimer.mp4', 103.0, 3.36),
  C('aut-baumgartner', 'aut-baumgartner.mp4', 106.36, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Sabitzer AUT 1-0; Yamal 1-1; Morata 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('aut-goal', 'aut-goal.mp4', 152.21, 5.0),
  C('spa-goal-1', 'spa-goal-1.mp4', 178.46, 5.0),
  C('spa-goal-2', 'spa-goal-2.mp4', 189.58, 5.0),
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
  comment: 'Ep87 Spain vs Austria PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Spain 2-1 Austria (Morata late winner). Legend 087 the Spanish Bull. Spain fresh; Austria reused Ep73; atmo backdrops reused Ep86. vol=0.',
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
console.log('Ep87:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
