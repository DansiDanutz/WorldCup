// Ep90 Brazil vs Germany (R32) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28)
// + player-likeness (#29). Germany REUSED from Ep79 (Rule #26): Barbarossa/blackforest/ravens,
// crowd/attack/wirtz-magic, Wirtz/Kimmich/Musiala/Havertz/Rudiger + havertz-goal. Brazil
// generated fresh with LIKENESS prompts + real shirt numbers (#29). Beat backdrops = ANONYMOUS
// atmosphere reused from Ep86 (#27) + fresh Brazil flag texture. Establishing + crowd-tense reused.
// Showcase windows SYNCED to VO onsets (#23).
// OUR PREDICTION Brazil 2-1 Germany (Havertz early; Vinicius equalise; late Brazil winner).
// Legend 090 = the Golden Canary. Theme: the Canary (Brazil) vs the King (Germany, Barbarossa).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Canary card still 0-5 in scene) + German Barbarossa motifs
  C('ger-barbarossa', 'ger-barbarossa.mp4', 5.0, 5.0),
  C('texture-ravens', 'texture-ravens.mp4', 10.0, 5.0),
  C('ger-blackforest', 'ger-blackforest.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // BRAZIL 44-79.5 (Vinicius 55.5, Rodrygo 60.5, Raphinha 63.74, Casemiro 68.0, Marquinhos 70.99)
  C('bra-crowd', 'bra-crowd.mp4', 44.0, 5.0),
  C('bra-attack', 'bra-attack.mp4', 49.0, 5.0),
  C('bra-surge', 'bra-surge.mp4', 54.0, 1.5),
  C('bra-vinicius', 'bra-vinicius.mp4', 55.5, 5.0),
  C('bra-rodrygo', 'bra-rodrygo.mp4', 60.5, 3.24),
  C('bra-raphinha', 'bra-raphinha.mp4', 63.74, 4.26),
  C('bra-casemiro', 'bra-casemiro.mp4', 68.0, 2.99),
  C('bra-marquinhos', 'bra-marquinhos.mp4', 70.99, 5.0),
  // GERMANY 79.5-113 (Wirtz 90.6, Kimmich 96.8, Musiala 99.95, Havertz 103.0, Rudiger 105.71)
  C('ger-crowd', 'ger-crowd.mp4', 79.5, 5.0),
  C('ger-attack', 'ger-attack.mp4', 84.5, 5.0),
  C('ger-wirtz', 'ger-wirtz.mp4', 90.6, 5.0),
  C('ger-kimmich', 'ger-kimmich.mp4', 96.8, 3.15),
  C('ger-musiala', 'ger-musiala.mp4', 99.95, 3.05),
  C('ger-havertz', 'ger-havertz.mp4', 103.0, 2.71),
  C('ger-rudiger', 'ger-rudiger.mp4', 105.71, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Havertz GER 1-0; Vinicius 1-1; late Brazil winner)
  C('ger-attack2', 'wirtz-magic.mp4', 137.0, 5.0),
  C('texture-brazil', 'texture-brazil.mp4', 142.0, 10.21),
  C('havertz-goal', 'havertz-goal.mp4', 152.21, 5.0),
  C('bra-goal-1', 'bra-goal-1.mp4', 178.46, 5.0),
  C('bra-goal-2', 'bra-goal-2.mp4', 189.58, 5.0),
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
  comment: 'Ep90 Brazil vs Germany PHOTOREAL, nation-correct (#28) + likeness (#29), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Brazil 2-1 Germany (late Brazil winner). Legend 090 the Golden Canary. Germany reused Ep79; Brazil fresh; atmo backdrops reused Ep86. vol=0.',
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
// bg-* + texture-brazil are dimmed BeatCard backdrops (#27) — allowed to loop.
const LOOP_EXEMPT = (id) => id.startsWith('bg-') || id === 'texture-brazil';
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m && !LOOP_EXEMPT(c.id)) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep90:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
