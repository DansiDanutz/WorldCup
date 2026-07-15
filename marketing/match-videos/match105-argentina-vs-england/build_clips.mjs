// build_clips.mjs — Ep105 Argentina vs England (THE SEMIFINAL). Emits clips.json.
// A CONTIGUOUS clip BED tiles every scene so footage sits behind every second (Rule #25); the scene
// JSX dims the bed under text beats (Rule #27) and overlays only text. Feature clips (players, goals,
// penalties, walkouts, celebrations) appear ONCE; atmospheric backdrops (mist/rays/dust/crowd) recur
// as dimmed bed tiles behind text (id suffix -b/-c/...). No tile's dur exceeds its real source (#11).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const V = (b) => `assets/clips/${b}.mp4`;
// [id, base, at, len] — clean 5.0 grid per scene (dur clamps to ~4.97 -> 0.03s gaps, well under the
// 0.20s coverage threshold); feature clips aligned to their VO/goal onsets.
const B = [
  // INTRO 0–24 (ghosts of the rivalry)
  ['ghost-mist','ghost-mist',0.0,5.0],['old-rivalry','old-rivalry',5.0,5.0],['ghost-mist2','ghost-mist2',10.0,5.0],['embers-rise','embers-rise',15.0,5.0],['destiny-rays','destiny-rays',20.0,4.2],
  // TITLE 24–36
  ['gold-dust','gold-dust',24.0,5.0],['light-rays-gold','light-rays-gold',29.0,5.0],['gold-dust-t','gold-dust',34.0,2.2],
  // STADIUM 36–47
  ['pitch-walkout','pitch-walkout',36.0,5.0],['stadium-wide','stadium-wide',41.0,5.0],['pitch-walkout-b','pitch-walkout',46.0,1.2],
  // ARGENTINA 47–72 (Messi 57, Álvarez 67)
  ['arg-crowd','arg-crowd',47.0,5.0],['stadium-glow','stadium-glow',52.0,5.0],['messi-show','messi-show',57.0,5.0],['night-rays-blue','night-rays-blue',62.0,5.0],['alvarez-show','alvarez-show',67.0,5.0],
  // ENGLAND 72–98 (Kane 82.2, Bellingham 90.5)
  ['eng-crowd','eng-crowd',72.0,5.0],['eng-march','eng-march',77.0,5.0],['kane-show','kane-show',82.0,5.0],['eng-captain-regal','eng-captain-regal',87.0,3.5],['bell-show','bell-show',90.5,5.0],['eng-walkout4','eng-walkout4',95.5,2.6],
  // RIDDLE / the curse 98–116
  ['ghost-mist-b','ghost-mist',98.0,5.0],['eng-kane-finish','eng-kane-finish',103.0,5.0],['crowd-tense','crowd-tense',108.0,5.0],['old-rivalry-b','old-rivalry',113.0,3.1],
  // DRAMA 116–200 (Kane 130.5, Messi1 138.6, Bell 145.5, Messi2 159.6)
  ['gold-dust-c','gold-dust',116.0,5.0],['eng-attack','eng-attack',121.0,5.0],['kane-goal','kane-goal',126.0,5.0],['arg-attack','arg-attack',131.0,5.0],['messi-goal1','messi-goal1',136.0,5.0],['bell-goal','bell-goal',141.0,5.0],['arg-crowd-b','arg-crowd',146.0,5.0],['goal-net','goal-net',151.0,5.0],['messi-goal2','messi-goal2',156.0,5.0],['embers-b','embers-rise',161.0,5.0],['gold-dust-d','gold-dust',166.0,5.0],['ghost-mist2-b','ghost-mist2',171.0,5.0],['pen-spot-b','pen-spot',176.0,5.0],['old-rivalry-c','old-rivalry',181.0,5.0],['crowd-tense-b','crowd-tense',186.0,5.0],['stadium-wide-b','stadium-wide',191.0,5.0],['night-rays-blue-b','night-rays-blue',196.0,4.1],
  // PENS 200–246 (save 217, winner 233.9)
  ['pen-spot','pen-spot',200.0,5.0],['stadium-glow-b','stadium-glow',205.0,5.0],['gold-dust-e','gold-dust',210.0,5.0],['pen-save','pen-save',215.0,5.0],['keeper-hero','keeper-hero',220.0,5.0],['crowd-tense-c','crowd-tense',225.0,5.0],['pen-winner','pen-winner',230.0,5.0],['eng-pileon','eng-pileon',235.0,5.0],['stadium-wide-c','stadium-wide',240.0,5.0],['gold-dust-p','gold-dust',245.0,1.1],
  // GOLDEN BOOT 246–262
  ['messi-golden','messi-golden',246.0,5.0],['arg-despair','arg-despair',251.0,5.0],['destiny-rays-b','destiny-rays',256.0,5.0],['gold-dust-q','gold-dust',261.0,1.1],
  // VERDICT 262–283
  ['eng-march-b','eng-march',262.0,5.0],['embers-c','embers-rise',267.0,5.0],['light-rays-gold-b','light-rays-gold',272.0,5.0],['gold-dust-f','gold-dust',277.0,5.0],['destiny-rays-c','destiny-rays',282.0,1.1],
  // ENGAGE 283–295
  ['night-rays-blue-c','night-rays-blue',283.0,5.0],['crowd-tense-d','crowd-tense',288.0,5.0],['stadium-glow-c','stadium-glow',293.0,2.1],
  // MYSTERY / Excalibur 295–324
  ['destiny-rays-d','destiny-rays',295.0,5.0],['light-rays-gold-c','light-rays-gold',300.0,5.0],['gold-dust-g','gold-dust',305.0,5.0],['embers-d','embers-rise',310.0,5.0],['destiny-rays-e','destiny-rays',315.0,5.0],['light-rays-gold-d','light-rays-gold',320.0,4.1],
  // APP 324–347
  ['gold-dust-h','gold-dust',324.0,5.0],['destiny-rays-f','destiny-rays',329.0,5.0],['light-rays-gold-e','light-rays-gold',334.0,5.0],['embers-e','embers-rise',339.0,5.0],['gold-dust-i','gold-dust',344.0,3.1],
  // CTA 347–361
  ['light-rays-gold-f','light-rays-gold',347.0,5.0],['destiny-rays-g','destiny-rays',352.0,5.0],['gold-dust-j','gold-dust',357.0,4.1],
];

