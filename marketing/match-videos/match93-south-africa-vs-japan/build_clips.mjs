// Ep93 Japan vs South Africa (R16-1) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28)
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
  C('jpn-tengu', 'jpn-tengu.mp4', 5.0, 5.0),
  C('rsa-impundulu', 'rsa-impundulu.mp4', 10.0, 5.0),
  C('texture-fuji', 'texture-fuji.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // COLOMBIA 44-79.5 (James 55.5, Diaz 60.5, Duran 63.74, Rios 68, Davinson 70.99)
  C('jpn-crowd', 'jpn-crowd.mp4', 44.0, 5.0),
  C('jpn-tifo', 'jpn-tifo.mp4', 49.0, 5.0),
  C('jpn-surge', 'jpn-surge.mp4', 54.0, 1.5),
  C('jpn-mitoma', 'jpn-mitoma.mp4', 55.5, 5.0),
  C('jpn-kubo', 'jpn-kubo.mp4', 60.5, 3.24),
  C('jpn-doan', 'jpn-doan.mp4', 63.74, 4.26),
  C('jpn-endo', 'jpn-endo.mp4', 68.0, 2.99),
  C('jpn-kamada', 'jpn-kamada.mp4', 70.99, 5.0),
  // GHANA 79.5-113 (Ayew 90.6, Kudus 96.8, Partey 99.95, Williams 103, Salisu 105.71)
  C('rsa-crowd', 'rsa-crowd.mp4', 79.5, 5.0),
  C('rsa-tifo', 'rsa-tifo.mp4', 84.5, 5.0),
  C('rsa-williams', 'rsa-williams.mp4', 90.6, 5.0),
  C('rsa-foster', 'rsa-foster.mp4', 96.8, 3.15),
  C('rsa-mokoena', 'rsa-mokoena.mp4', 99.95, 3.05),
  C('rsa-zwane', 'rsa-zwane.mp4', 103.0, 2.71),
  C('rsa-mofokeng', 'rsa-mofokeng.mp4', 105.71, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Ghana GHA 1-0; James 1-1; Diaz 2-1 winner)
  C('rsa-surge', 'rsa-surge.mp4', 137.0, 5.0),
  C('texture-storm', 'texture-storm.mp4', 142.0, 10.21),
  C('rsa-goal-1', 'rsa-goal-1.mp4', 152.21, 5.0),
  C('kubo-goal', 'kubo-goal.mp4', 178.46, 5.0),
  C('mitoma-goal', 'mitoma-goal.mp4', 189.58, 5.0),
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
  comment: 'Ep93 Japan vs South Africa PHOTOREAL, nation-correct (#28) + likeness (#29), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Japan 2-1 South Africa (Mitoma late winner). Legend 093 Susanoo the Storm God. Both squads REUSED (Ep77 SA / Ep78 JPN, Rule #26); SA goal + Susanoo card fresh; atmo backdrops reused. vol=0.',
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
const LOOP_EXEMPT = (id) => id.startsWith('bg-') || id === 'texture-storm';
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m && !LOOP_EXEMPT(c.id)) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep93:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
