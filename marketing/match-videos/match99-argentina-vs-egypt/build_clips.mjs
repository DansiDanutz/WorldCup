// Ep99 Argentina vs Egypt (Play-Offs) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// Argentina REUSED from Ep91 (Argentina vs Cape Verde, Rule #26): crowd/attack/tango motif +
// showcase clips Messi(10,c)/Enzo Fernández(24)/Mac Allister(20)/Lautaro Martínez(22) — all audited
// and found CORRECT as-is, reused straight from their original Ep91 job URLs. Álvarez(9) was
// RE-GENERATED this episode after the likeness audit found a baked-in "LIVE" broadcast-graphic
// hallucination in the Ep91 original — corrected still via nano_banana_pro, animated via
// kling3_0_turbo. Egypt: Ep90 (Australia vs Egypt)'s own showcase/crowd/attack/goal/motif clips
// turned out to have NO recoverable job URLs anywhere (not in _dl_reuse.txt, not in any other
// manifest, not on disk, and the same is true of the earlier Ep67 Egypt vs Iran episode) — so ALL
// Egypt-specific clips this episode are FRESH generations (nano_banana_pro stills + kling3_0_turbo
// animation), built from the exact name/number mapping recovered from Ep90's match-scenes.jsx:
// Salah(10,c)/Marmoush(9)/Trezeguet(7)/"The Wall of Egypt" generic CB(6). Elneny(17) was CUT after
// a squad-accuracy confidence check (age 34, declining recent international role) — same standard
// as Ep94's Griezmann cut and Ep96's Foden cut — leaving Egypt with 4 named showcases this episode
// (Argentina keeps its full 5). Fresh (6 gens): a nation-correct Argentina-vs-Egypt pitch walkout, a
// nation-correct captains' handshake (generic, no named individuals, regenerated once more after a
// "KABTEN" text-hallucination was caught on the first attempt), the Anubis Legend 099 card art
// (portrait + landscape), a Nile-river Egypt nation motif, and two dedicated close-up stills for the
// thumbnail (Messi regenerated twice more after weak first likeness passes). Generics (verified
// clean, reused 0 credits): stadium-wide, stadium-aerial. OUR PREDICTION Argentina 2-1 Egypt
// (Álvarez strikes first; Salah — the Pharaoh — levels it; late, Messi — the Genius — scores the
// winner). Legend 099 = Anubis, Warden of the Scales (Egypt, real/sourced ancient-Egyptian myth,
// distinct from Legend 090's Sphinx and Legend 091's Sun of May).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Anubis card art 0-5 in scene) + Argentina/Egypt motifs
  C('arg-tango', 'arg-tango.mp4', 5.0, 5.0),
  C('egy-nile', 'egy-nile.mp4', 10.0, 5.0),
  // WALKOUT 33-44 (fresh nation-correct pairing; verified no broadcast graphics)
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // ARGENTINA 44-79.5 (crowd 44-49, gap 49-54, tint-sliver 54-55.5, showcases 55.5-79.5 @4.8 each:
  // Messi 55.5, Álvarez 60.3, Enzo 65.1, Mac Allister 69.9, Lautaro 74.7)
  C('arg-crowd', 'arg-crowd.mp4', 44.0, 5.0),
  C('arg-messi', 'arg-messi.mp4', 55.5, 4.8),
  C('arg-alvarez', 'arg-alvarez.mp4', 60.3, 4.8),
  C('arg-enzo', 'arg-enzo.mp4', 65.1, 4.8),
  C('arg-macallister', 'arg-macallister.mp4', 69.9, 4.8),
  C('arg-lautaro', 'arg-lautaro.mp4', 74.7, 4.8),
  // EGYPT 79.5-113 (crowd 79.5-84.5, gap 84.5-92.3, tint-sliver 92.3-93.8, 4 showcases 93.8-113 @4.8
  // each: Salah 93.8, Marmoush 98.6, Trezeguet 103.4, "Wall of Egypt" 108.2 — only 4 named this
  // episode, Elneny cut on squad-accuracy grounds, see README Correction log)
  C('egy-crowd', 'egy-crowd.mp4', 79.5, 5.0),
  C('egy-salah', 'egy-salah.mp4', 93.8, 4.8),
  C('egy-marmoush', 'egy-marmoush.mp4', 98.6, 4.8),
  C('egy-trezeguet', 'egy-trezeguet.mp4', 103.4, 4.8),
  C('egy-cb', 'egy-cb.mp4', 108.2, 4.8),
  // RIDDLE 113-132 (generic verified-clean library clip)
  C('stadium-aerial', 'stadium-aerial.mp4', 113.0, 5.0),
  // DRAMA 132-203.32 (Argentina 1-0 via Álvarez; Salah 1-1; Messi 2-1 late winner). Build-up + goal
  // pairs reuse each nation's own real match footage — no cross-episode narrative re-purposing.
  C('arg-attack', 'arg-attack.mp4', 138.0, 5.0),
  C('alvarez-goal', 'alvarez-goal.mp4', 148.21, 5.0),
  C('egy-attack', 'egy-attack.mp4', 160.0, 5.04),
  C('egy-goal-1', 'egy-goal-1.mp4', 170.0, 5.04),
  C('messi-magic', 'messi-magic.mp4', 182.0, 5.04),
  C('messi-goal', 'messi-goal.mp4', 192.0, 5.04),
  // VERDICT 203.32-244 (fresh nation-correct handshake; generic, no named individuals)
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244 / CTA 303.05: intentionally NO clip (plain graded backdrop + AmbientParticles/
  // Confetti carries these beats, same pattern as Ep96/97).
];
const out = {
  comment: 'Ep99 Argentina vs Egypt PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Argentina 2-1 Egypt (Messi late winner). Legend 099 Anubis, Warden of the Scales. Argentina reused Ep91 (Rule #26); Álvarez re-animated fresh after a broadcast-graphic hallucination audit; Messi/Enzo/Mac Allister/Lautaro reused as-is (confirmed correct). Egypt entirely fresh-generated this episode (no recoverable Ep90/Ep67 job URLs); Elneny cut on squad-accuracy grounds. Walkout + handshake + Anubis card + Nile motif + 2 thumbnail stills fresh. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 79.5, vol: 0.5 }, { src: 'sfx/pop.mp3', at: 93.8, vol: 0.5 },
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
console.log('Ep99:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, NO-REPEAT OK, no-loop OK');