const clips = [], loops = [];
for (const [id, base, at, len] of B) {
  const src = V(base);
  if (!fs.existsSync(src)) { console.error('MISSING', src); process.exit(1); }
  const r = spawnSync('ffprobe', ['-v','quiet','-show_entries','format=duration','-of','csv=p=0', src], { encoding:'utf8' });
  const real = parseFloat((r.stdout||'').trim());
  const dur = Math.min(len, real - 0.03);
  if (dur > real + 0.06) loops.push(`${id} ${dur}>${real}`);
  clips.push({ id, src, at:+at.toFixed(2), dur:+dur.toFixed(2), vol:0 });
}
if (loops.length) { console.error('NO-LOOP VIOLATION', loops); process.exit(1); }

// coverage: no gap > 0.20s across [0,361]
const sorted = [...clips].sort((a,b)=>a.at-b.at);
let cover = 0, gaps = [];
for (const c of sorted) { if (c.at > cover + 0.20) gaps.push(`gap ${cover.toFixed(2)}->${c.at.toFixed(2)}`); cover = Math.max(cover, c.at + c.dur); }
if (361 > cover + 0.20) gaps.push(`tail ${cover.toFixed(2)}->361`);
if (gaps.length) { console.error('COVERAGE GAPS', gaps); process.exit(1); }

