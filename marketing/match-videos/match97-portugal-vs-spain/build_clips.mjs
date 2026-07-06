// Ep97 Portugal vs Spain (Play-Offs) — PHOTOREAL + NO-REPEAT + NO-LOOP + nation-correct (#28).
// Portugal REUSED from Ep71/Ep88 (Rule #26): crowd/attack/surge/goal + fog motif + confirmed-correct
// showcase clips Ronaldo(7,c)/Bruno Fernandes(8) (audited and found correct as-is, reused from their
// original Ep71 URLs). Leão(11)/Dias(4)/Bernardo Silva(10) were re-generated this episode after a
// likeness audit found wrong shirt numbers baked into the Ep71/88 originals — corrected stills via
// nano_banana_pro/nano_banana_2, animated via kling3_0_turbo. Spain REUSED from Ep87 (Rule #26):
// crowd/attack/surge/goal x2 + El Toro texture motif + confirmed-correct Morata(7,c) reused as-is.
// Yamal(19)/Pedri(8)/Rodri(16)/Nico Williams(17) were re-generated this episode for the same reason
// (wrong shirt numbers in the Ep87 originals). Fresh (5 gens): a nation-correct Portugal-vs-Spain
// pitch walkout (neither prior episode had this pairing), a nation-correct captains' handshake
// (generic, no named individuals), the Dom Sebastião Legend 097 card art (portrait + landscape), and
// two dedicated close-up stills for the thumbnail. Generics (verified clean, reused 0 credits):
// stadium-wide, stadium-aerial. Both squads run 5 named showcases each this episode — no
// squad-accuracy omission was needed (unlike Ep94/96). OUR PREDICTION Spain 2-1 Portugal (Spain
// strike first; Ronaldo levels it 1-1; late, Yamal — the wizard — scores the winner). Legend 097 =
// Dom Sebastião, the Hidden King (Portugal, real/sourced "Sebastianismo" myth, distinct from Legend
// 088's Navigator and Legend 087's El Toro).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/clips/${src}`, at, dur, vol });
const clips = [
  // COLD OPEN (Dom Sebastião card art 0-5 in scene) + Portugal/Spain motifs
  C('portugal-fog', 'portugal-fog.mp4', 5.0, 5.0),
  C('texture-spain', 'texture-spain.mp4', 10.0, 5.0),
  // WALKOUT 33-44 (fresh nation-correct pairing; verified no broadcast graphics)
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.8, 5.0),
  // PORTUGAL 44-79.5 (Ronaldo 55.5, Bruno 60.3, Leão 65.1, Dias 69.9, Bernardo 74.7 — evenly spaced,
  // all showcase clips are ~5.0s real length so no uneven-duration workaround is needed)
  C('por-crowd', 'por-crowd.mp4', 44.0, 5.0),
  C('por-ronaldo', 'por-ronaldo.mp4', 55.5, 4.8),
  C('por-bruno', 'por-bruno.mp4', 60.3, 4.8),
  C('por-leao', 'por-leao.mp4', 65.1, 4.8),
  C('por-dias', 'por-dias.mp4', 69.9, 4.8),
  C('por-bernardo', 'por-bernardo.mp4', 74.7, 4.8),
  // SPAIN 79.5-113 (Morata 90.6, Yamal 95.08, Pedri 99.56, Rodri 104.04, Nico Williams 108.52)
  C('spa-crowd', 'spa-crowd.mp4', 79.5, 5.0),
  C('spa-morata', 'spa-morata.mp4', 90.6, 4.48),
  C('spa-yamal', 'spa-yamal.mp4', 95.08, 4.48),
  C('spa-pedri', 'spa-pedri.mp4', 99.56, 4.48),
  C('spa-rodri', 'spa-rodri.mp4', 104.04, 4.48),
  C('spa-nicowilliams', 'spa-nicowilliams.mp4', 108.52, 4.48),
  // RIDDLE 113-132 (generic verified-clean library clip; only ONE distinct motif clip exists per
  // nation this episode — portugal-fog + texture-spain are both already used once each in the cold
  // open, so 118-123 uses a plain graded backdrop + text instead of a repeated/contaminated clip,
  // matching the "no unverified filler" precedent set in Ep96's Correction log)
  C('stadium-aerial', 'stadium-aerial.mp4', 113.0, 5.0),
  // DRAMA 132-203.32 (Spain 1-0 via young attack; Ronaldo 1-1; Yamal 2-1 winner). Build-up + goal
  // pairs reuse each nation's own real match footage — no cross-episode narrative re-purposing.
  C('spa-attack', 'spa-attack.mp4', 138.0, 5.0),
  C('spa-goal-1', 'spa-goal-1.mp4', 148.21, 5.0),
  C('por-attack', 'por-attack.mp4', 160.0, 5.04),
  C('por-goal-1', 'por-goal-1.mp4', 170.0, 5.04),
  C('spa-surge', 'spa-surge.mp4', 182.0, 5.04),
  C('spa-goal-2', 'spa-goal-2.mp4', 192.0, 5.04),
  // VERDICT 203.32-244 (fresh nation-correct handshake; generic, no named individuals)
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  // ENGAGE 244 / CTA 303.05: intentionally NO clip (plain graded backdrop + AmbientParticles/
  // Confetti carries these beats, same pattern as Ep96).
];
const out = {
  comment: 'Ep97 Portugal vs Spain PHOTOREAL, nation-correct (#28), NO-REPEAT+NO-LOOP, showcase SYNCED. OUR PREDICTION Spain 2-1 Portugal (Yamal late winner). Legend 097 Dom Sebastião the Hidden King. Portugal reused Ep71/88, Spain reused Ep87 (Rule #26); Leão/Dias/Bernardo Silva and Yamal/Pedri/Rodri/Nico Williams re-animated fresh from corrected stills after a likeness/number audit; Ronaldo/Bruno/Morata reused as-is (confirmed correct); walkout + handshake + Dom Sebastião card fresh. vol=0.',
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
console.log('Ep97:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, NO-REPEAT OK, no-loop OK');
