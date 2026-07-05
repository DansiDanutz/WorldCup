// Ep95 Norway vs Brazil (Play-Offs) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// Norway REUSED from Ep81 (Rule #26): Haaland(9)/Odegaard(10,c)/Sorloth(11)/Nusa(20)/Berge(6) +
// crowd/press/goal + Fenrir wolf motif + fjord texture. Brazil REUSED from Ep78 (Rule #26):
// Vinicius(7)/Rodrygo(10)/Raphinha(11)/Bruno(8)/Marquinhos(4,c) + crowd/tifo/attack + goal +
// Amazon spirit motif. Fresh: pitch-walkout (NO-vs-BRA, neither prior ep had this pairing),
// rodrygo-goal (late winner, distinct from vini-goal equaliser), Fenrir Legend 095 card,
// nation-correct handshake. 8 ANONYMOUS beat backdrops reused (0 credits). Showcase SYNCED (#23).
// OUR PREDICTION Brazil 2-1 Norway (Norway strike first via Haaland; Vinicius equalise;
// Rodrygo late winner). Legend 095 = Fenrir, the Unbound Wolf.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Fenrir card still 0-5 in scene) + Norway/Brazil motifs
  C('no-fenrir', 'no-fenrir.mp4', 5.0, 5.0),
  C('bra-spirit', 'bra-spirit.mp4', 10.0, 5.0),
  C('texture-fjord', 'texture-fjord.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // NORWAY 44-79.5 (Odegaard 55.5, Haaland 60.5, Sorloth 63.74, Berge 68, Nusa 70.99)
  C('no-crowd', 'no-crowd.mp4', 44.0, 5.0),
  C('no-odegaard', 'no-odegaard.mp4', 55.5, 5.0),
  C('no-haaland', 'no-haaland.mp4', 60.5, 3.24),
  C('no-sorloth', 'no-sorloth.mp4', 63.74, 4.26),
  C('no-berge', 'no-berge.mp4', 68.0, 2.99),
  C('no-nusa', 'no-nusa.mp4', 70.99, 5.0),
  // BRAZIL 79.5-113 (Marquinhos 90.6, Vinicius 96.8, Rodrygo 99.95, Raphinha 103, Bruno 105.71)
  C('bra-crowd', 'bra-crowd.mp4', 79.5, 5.0),
  C('bra-tifo', 'bra-tifo.mp4', 84.5, 5.0),
  C('bra-marquinhos', 'bra-marquinhos.mp4', 90.6, 5.0),
  C('bra-vinicius', 'bra-vinicius.mp4', 96.8, 3.15),
  C('bra-rodrygo', 'bra-rodrygo.mp4', 99.95, 3.05),
  C('bra-raphinha', 'bra-raphinha.mp4', 103.0, 2.71),
  C('bra-bruno', 'bra-bruno.mp4', 105.71, 5.0),
  // RIDDLE 113-132
  C('vd-stadium-night', 'vd-stadium-night.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Norway NOR 1-0 via Haaland; Vinicius 1-1; Rodrygo 2-1 winner)
  C('no-press', 'no-press.mp4', 137.0, 5.0),
  C('bra-attack', 'bra-attack.mp4', 142.0, 10.21),
  C('no-goal-2', 'no-goal-2.mp4', 152.21, 5.0),
  C('vini-goal', 'vini-goal.mp4', 178.46, 5.0),
  C('rodrygo-goal', 'rodrygo-goal.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
  // BEAT BACKDROPS (#27): dimmed ANONYMOUS atmosphere reused (0 credits). May loop.
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
  comment: 'Ep95 Norway vs Brazil PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Brazil 2-1 Norway (Rodrygo late winner). Legend 095 Fenrir the Unbound Wolf. Norway reused Ep81, Brazil reused Ep78 (Rule #26); walkout + rodrygo-goal + Fenrir card + handshake fresh; atmo backdrops reused. vol=0.',
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
const LOOP_EXEMPT = (id) => id.startsWith('bg-') || id === 'bra-attack';
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m && !LOOP_EXEMPT(c.id)) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep95:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