// feature-src uniqueness (ids without a -x suffix must be unique src)
const feat = {};
for (const c of clips) { if (/-[a-z]$/.test(c.id)) continue; feat[c.src]=(feat[c.src]||0)+1; }
const dup = Object.entries(feat).filter(([,n])=>n>1);
if (dup.length) { console.error('FEATURE-DUP', dup); process.exit(1); }

const out = {
  comment: 'Ep105 Argentina vs England THE SEMIFINAL. OUR PREDICTION 2-2, ENGLAND WIN 4-3 ON PENALTIES (reach the final); Messi scores both (Golden Boot in defeat), Kane + Bellingham score. Photoreal i2v (Rule#22) from likeness stills (Messi/Alvarez/Kane/Bellingham), nation-correct (#28), name-synced (#23). Contiguous clip BED tiles every scene (footage behind every second, #25); feature clips unique, atmospheric backdrops recur DIMMED behind text (#27); no dur>source (#11); coverage-checked (no gap >0.2s). Legend 105 = Excalibur / the Once-and-Future King (novel). Music: Kevin MacLeod / incompetech CC-BY 4.0 (Ghostpocalypse, Clash Defiant, Heroic Age). Clips vol=0.',
  clips,
  music: { cues: [
    { src:'music/cue-tense.mp3',  at:0,   dur:98,  vol:0.42, fadeIn:1.0, fadeOut:4, loop:true },
    { src:'music/cue-epic.mp3',   at:98,  dur:148, vol:0.40, fadeIn:2.0, fadeOut:4, loop:true },
    { src:'music/cue-heroic.mp3', at:246, dur:115, vol:0.44, fadeIn:2.5, fadeOut:6, loop:true },
  ]},
  sfx: { hits: [
    { src:'sfx/heartbeat.mp3', at:0.3,  vol:0.85 }, { src:'sfx/braam.mp3', at:1.2,  vol:0.8 },
    { src:'sfx/mystic.mp3',    at:10.2, vol:0.6 },  { src:'sfx/braam.mp3', at:16.2, vol:0.7 },
    { src:'sfx/whoosh.mp3',    at:23.6, vol:0.6 },  { src:'sfx/braam.mp3', at:36.0, vol:0.5 },
    { src:'sfx/pop.mp3', at:57.0, vol:0.5 }, { src:'sfx/pop.mp3', at:67.0, vol:0.5 },
    { src:'sfx/whoosh.mp3', at:72.0, vol:0.5 }, { src:'sfx/pop.mp3', at:82.5, vol:0.5 },
    { src:'sfx/pop.mp3', at:90.6, vol:0.5 }, { src:'sfx/mystic.mp3', at:98.2, vol:0.6 },
    { src:'sfx/goal.mp3', at:130.5, vol:0.92 }, { src:'sfx/goal.mp3', at:138.6, vol:0.92 },
    { src:'sfx/goal.mp3', at:145.5, vol:0.92 }, { src:'sfx/goal.mp3', at:159.6, vol:0.94 },
    { src:'sfx/heartbeat.mp3', at:200.0, vol:0.8 }, { src:'sfx/whistle.mp3', at:217.0, vol:0.8 },
    { src:'sfx/goal.mp3', at:233.9, vol:0.96 }, { src:'sfx/stamp.mp3', at:240.0, vol:0.7 },
    { src:'sfx/braam.mp3', at:246.0, vol:0.6 }, { src:'sfx/mystic.mp3', at:295.0, vol:0.8 },
    { src:'sfx/stamp.mp3', at:308.5, vol:0.75 }, { src:'sfx/pop.mp3', at:330.0, vol:0.6 },
    { src:'sfx/whoosh.mp3', at:347.0, vol:0.55 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const distinct = new Set(clips.map(c=>c.src)).size;
console.log(`Ep105: ${clips.length} tiles, ${distinct} distinct clips, NO-LOOP ok, coverage ok, feature-unique ok, covers to ${cover.toFixed(1)}s`);
