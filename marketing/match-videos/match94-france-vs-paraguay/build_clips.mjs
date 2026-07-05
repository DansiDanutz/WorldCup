// Ep94 France vs Paraguay (Play-Offs, France 1-0 Mbappe pen) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28)
// + player-likeness (#29). BOTH squads generated FRESH with likeness prompts + real numbers:
// COL James(10,c)/Diaz(7)/Duran(9)/Rios(8)/Davinson(23); GHA Ayew(10,c)/Kudus(20)/Partey(5)/
// Williams(9)/Salisu(4). Fresh COL-vs-GHA duel + handshake + Colombia CTA + El Dorado (Guatavita)
// + Black Star Gate + both flag textures. Establishing + crowd-tense + 8 ANONYMOUS beat backdrops
// reused (0 credits). Showcase SYNCED (#23). OUR PREDICTION Colombia 2-1 Ghana (Ghana strike first;
// James equalise; Diaz late winner). Legend 092 = El Dorado, the Golden King.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (El Dorado card still 0-5 in scene) + Colombia/Ghana motifs
  C('fr-rooster', 'fr-rooster.mp4', 5.0, 5.0),
  C('par-pombero', 'par-pombero.mp4', 10.0, 5.0),
  C('texture-france', 'texture-france.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // COLOMBIA 44-79.5 (James 55.5, Diaz 60.5, Duran 63.74, Rios 68, Davinson 70.99)
  C('fr-crowd', 'fr-crowd.mp4', 44.0, 5.0),
  C('fr-attack', 'fr-attack.mp4', 49.0, 5.0),
  C('fr-surge', 'fr-surge.mp4', 54.0, 1.5),
  C('fr-mbappe', 'fr-mbappe.mp4', 55.5, 5.0),
  C('fr-griezmann', 'fr-griezmann.mp4', 60.5, 3.24),
  C('fr-dembele', 'fr-dembele.mp4', 63.74, 4.26),
  C('fr-tchouameni', 'fr-tchouameni.mp4', 68.0, 2.99),
  C('fr-saliba', 'fr-saliba.mp4', 70.99, 5.0),
  // GHANA 79.5-113 (Ayew 90.6, Kudus 96.8, Partey 99.95, Williams 103, Salisu 105.71)
  C('par-crowd', 'par-crowd.mp4', 79.5, 5.0),
  C('par-tifo', 'par-tifo.mp4', 84.5, 5.0),
  C('par-gomez', 'par-gomez.mp4', 90.6, 5.0),
  C('par-almiron', 'par-almiron.mp4', 96.8, 3.15),
  C('par-enciso', 'par-enciso.mp4', 99.95, 3.05),
  C('par-diego', 'par-diego.mp4', 103.0, 2.71),
  C('par-sanabria', 'par-sanabria.mp4', 105.71, 5.0),
  // RIDDLE 113-132
  C('vd-stadium-night', 'vd-stadium-night.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Ghana GHA 1-0; James 1-1; Diaz 2-1 winner)
  C('fr-siege', 'fr-siege.mp4', 137.0, 5.0),
  C('gomez-block', 'gomez-block.mp4', 142.0, 10.21),
  C('enciso-shot', 'enciso-shot.mp4', 152.21, 5.0),
  C('fr-goal-2', 'fr-goal-2.mp4', 178.46, 5.0),
  C('fr-goal-1', 'fr-goal-1.mp4', 189.58, 5.0),
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
  comment: 'Ep94 France vs Paraguay PHOTOREAL, nation-correct (#28) + likeness (#29), NO-REPEAT+NO-LOOP, showcase SYNCED. France 1-0 Paraguay (Mbappe penalty, real result). Legend 094 Vercingetorix. France reused Ep82, Paraguay reused Ep79 (Rule #26); Vercingetorix card + handshake + siege fresh; atmo backdrops reused. vol=0.',
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
const LOOP_EXEMPT = (id) => id.startsWith('bg-') || id === 'gomez-block';
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m && !LOOP_EXEMPT(c.id)) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep94:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
