// build_clips.mjs — Ep106 WORLD CUP 2026 GRAND FINALE & AWARDS. Emits clips.json.
// A CONTIGUOUS clip BED tiles every scene so footage sits behind every second (Rule #25); the scene
// JSX dims the bed under text beats (Rule #27) and overlays only labels/awards/score/CTA. Feature clips
// (players, awards, goal, trophy) appear ONCE; atmospheric backdrops (dust/rays/embers/crowd/stadium)
// recur as dimmed/bright bed tiles behind text (single-letter -x suffix). No tile's dur exceeds its
// real source (#11). Coverage-checked (no gap >0.2s across 0..336).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const V = (b) => `assets/clips/${b}.mp4`;
// [id, base, at, len] — contiguous grid; feature clips aligned to their VO/award/goal onsets.
const B = [
  // INTRO 0–24 (the trophy in mist — who does the game remember?)
  ['trophy-altar','trophy-altar',0.0,5.0],['ghost-mist','ghost-mist',5.0,5.0],['faceoff-silhouette','faceoff-silhouette',10.0,5.0],['embers-rise','embers-rise',15.0,5.0],['light-rays-gold','light-rays-gold',20.0,4.0],
  // TITLE 24–36
  ['gold-dust','gold-dust',24.0,5.0],['destiny-rays','destiny-rays',29.0,5.0],['gold-dust-t','gold-dust',34.0,2.0],
  // GHOSTS 36–91 (Mbappé Golden Boot @52 · Messi last dance @74 · genius/silver @81)
  ['stadium-wide','stadium-wide',36.0,5.0],['stadium-glow','stadium-glow',41.0,5.0],['night-rays-blue','night-rays-blue',46.0,5.0],['gold-dust-a','gold-dust',51.0,1.0],
  ['mbappe-run','mbappe-run',52.0,5.0],['light-rays-gold-b','light-rays-gold',57.0,5.0],['embers-b','embers-rise',62.0,1.0],['destiny-rays-b','destiny-rays',63.0,5.0],['gold-dust-b','gold-dust',68.0,5.0],['crowd-tense','crowd-tense',73.0,1.0],
  ['messi-show','messi-show',74.0,5.0],['arg-crowd','arg-crowd',79.0,2.0],['messi-golden','messi-golden',81.0,5.0],['arg-despair','arg-despair',86.0,5.0],
  // FINAL 91–145 (red card @98.5 · Ferran GOAL @128 · celebration @137)
  ['stadium-wide-b','stadium-wide',91.0,5.0],['arg-crowd2','arg-crowd2',96.0,2.5],['crowd-tense-b','crowd-tense',98.5,5.0],['night-rays-blue-b','night-rays-blue',103.5,5.0],['embers-c','embers-rise',108.5,1.0],['gold-dust-c','gold-dust',109.5,5.0],
  ['spain-crowd','spain-crowd',114.5,5.0],['crowd-tense-c','crowd-tense',119.5,2.5],['stadium-glow-b','stadium-glow',122.0,5.0],
  ['ferran-strike','ferran-strike',127.0,5.0],['goal-net','goal-net',132.0,5.0],['ferran-celeb','ferran-celeb',137.0,5.0],['gold-dust-d','gold-dust',142.0,3.0],
  // AWARDS 145–206 (Simón GG @153.5 · Cubarsí YP @162 · Rodri GB @177.5 · comeback → thank myself @198)
  ['spain-crowd-b','spain-crowd',145.0,5.0],['crowd-tense-d','crowd-tense',150.0,3.5],['simon-save','simon-save',153.5,2.2],['stadium-glow-f','stadium-glow',155.7,2.8],['stadium-glow-c','stadium-glow',158.5,3.5],
  ['cubarsi-show','cubarsi-show',162.0,5.0],['destiny-rays-c','destiny-rays',167.0,4.0],['crowd-tense-e','crowd-tense',171.0,5.0],['light-rays-gold-c','light-rays-gold',176.0,1.5],
  ['rodri-trophy','rodri-trophy',177.5,5.0],['trophy-hands','trophy-hands',182.5,5.0],['destiny-rays-d','destiny-rays',187.5,5.0],['embers-d','embers-rise',192.5,5.0],['gold-dust-e','gold-dust',197.5,0.5],['light-rays-gold-d','light-rays-gold',198.0,5.0],['gold-dust-f','gold-dust',203.0,3.0],
  // CROWN 206–219 (Spain lift @206 · glory shared @214.5)
  ['spain-lift','spain-lift',206.0,5.0],['destiny-rays-e','destiny-rays',211.0,3.5],['champions-handshake','champions-handshake',214.5,4.5],
  // MESSI CODA 219–245 (stood still @219.5 · weathered face @227.5 · into the night @237)
  ['night-rays-blue-c','night-rays-blue',219.0,0.5],['messi-final','messi-final',219.5,5.0],['arg-crowd-b','arg-crowd',224.5,3.0],['messi-coda2','messi-coda2',227.5,5.0],['ghost-mist-b','ghost-mist',232.5,4.5],['messi-goal2','messi-goal2',237.0,5.0],['embers-e','embers-rise',242.0,3.0],
  // VERDICT 245–266 (premium result + awards card)
  ['destiny-rays-f','destiny-rays',245.0,5.0],['light-rays-gold-e','light-rays-gold',250.0,5.0],['gold-dust-h','gold-dust',255.0,5.0],['embers-f','embers-rise',260.0,5.0],['destiny-rays-g','destiny-rays',265.0,1.0],
  // ENGAGE 266–277
  ['night-rays-blue-d','night-rays-blue',266.0,5.0],['crowd-tense-f','crowd-tense',271.0,5.0],['stadium-glow-e','stadium-glow',276.0,1.0],
  // MYSTERY / SANT JORDI 277–303
  ['destiny-rays-h','destiny-rays',277.0,5.0],['light-rays-gold-f','light-rays-gold',282.0,5.0],['gold-dust-i','gold-dust',287.0,5.0],['embers-g','embers-rise',292.0,5.0],['destiny-rays-i','destiny-rays',297.0,5.0],['light-rays-gold-g','light-rays-gold',302.0,1.0],
  // APP 303–324.5
  ['gold-dust-j','gold-dust',303.0,5.0],['destiny-rays-j','destiny-rays',308.0,5.0],['light-rays-gold-h','light-rays-gold',313.0,5.0],['embers-h','embers-rise',318.0,5.0],['gold-dust-k','gold-dust',323.0,1.5],
  // CTA 324.5–336
  ['light-rays-gold-i','light-rays-gold',324.5,5.0],['destiny-rays-k','destiny-rays',329.5,5.0],['gold-dust-l','gold-dust',334.5,1.5],
];

