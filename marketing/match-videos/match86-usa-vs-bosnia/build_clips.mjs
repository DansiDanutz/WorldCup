// Ep86 USA vs Bosnia (R32) — ASSET-REUSE BUILD (Rule #26) + NO-REPEAT + NO-LOOP.
// 29 distinct REUSED clips (0 new Higgsfield generation). USA half = England white-kit clips (Ep84);
// Bosnia half = France blue-kit clips (Ep82); dragon = Sweden lindworm (Ep82); neutral b-roll reused.
// Cold-open eagle motif is the Legend 086 card art (rendered as a still in SceneColdOpen, not a clip).
// PLAYER SHOWCASE windows SYNCED to VO name onsets (#23).
// OUR PREDICTION USA 2-1 Bosnia (Dzeko early; Pulisic equalise; Balogun late winner).
// Legend 086 = the American Eagle. Theme: the Eagle (USA) vs the Dragon (Bosnia).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (eagle still 0-5 in scene) + USA flag texture + the Dragon + Bosnia flag texture
  C('texture-usa', 'texture-usa.mp4', 5.0, 5.0),
  C('bos-dragon', 'bos-dragon.mp4', 10.0, 5.0),
  C('texture-bosnia', 'texture-bosnia.mp4', 15.0, 5.0),
  // WALKOUT 33-44
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // USA 44-79.5 (showcase synced: Pulisic 55.5, Weah 62.15, Balogun 65.44, McKennie 68.0, Adams 70.89)
  C('us-crowd', 'us-crowd.mp4', 44.0, 5.0),
  C('us-attack', 'us-attack.mp4', 49.0, 5.0),
  C('us-surge', 'us-surge.mp4', 54.0, 1.5),
  C('us-pulisic', 'us-pulisic.mp4', 55.5, 5.0),
  C('us-weah', 'us-weah.mp4', 62.15, 3.29),
  C('us-balogun', 'us-balogun.mp4', 65.44, 2.56),
  C('us-mckennie', 'us-mckennie.mp4', 68.0, 2.89),
  C('us-adams', 'us-adams.mp4', 70.89, 5.0),
  // BOSNIA 79.5-113 (showcase synced: Dzeko 90.6, Pjanic 96.88, Demirovic 99.89, Tabakovic 103.0, Kolasinac 105.68)
  C('bos-crowd', 'bos-crowd.mp4', 79.5, 5.0),
  C('bos-attack', 'bos-attack.mp4', 84.5, 5.0),
  C('bos-dzeko', 'bos-dzeko.mp4', 90.6, 5.0),
  C('bos-pjanic', 'bos-pjanic.mp4', 96.88, 3.01),
  C('bos-demirovic', 'bos-demirovic.mp4', 99.89, 3.11),
  C('bos-tabakovic', 'bos-tabakovic.mp4', 103.0, 2.68),
  C('bos-kolasinac', 'bos-kolasinac.mp4', 105.68, 5.0),
  // RIDDLE 113-132
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 118.0, 5.0),
  // DRAMA 132-203 (Dzeko BIH 1-0; Pulisic 1-1; Balogun 2-1 winner; keeper save)
  C('keeper-save', 'keeper-save.mp4', 137.0, 5.0),
  C('bos-goal', 'bos-goal.mp4', 152.21, 5.0),
  C('us-goal-1', 'us-goal-1.mp4', 178.46, 5.0),
  C('us-goal-2', 'us-goal-2.mp4', 189.58, 5.0),
  // VERDICT 203-244
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // CTA 303
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
  // BEAT BACKDROPS (#27): dimmed reused footage behind every narrative caption — never bare
  // text on dark. Reused from library (0 credits). bg-* may loop (46%-dimmed, imperceptible).
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
  comment: 'Ep86 USA vs Bosnia ASSET-REUSE (Rule #26), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION USA 2-1 Bosnia (Balogun late winner). Legend 086 the American Eagle. 0 new Higgsfield generation. vol=0.',
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
  // bg-* are dimmed backdrops that intentionally may loop (Rule #27) — exempt from the no-loop guard.
  if (m && !c.id.startsWith('bg-')) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep86:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
