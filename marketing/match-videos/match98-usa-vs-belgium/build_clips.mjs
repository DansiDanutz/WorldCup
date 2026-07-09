// Ep98 USA vs Belgium (Play-Offs) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// USA REUSED from Ep86 (Rule #26): crowd/attack/surge/goal-1/goal-2 + texture-usa (American Eagle
// motif, Legend 086 flavor only, not re-carded) + confirmed-correct showcase Balogun(9) (reused as-is
// from its original Ep86 job URL). Pulisic(10,c)/Weah(21)/McKennie(8)/Adams(4) were re-generated this
// episode after a likeness audit found wrong shirt numbers (and, for Adams, the wrong gender) baked
// into the Ep86 originals — corrected stills via nano_banana_pro, animated via kling3_0_turbo.
// Belgium REUSED from Ep85 (Rule #26): crowd/attack/goal + be-devil (Red Devils motif) + confirmed-
// correct De Bruyne(7,c)/Lukaku(9)/Doku(11)/Tielemans(8) (reused as-is from their original Ep85 job
// URLs). Onana(4) was re-generated this episode for the same reason (wrong shirt number in the Ep85
// original). Fresh (7 gens): a nation-correct USA-vs-Belgium pitch walkout (neither prior episode had
// this exact pairing), a nation-correct captains' handshake (generic, no named individuals), the
// Red Devil Legend 098 card art (portrait + landscape), and two dedicated close-up stills for the
// thumbnail. Generics (verified clean, reused 0 credits): stadium-wide, stadium-aerial. Both squads
// run 5 named showcases each this episode — no squad-accuracy omission was needed (unlike Ep94/96).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Red Devil card art 0-5 in scene) + Belgium/USA motifs
  C('be-devil', 'be-devil.mp4', 5.0, 5.0),
  C('texture-usa', 'texture-usa.mp4', 10.0, 5.0),
  // WALKOUT 33-44 (fresh nation-correct pairing; verified no broadcast graphics)
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // USA 44-79.5 (Pulisic 55.5, Weah 60.3, Balogun 65.1, McKennie 69.9, Adams 74.7 — evenly spaced,
  // all showcase clips are ~5.04s real length so no uneven-duration workaround is needed)
  C('us-crowd', 'us-crowd.mp4', 44.0, 5.0),
  C('us-pulisic', 'us-pulisic.mp4', 55.5, 4.8),
  C('us-weah', 'us-weah.mp4', 60.3, 4.8),
  C('us-balogun', 'us-balogun.mp4', 65.1, 4.8),
  C('us-mckennie', 'us-mckennie.mp4', 69.9, 4.8),
  C('us-adams', 'us-adams.mp4', 74.7, 4.8),
  // BELGIUM 79.5-113 (De Bruyne 90.6, Lukaku 95.08, Doku 99.56, Tielemans 104.04, Onana 108.52)
  C('be-crowd', 'be-crowd.mp4', 79.5, 5.0),
  C('be-debruyne', 'be-debruyne.mp4', 90.6, 4.48),
  C('be-lukaku', 'be-lukaku.mp4', 95.08, 4.48),
  C('be-doku', 'be-doku.mp4', 99.56, 4.48),
  C('be-tielemans', 'be-tielemans.mp4', 104.04, 4.48),
  C('be-onana', 'be-onana.mp4', 108.52, 4.48),
  // RIDDLE 113-132 (generic verified-clean library clip; only ONE distinct motif clip exists per
  // nation this episode — be-devil + texture-usa are both already used once each in the cold open,
  // so 118-123 uses a plain graded backdrop + text instead of a repeated/contaminated clip, matching
  // the "no unverified filler" precedent set in Ep96/Ep97's Correction logs)
  C('stadium-aerial', 'stadium-aerial.mp4', 113.0, 5.0),
  // DRAMA 132-203.32 (USA 1-0 via young attack; De Bruyne 1-1; Pulisic 2-1 winner). Build-up + goal
  // pairs reuse each nation's own real match footage — no cross-episode narrative re-purposing.
  C('us-attack', 'us-attack.mp4', 138.0, 5.0),
  C('us-goal-1', 'us-goal-1.mp4', 148.21, 5.0),
  C('be-attack', 'be-attack.mp4', 160.0, 5.04),
  C('be-goal', 'be-goal.mp4', 170.0, 5.04),
  C('us-surge', 'us-surge.mp4', 182.0, 5.04),
  C('us-goal-2', 'us-goal-2.mp4', 192.0, 5.04),
  // VERDICT 203.32-244 (fresh nation-correct handshake; generic, no named individuals)
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244 / CTA 303.05: intentionally NO clip (plain graded backdrop + AmbientParticles/
  // Confetti carries these beats, same pattern as Ep96/Ep97).
];
const out = {
  comment: 'Ep98 USA vs Belgium PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION USA 2-1 Belgium (Pulisic late winner). Legend 098 The Red Devil, Belgium\'s Diables Rouges. USA reused Ep86, Belgium reused Ep85 (Rule #26); Pulisic/Weah/McKennie/Adams and Onana re-animated fresh from corrected stills after a likeness/number/gender audit; Balogun/De Bruyne/Lukaku/Doku/Tielemans reused as-is (confirmed correct); walkout + handshake + Red Devil card fresh. vol=0.',
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
console.log('Ep98:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, NO-REPEAT OK, no-loop OK');