const END = 336;
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

// coverage: no gap > 0.20s across [0,END]
const sorted = [...clips].sort((a,b)=>a.at-b.at);
let cover = 0, gaps = [];
for (const c of sorted) { if (c.at > cover + 0.20) gaps.push(`gap ${cover.toFixed(2)}->${c.at.toFixed(2)}`); cover = Math.max(cover, c.at + c.dur); }
if (END > cover + 0.20) gaps.push(`tail ${cover.toFixed(2)}->${END}`);
if (gaps.length) { console.error('COVERAGE GAPS', gaps); process.exit(1); }

// feature-src uniqueness (ids without a single-letter -x suffix must be unique src)
const feat = {};
for (const c of clips) { if (/-[a-z]$/.test(c.id)) continue; feat[c.src]=(feat[c.src]||0)+1; }
const dup = Object.entries(feat).filter(([,n])=>n>1);
if (dup.length) { console.error('FEATURE-DUP', dup); process.exit(1); }

const out = {
  comment: 'Ep106 WORLD CUP 2026 GRAND FINALE & AWARDS. VERIFIED (tournament over): SPAIN 1-0 ARGENTINA (AET) in the final; Ferran Torres (sub, no goals all tournament) scored 106 (39s into 2nd half ET) past Emiliano Martinez, Argentina down to 10 after Enzo stoppage-time red. Spain 2nd title. Awards: Golden Boot Mbappe (10, first back-to-back), Golden Ball Rodri (back from ACL + back injury, I want to thank myself), Golden Glove Unai Simon (7 CS), Young Player Cubarsi (19); Messi Silver Boot in his last WC. THEME = The Crown and the Golden Ghosts. Legend 106 = SANT JORDI (Saint George of Catalonia): slays the dragon, a red rose blooms (victory + rebirth). Photoreal (Rule#22), nation-correct #28 (Spain red, France blue, Argentina blue/white), no hands on ball except GK-in-box #6, real-results-only #7. Contiguous BED (#25), features unique, backdrops recur bright/dimmed behind text (#27), no dur>source (#11), coverage-checked. Music: Kevin MacLeod / incompetech CC-BY 4.0. Clips vol=0.',
  clips,
  music: { cues: [
    { src:'music/cue-tense.mp3',  at:0,   dur:91,  vol:0.42, fadeIn:1.0, fadeOut:4, loop:true },
    { src:'music/cue-epic.mp3',   at:91,  dur:154, vol:0.40, fadeIn:2.0, fadeOut:4, loop:true },
    { src:'music/cue-heroic.mp3', at:245, dur:91,  vol:0.44, fadeIn:2.5, fadeOut:6, loop:true },
  ]},
  sfx: { hits: [
    { src:'sfx/heartbeat.mp3', at:0.3,  vol:0.85 }, { src:'sfx/braam.mp3', at:1.2,  vol:0.8 },
    { src:'sfx/mystic.mp3',    at:10.2, vol:0.6 },  { src:'sfx/braam.mp3', at:16.2, vol:0.7 },
    { src:'sfx/whoosh.mp3',    at:23.6, vol:0.6 },  { src:'sfx/braam.mp3', at:36.0, vol:0.5 },
    { src:'sfx/pop.mp3', at:52.0, vol:0.5 }, { src:'sfx/pop.mp3', at:74.0, vol:0.5 },
    { src:'sfx/whoosh.mp3', at:91.0, vol:0.55 }, { src:'sfx/mystic.mp3', at:98.6, vol:0.5 },
    { src:'sfx/goal.mp3', at:128.0, vol:0.96 }, { src:'sfx/stamp.mp3', at:132.4, vol:0.7 },
    { src:'sfx/whoosh.mp3', at:145.0, vol:0.5 }, { src:'sfx/pop.mp3', at:153.5, vol:0.5 },
    { src:'sfx/pop.mp3', at:162.0, vol:0.5 }, { src:'sfx/pop.mp3', at:177.5, vol:0.55 },
    { src:'sfx/braam.mp3', at:206.0, vol:0.65 }, { src:'sfx/stamp.mp3', at:206.4, vol:0.72 },
    { src:'sfx/mystic.mp3', at:219.5, vol:0.55 }, { src:'sfx/stamp.mp3', at:245.5, vol:0.7 },
    { src:'sfx/mystic.mp3', at:277.0, vol:0.8 }, { src:'sfx/stamp.mp3', at:295.0, vol:0.78 },
    { src:'sfx/pop.mp3', at:308.0, vol:0.6 }, { src:'sfx/whoosh.mp3', at:324.5, vol:0.55 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const distinct = new Set(clips.map(c=>c.src)).size;
console.log(`Ep106: ${clips.length} tiles, ${distinct} distinct clips, NO-LOOP ok, coverage ok, feature-unique ok, covers to ${cover.toFixed(1)}s`);
