// Ep100 Switzerland vs Colombia (Play-Offs) — MILESTONE 100TH EPISODE — PHOTOREAL + NO-REPEAT +
// NO-LOOP + nation-correct (#28). Switzerland showcases (Xhaka/Embolo/Akanji/Vargas/Sommer) FRESH
// this episode — no recoverable manifest existed for Ep89's originals (independent audit found the
// audit-log claims unverifiable; regenerated from scratch with explicit likeness+number prompts per
// Rule #29, one round-trip needed on Sommer after two attempts baked in the wrong number).
// Switzerland's generic/atmosphere clips (crowd/attack/goal-1/surge/goal-2/texture-switzerland) were
// ALSO freshly generated for the same reason. Colombia REUSED from Ep92 (Rule #26): crowd/attack/
// goal-1/texture-colombia + all 5 showcases (James Rodríguez/Díaz/Durán/Ríos/Dávinson Sánchez) —
// audited frame-by-frame against their Ep92 URLs and found ALL CORRECT as-is, reused unchanged.
// Fresh (3 gens): a nation-correct Switzerland-vs-Colombia pitch walkout (neither prior episode had
// this exact pairing), a nation-correct captains' handshake (generic, no named individuals; first
// attempt read ambiguous/vintage-styled and was regenerated), and the Wilhelm Tell Legend 100 card
// art (portrait + landscape derived crop). Generics (verified clean, reused 0 credits): stadium-wide,
// stadium-aerial. Both squads run 5 named showcases each this episode — no squad-accuracy omission
// was needed. OUR PREDICTION Switzerland 2-1 Colombia (Colombia strike first through Díaz; Embolo
// levels it 1-1; late, Xhaka — the captain who never misses — scores the winner). Legend 100 =
// Wilhelm Tell, the Marksman (Switzerland, real/sourced Tellenlegende, distinct from Legend 029's
// Alpine Guide, Legend 052's Watchmaker and Legend 089's Mountain).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Wilhelm Tell card art 0-5 in scene) + Switzerland/Colombia motifs
  C('texture-switzerland', 'texture-switzerland.mp4', 5.0, 5.0),
  C('texture-colombia', 'texture-colombia.mp4', 10.0, 5.0),
  // WALKOUT 33-44 (fresh nation-correct pairing; verified no broadcast graphics)
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // SWITZERLAND 44-79.5 (Xhaka 55.5, Embolo 60.3, Akanji 65.1, Vargas 69.9, Sommer 74.7)
  C('sui-crowd', 'sui-crowd.mp4', 44.0, 5.0),
  C('sui-xhaka', 'sui-xhaka.mp4', 55.5, 4.8),
  C('sui-embolo', 'sui-embolo.mp4', 60.3, 4.8),
  C('sui-akanji', 'sui-akanji.mp4', 65.1, 4.8),
  C('sui-vargas', 'sui-vargas.mp4', 69.9, 4.8),
  C('sui-sommer', 'sui-sommer.mp4', 74.7, 4.8),
  // COLOMBIA 79.5-113 (James 90.6, Díaz 95.08, Durán 99.56, Ríos 104.04, Dávinson 108.52)
  C('co-crowd', 'co-crowd.mp4', 79.5, 5.0),
  C('co-james', 'co-james.mp4', 90.6, 4.48),
  C('co-diaz', 'co-diaz.mp4', 95.08, 4.48),
  C('co-duran', 'co-duran.mp4', 99.56, 4.48),
  C('co-rios', 'co-rios.mp4', 104.04, 4.48),
  C('co-davinson', 'co-davinson.mp4', 108.52, 4.48),
  // RIDDLE 113-132 (generic verified-clean library clip; only ONE distinct motif clip exists per
  // nation this episode — texture-switzerland + texture-colombia are both already used once each in
  // the cold open, so 118-123 uses a plain graded backdrop + text instead of a repeated clip)
  C('stadium-aerial', 'stadium-aerial.mp4', 113.0, 5.0),
  // DRAMA 132-203.32 (Colombia 1-0 via Díaz's pace; Embolo 1-1; Xhaka 2-1 winner). Build-up + goal
  // pairs use each nation's own footage — no cross-episode narrative re-purposing.
  C('co-attack', 'co-attack.mp4', 138.0, 5.0),
  C('co-goal-1', 'co-goal-1.mp4', 148.21, 5.0),
  C('sui-attack', 'sui-attack.mp4', 160.0, 5.04),
  C('sui-goal-1', 'sui-goal-1.mp4', 170.0, 5.04),
  C('sui-surge', 'sui-surge.mp4', 182.0, 5.04),
  C('sui-goal-2', 'sui-goal-2.mp4', 192.0, 5.04),
  // VERDICT 203.32-244 (fresh nation-correct handshake; generic, no named individuals)
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244 / CTA 303.05: intentionally NO clip (plain graded backdrop + AmbientParticles/
  // Confetti carries these beats, same pattern as Ep96/97).
];
const out = {
  comment: 'Ep100 Switzerland vs Colombia PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. MILESTONE 100TH EPISODE. OUR PREDICTION Switzerland 2-1 Colombia (Xhaka late winner). Legend 100 Wilhelm Tell the Marksman. Switzerland showcases + generics freshly generated this episode (no recoverable manifest for Ep89 originals, independently audited and regenerated per Rule #29); Colombia reused Ep92 (Rule #26, audited and found correct as-is); walkout + handshake + Wilhelm Tell card fresh. vol=0.',
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
console.log('Ep100:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, NO-REPEAT OK, no-loop OK');
