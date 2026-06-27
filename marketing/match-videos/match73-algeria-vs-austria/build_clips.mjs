// Ep73 Algeria vs Austria — PHOTOREAL (#22) + NO-REPEAT + NO-LOOP (#11).
// 38 distinct photoreal clips, each used ONCE, each window <= its 5.04s source
// (ffmpeg-checked). Title/riddle/drama-build/prediction/verdict/legend/app scenes are
// CSS motion-graphics (no video behind → never loops). NO BLANK FRAMES (#25): every text
// beat sits over a clip (often DIMMED) or rich full-bleed motion graphics (gradient +
// particles + kinetic type), never floating text on near-black.
// PLAYER SHOWCASE windows are SYNCED to the VO name onsets (#23) — ESTIMATED here, to be
// refined from measured mp3 onsets before the full render.
// CANON: OUR PREDICTION Algeria 0–0 Austria — the climax is the 73rd-minute Mahrez
// left-foot curl DEFLECTED WIDE by Alaba (NO goal). REAL fact (bridge): 1982 Disgrace of Gijon.
// Legend 073 = The Krampus of the Alps.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (Tuareg + Krampus + Tassili + Alps; 1982 wound) 0–23 ──
  C('alg-tuareg', 'alg-tuareg.mp4', 0.0, 5.0),
  C('aut-krampus', 'aut-krampus.mp4', 5.0, 5.0),
  C('alg-tassili', 'alg-tassili.mp4', 10.0, 4.5),
  C('aut-alps', 'aut-alps.mp4', 14.5, 3.5),
  C('texture-embers', 'texture-embers.mp4', 18.0, 5.0),   // dim backdrop under the title reveal
  // ── STADIUM / WALKOUT 33–44 (Title 23–33 graphic) ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ── ALGERIA 44–79.5 (showcase synced to names) ──
  C('alg-crowd', 'alg-crowd.mp4', 44.0, 5.0),
  C('alg-tifo', 'alg-tifo.mp4', 49.0, 5.0),
  C('alg-attack', 'alg-attack.mp4', 54.0, 1.5),
  C('alg-mahrez', 'alg-mahrez.mp4', 55.5, 4.5),       // "Riyad Mahrez"
  C('alg-bennacer', 'alg-bennacer.mp4', 60.0, 3.5),   // "Ismael Bennacer"
  C('alg-gouiri', 'alg-gouiri.mp4', 63.5, 4.5),       // "Amine Gouiri"
  C('alg-boudaoui', 'alg-boudaoui.mp4', 68.0, 5.0),   // "Hicham Boudaoui"
  C('alg-mandi', 'alg-mandi.mp4', 73.5, 5.0),         // "Aissa Mandi"
  // ── AUSTRIA 79.5–113 (showcase synced to names) ──
  C('aut-crowd', 'aut-crowd.mp4', 79.5, 5.0),
  C('aut-tifo', 'aut-tifo.mp4', 84.5, 5.0),
  C('aut-attack', 'aut-attack.mp4', 89.6, 1.0),
  C('aut-alaba', 'aut-alaba.mp4', 90.6, 5.0),         // "David Alaba"
  C('aut-sabitzer', 'aut-sabitzer.mp4', 96.0, 3.5),   // "Marcel Sabitzer"
  C('aut-laimer', 'aut-laimer.mp4', 99.5, 3.5),       // "Konrad Laimer"
  C('aut-arnautovic', 'aut-arnautovic.mp4', 103.0, 5.0), // "Marko Arnautovic"
  C('aut-baumgartner', 'aut-baumgartner.mp4', 108.0, 5.0), // "Christoph Baumgartner"
  // ── RIDDLE / DUEL 113–132 ──
  C('duel-mid', 'duel-mid.mp4', 113.0, 5.0),
  C('duel-mahrez-alaba', 'duel-mahrez-alaba.mp4', 118.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 123.0, 5.0),
  C('texture-alpine-mist', 'texture-alpine-mist.mp4', 128.0, 4.0),  // dim under "WHO BLINKS FIRST"
  // ── DRAMA / THE 73RD MINUTE 132–203.32 (0–0; the deflection is the peak, NO goal) ──
  C('sabitzer-shot', 'sabitzer-shot.mp4', 132.0, 5.0),        // DIM backdrop (energy, not a goal)
  C('texture-desert-heat', 'texture-desert-heat.mp4', 137.0, 5.0), // DIM "darbuka vs alpine drum"
  C('keeper-save', 'keeper-save.mp4', 142.0, 5.0),            // L14 keeper claws it away
  C('gouiri-goal', 'gouiri-goal.mp4', 147.0, 5.0),            // DIM backdrop "neither gives an inch"
  C('mahrez-curl', 'mahrez-curl.mp4', 164.37, 5.0),           // L16 the curl
  C('alaba-block', 'alaba-block.mp4', 178.46, 5.0),           // L17 DEFLECTED WIDE (climax, no goal)
  // (graphic 73rd-min title 152–164, build 169–178, "for the burning ones" 185–194, prediction 194–203)
  // ── VERDICT 203.32–244 (3 distinct clips + graphic panel) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-applaud', 'vd-applaud.mp4', 208.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // (Mystery/Legend 255–282.5 + App 282.5–303.05 graphic; App has the phone-collect)
  // ── CTA 303.05–318 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep73 Algeria vs Austria PHOTOREAL, NO-REPEAT+NO-LOOP, showcase SYNCED to VO names (#23). OUR PREDICTION ALG 0-0 AUT — climax = 73rd-min Mahrez curl DEFLECTED WIDE by Alaba (NO goal). Legend 073 The Krampus of the Alps. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 }, { src: 'sfx/braam.mp3', at: 152.21, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 164.37, vol: 0.6 }, { src: 'sfx/braam.mp3', at: 178.46, vol: 0.85 },
    { src: 'sfx/stamp.mp3', at: 195.0, vol: 0.6 }, { src: 'sfx/whoosh.mp3', at: 203.32, vol: 0.55 },
    { src: 'sfx/mystic.mp3', at: 255.5, vol: 0.85 }, { src: 'sfx/pop.mp3', at: 263.0, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 303.05, vol: 0.55 },
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
  if (m) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep73:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK');
