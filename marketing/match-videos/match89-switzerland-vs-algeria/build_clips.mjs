// Ep89 Switzerland vs Algeria (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28)
// + player-likeness (#29). Algeria REUSED from Ep73 under the SAME names (Mahrez/Bennacer/
// Gouiri/Boudaoui/Mandi + crowd/attack/tuareg/tassili + mahrez-curl — likeness QA PASSED).
// Switzerland generated fresh with LIKENESS prompts + real shirt numbers (#29).
// Beat backdrops = 9 ANONYMOUS atmosphere clips reused from Ep86 (#27) + fresh Swiss flag
// texture. Establishing + crowd-tense reused. Showcase windows SYNCED to VO onsets (#23).
// OUR PREDICTION Switzerland 2-1 Algeria (Mahrez early; Embolo equalise; Xhaka late winner).
// Legend 089 = the Mountain. Theme: the Mountain (Switzerland) vs the Fox (Algeria, Fennecs).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Mountain card still 0-5 in scene) + Swiss peak + Algeria desert motifs
  C('sui-mountain', 'sui-mountain.mp4', 5.0, 5.0),
  C('alg-tuareg', 'alg-tuareg.mp4', 10.0, 5.0),
  C('alg-tassili', 'alg-tassili.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // SWITZERLAND 44-79.5 (Xhaka 55.5, Embolo 60.5, Akanji 63.74, Vargas 68.0, Sommer 70.99)
  C('sui-crowd', 'sui-crowd.mp4', 44.0, 5.0),
  C('sui-attack', 'sui-attack.mp4', 49.0, 5.0),
  C('sui-surge', 'sui-surge.mp4', 54.0, 1.5),
  C('sui-xhaka', 'sui-xhaka.mp4', 55.5, 5.0),
  C('sui-embolo', 'sui-embolo.mp4', 60.5, 3.24),
  C('sui-akanji', 'sui-akanji.mp4', 63.74, 4.26),
  C('sui-vargas', 'sui-vargas.mp4', 68.0, 2.99),
  C('sui-sommer', 'sui-sommer.mp4', 70.99, 5.0),
  // ALGERIA 79.5-113 (Mahrez 90.6, Bennacer 96.8, Gouiri 99.95, Boudaoui 103.0, Mandi 105.71)
  C('alg-crowd', 'alg-crowd.mp4', 79.5, 5.0),
  C('alg-attack', 'alg-attack.mp4', 84.5, 5.0),
  C('alg-mahrez', 'alg-mahrez.mp4', 90.6, 5.0),
  C('alg-bennacer', 'alg-bennacer.mp4', 96.8, 3.15),
  C('alg-gouiri', 'alg-gouiri.mp4', 99.95, 3.05),
  C('alg-boudaoui', 'alg-boudaoui.mp4', 103.0, 2.71),
  C('alg-mandi', 'alg-mandi.mp4', 105.71, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Mahrez ALG 1-0; Embolo 1-1; Xhaka 2-1 winner; Sommer save)
  C('sui-save2', 'sui-save2.mp4', 137.0, 5.0),
  C('texture-switzerland', 'texture-switzerland.mp4', 142.0, 10.21),
  C('mahrez-curl', 'mahrez-curl.mp4', 152.21, 5.0),
  C('sui-goal-1', 'sui-goal-1.mp4', 178.46, 5.0),
  C('sui-goal-2', 'sui-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
  // BEAT BACKDROPS (#27): dimmed ANONYMOUS atmosphere reused from Ep86 (0 credits). May loop.
  C('bg-riddle', 'bg-riddle.mp4', 123.0, 9.0),
  C('bg-firing', 'bg-firing.mp4', 132.0, 5.0),
  C('bg-rise', 'bg-rise.mp4', 159.0, 13.0),
  C('bg-believe', 'bg-believe.mp4', 172.0, 6.46),
  C('bg-roar', 'bg-roar.mp4', 185.0, 4.58),
  C('bg-verdict', 'bg-verdict.mp4', 208.32, 5.0),
  C('bg-winner', 'bg-winner.mp4', 213.32, 5.0),
  C('bg-stats', 'bg-stats.mp4', 218.32, 25.68),
];
const out = {
  comment: 'Ep89 Switzerland vs Algeria PHOTOREAL, nation-correct (#28) + likeness (#29), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Switzerland 2-1 Algeria (Xhaka late winner). Legend 089 the Mountain. Algeria reused Ep73; Switzerland fresh; atmo backdrops reused Ep86. vol=0.',
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
// bg-* + texture-switzerland are dimmed BeatCard backdrops (#27) — allowed to loop.
const LOOP_EXEMPT = (id) => id.startsWith('bg-') || id === 'texture-switzerland';
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m && !LOOP_EXEMPT(c.id)) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep89:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
