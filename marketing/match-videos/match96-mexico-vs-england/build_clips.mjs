// Ep96 Mexico vs England (Play-Offs) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// Mexico REUSED from Ep83 (Rule #26): crowd/attack/goal/quetzal motif + corrected showcase clips
// Lozano(22)/Álvarez(4,c)/Vega(10)/Montes(3) (re-generated after an Ep83/84 likeness audit found
// wrong shirt numbers baked into the original footage — Vega's original clip showed "18" instead
// of "10" and was regenerated a second time after this episode's own QA pass caught it too).
// Giménez(9) is a FRESH animation this episode, built from a newly corrected still (green kit,
// clean #9, no broadcast-graphic overlay) via kling3_0_turbo. England REUSED from Ep84 (Rule #26):
// crowd/attack/surge/goal/lions motif + Kane(9,c)/Bellingham(10)/Rice(4) (audited and found correct
// as-is) + corrected Saka(7). Foden was removed after a squad-accuracy correction (no longer in
// the England squad — same class of fix as Ep94's Griezmann removal), so England runs 4 named
// showcases, not 5. Fresh (3 gens): a nation-correct Mexico-vs-England pitch
// walkout (neither prior ep had this pairing, and Ep83/84's shared "library" walkout/crowd clips
// were found to show wrong third-party kit colours + baked-in broadcast score bugs on frame-by-frame
// QA — replaced, not reused), a nation-correct captains' handshake, and the Quetzalcoatl Legend 096
// card art. Generic/anonymous atmosphere reused (0 credits): stadium-wide, stadium-aerial (both
// verified clean on QA — no readable graphics, no kits). Ep83/84's "duel-mid", "crowd-tense" and
// "cta-celebrate" were DROPPED after QA found they visibly show Ecuador's yellow/blue kit, flags and
// scoreboard graphics baked into the footage (leftover from Ep83's actual opponent) — wrong for a
// Mexico-vs-England episode, so those beats use a plain graded backdrop + text instead of a
// contaminated clip (see README "Correction log"). OUR PREDICTION England 2-1 Mexico (Mexico strike
// first in a raucous home-crowd moment; Kane equalises; Bellingham — the Big-Game King — late
// winner). Legend 096 = Quetzalcoatl, the Feathered Serpent (Mexico).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Quetzalcoatl card art 0-5 in scene) + Mexico/England motifs
  C('mx-quetzal', 'mx-quetzal.mp4', 5.0, 5.0),
  C('eng-lions', 'eng-lions.mp4', 10.0, 5.0),
  C('texture-mexico', 'texture-mexico.mp4', 15.0, 5.0),
  // WALKOUT 33-44 (fresh nation-correct pairing; verified no broadcast graphics)
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // MEXICO 44-79.5 (Giménez 55.5, Lozano 60.3, Álvarez 65.1, Vega 69.9, Montes 74.7 — evenly spaced,
  // all 10 showcase clips are ~5.04s real length so no uneven-duration workaround is needed)
  C('mx-crowd', 'mx-crowd.mp4', 44.0, 5.0),
  C('mx-gimenez', 'mx-gimenez.mp4', 55.5, 4.8),
  C('mx-lozano', 'mx-lozano.mp4', 60.3, 4.8),
  C('mx-alvarez', 'mx-alvarez.mp4', 65.1, 4.8),
  C('mx-vega', 'mx-vega.mp4', 69.9, 4.8),
  C('mx-montes', 'mx-montes.mp4', 74.7, 4.8),
  // ENGLAND 79.5-113 (Kane 90.6, Bellingham 95.08, Saka 99.56, Rice 104.04). Foden REMOVED —
  // squad-accuracy correction, he is no longer in the England squad (same class of fix as Ep94's
  // Griezmann removal). DO NOT RE-ADD eng-foden. Rice's showcase moved up into Foden's old slot;
  // 108.52-113 is now a generic no-clip/no-name beat (see match-scenes.jsx SceneEngland).
  C('eng-crowd', 'eng-crowd.mp4', 79.5, 5.0),
  C('eng-kane', 'eng-kane.mp4', 90.6, 4.48),
  C('eng-bellingham', 'eng-bellingham.mp4', 95.08, 4.48),
  C('eng-saka', 'eng-saka.mp4', 99.56, 4.48),
  C('eng-rice', 'eng-rice.mp4', 104.04, 4.48),
  // RIDDLE 113-132 (stadium-aerial replaces the Ecuador-contaminated duel-mid in the 113-118 slot;
  // texture-england moved here from the England-intro section so every clip is used exactly once)
  C('stadium-aerial', 'stadium-aerial.mp4', 113.0, 5.0),
  C('texture-england', 'texture-england.mp4', 118.0, 5.0),
  // DRAMA 132-203.32 (Mexico 1-0 via home crowd; Kane 1-1; Bellingham 2-1 winner). Build-up + goal
  // pairs reuse the SAME narrative arc Ep84 already told for Kane/Bellingham (its own prediction was
  // England 2-1 DR Congo via Kane equalizer + Bellingham late winner) — eng-goal-1/eng-goal-2 are a
  // perfect fit reuse, not a re-purposing stretch. eng-attack + eng-surge both build tension before
  // Kane's equaliser; Bellingham's late winner beat uses a text-only filler instead of a dedicated
  // build-up clip (no spare clip for it, and it keeps the distinct-clip count exactly matched).
  C('mx-attack', 'mx-attack.mp4', 138.0, 5.0),
  C('mx-goal', 'mx-goal.mp4', 148.21, 5.0),
  C('eng-attack', 'eng-attack.mp4', 160.0, 5.04),
  C('eng-goal-1', 'eng-goal-1.mp4', 170.0, 5.04),
  C('eng-surge', 'eng-surge.mp4', 182.0, 5.04),
  C('eng-goal-2', 'eng-goal-2.mp4', 192.0, 5.04),
  // VERDICT 203.32-244 (fresh nation-correct handshake; generic, no named individuals)
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244 / CTA 303.05: intentionally NO clip (see comment above) — plain graded backdrop +
  // AmbientParticles/Confetti carries these beats instead of a contaminated reused clip.
];
const out = {
  comment: 'Ep96 Mexico vs England PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION England 2-1 Mexico (Bellingham late winner). Legend 096 Quetzalcoatl the Feathered Serpent. Mexico reused Ep83, England reused Ep84 (Rule #26); Giménez re-animated fresh from a corrected still, Vega regenerated a second time after this episode QA caught a #18-vs-#10 mismatch; walkout + handshake + Quetzalcoatl card fresh; Ecuador-contaminated Ep83 generic clips (duel-mid/crowd-tense/cta-celebrate) dropped, not reused. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 }, { src: 'sfx/goal.mp3', at: 148.7, vol: 0.9 },
    { src: 'sfx/whoosh.mp3', at: 160.0, vol: 0.6 }, { src: 'sfx/goal.mp3', at: 170.5, vol: 0.92 },
    { src: 'sfx/goal.mp3', at: 192.4, vol: 0.95 }, { src: 'sfx/stamp.mp3', at: 195.0, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 203.32, vol: 0.55 }, { src: 'sfx/mystic.mp3', at: 255.5, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 263.0, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 303.05, vol: 0.55 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt = {}; clips.forEach(c => cnt[c.src] = (cnt[c.src] || 0) + 1);
const reused = Object.entries(cnt).filter(([, k]) => k > 1);
if (reused.length) { console.error('NO-REPEAT VIOLATION:', reused); process.exit(1); }
const LOOP_EXEMPT = (id) => id.startsWith('bg-');
let loop = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m && !LOOP_EXEMPT(c.id)) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]); if (c.dur > real + 0.06) loop.push(`${c.id} ${c.dur}>${real.toFixed(2)}`); }
}
if (loop.length) { console.error('NO-LOOP VIOLATION:', loop); process.exit(1); }
console.log('Ep96:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, NO-REPEAT OK, no-loop OK');
