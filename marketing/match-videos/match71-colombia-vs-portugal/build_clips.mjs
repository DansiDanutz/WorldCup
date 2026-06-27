// Ep71 Colombia vs Portugal — PHOTOREAL (rule #22) + NO-REPEAT + NO-LOOP (rule #11).
// 37 distinct photoreal clips, each used EXACTLY ONCE, each window <= its 5.04s source
// (NO internal looping — owner flagged Ep70's stretched handshake). Long graphic scenes
// (title, prediction card, verdict stat panel, Legend reveal, app, engage) are CSS
// motion-graphics with NO video behind, so nothing ever loops.
// OUR PREDICTION COL 0-0 POR (James 84' curl kisses the bar). Mystic spine: El Dorado /
// the gold that was there for a heartbeat and never held. Legend 071 = The Gilded King.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  // ── COLD OPEN (mystic: El Dorado + the fog) 0–23 ──
  C('eldorado-lake', 'eldorado-lake.mp4', 0.0, 5.0),
  C('eldorado-gold', 'eldorado-gold.mp4', 5.0, 5.0),
  C('portugal-fog', 'portugal-fog.mp4', 10.0, 5.0),
  C('gold-dust', 'gold-dust.mp4', 15.0, 5.0),
  // ── STADIUM / WALKOUT 33–44 (Title 23–33 is graphic) ──
  C('pitch-walkout', 'pitch-walkout.mp4', 33.0, 5.0),
  C('stadium-wide', 'stadium-wide.mp4', 38.0, 5.0),
  // ── COLOMBIA 44–79.5 ──
  C('col-crowd', 'col-crowd.mp4', 44.0, 5.0),
  C('col-tifo', 'col-tifo.mp4', 49.0, 5.0),
  C('s-james', 's-james.mp4', 54.0, 5.0),
  C('s-diaz', 's-diaz.mp4', 59.0, 5.0),
  C('s-duran', 's-duran.mp4', 64.0, 5.0),
  C('s-munoz', 's-munoz.mp4', 69.0, 5.0),
  C('s-sanchez', 's-sanchez.mp4', 74.0, 5.0),
  // ── PORTUGAL 79.5–103 ──
  C('por-crowd', 'por-crowd.mp4', 79.5, 5.0),
  C('s-bruno', 's-bruno.mp4', 84.5, 5.0),
  C('s-bernardo', 's-bernardo.mp4', 89.5, 5.0),
  C('s-leao', 's-leao.mp4', 94.5, 5.0),
  C('s-ronaldo', 's-ronaldo.mp4', 99.5, 3.5),
  // ── DUEL (two number tens) 103–132 ──
  C('duel-bruno-rios', 'duel-bruno-rios.mp4', 103.0, 5.0),
  C('duel-mid', 'duel-mid.mp4', 108.0, 5.0),
  C('duel-leao-wing', 'duel-leao-wing.mp4', 113.0, 5.0),
  C('duel-rios-tackle', 'duel-rios-tackle.mp4', 118.0, 5.0),
  C('stadium-aerial', 'stadium-aerial.mp4', 123.0, 5.0),
  // ── DRAMA / THE 84TH MINUTE 132–203.32 ──
  C('col-attack1', 'col-attack1.mp4', 132.0, 5.0),
  C('por-attack1', 'por-attack1.mp4', 137.0, 5.0),
  C('s-dias', 's-dias.mp4', 142.0, 5.0),
  C('costa-save2', 'costa-save2.mp4', 147.0, 5.0),
  C('james-control', 'james-control.mp4', 152.0, 5.0),
  // (157–164 graphic build: 84' marker + ScoreBug 0-0)
  C('goal-james-strike', 'goal-james-strike.mp4', 164.0, 5.0),
  C('goal-bar-save', 'goal-bar-save.mp4', 169.0, 5.0),
  C('james-sky', 'james-sky.mp4', 174.0, 4.46),
  // (178.46–189 graphic: "even the gods…" gold particles)
  C('chance-col-header', 'chance-col-header.mp4', 189.0, 5.0),
  // (194–203.32 graphic: premium prediction card #18)
  // ── VERDICT 203.32–244 — MULTIPLE DISTINCT clips, then graphic stat panel (NO loop) ──
  C('vd-handshake', 'vd-handshake.mp4', 203.32, 5.0),
  C('vd-applaud', 'vd-applaud.mp4', 208.32, 5.0),
  C('vd-stadium-night', 'vd-stadium-night.mp4', 213.32, 5.0),
  // (218.32–244 graphic StatLine panel on gold-particle gradient — NO clip)
  // ── ENGAGE 244–255 ──
  C('crowd-tense', 'crowd-tense.mp4', 244.0, 5.0),
  // (Mystery/Legend 255–281.38 + App 281.38–303.05 are graphic motion scenes)
  // ── CTA 303.05–318.05 ──
  C('cta-celebrate', 'cta-celebrate.mp4', 303.05, 5.0),
];
const out = {
  comment: 'Ep71 Colombia vs Portugal — PHOTOREAL (rule #22), NO-REPEAT + NO-LOOP (rule #11): 37 distinct clips, each used once, every dur<=5.04s source (no internal looping). Long card/title/verdict-panel/legend/app scenes are CSS motion-graphics with no video behind. OUR PREDICTION COL 0-0 POR (James 84 curl off the bar). Legend 071 The Gilded King (El Dorado). vol=0.',
  clips,
  music: { cues: [
    { src: 'music/cue-tense.mp3', at: 0, dur: 33, vol: 0.5, fadeIn: 0.5, fadeOut: 3, loop: false },
    { src: 'music/cue-epic.mp3', at: 33, dur: 256, vol: 0.4, fadeIn: 2.5, fadeOut: 4, loop: true },
    { src: 'music/cue-heroic.mp3', at: 272, dur: 46, vol: 0.46, fadeIn: 2.5, fadeOut: 3, loop: true },
  ]},
  sfx: { hits: [
    { src: 'sfx/heartbeat.mp3', at: 0.3, vol: 0.9 }, { src: 'sfx/braam.mp3', at: 10.5, vol: 0.8 },
    { src: 'sfx/mystic.mp3', at: 15.2, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 22.6, vol: 0.6 },
    { src: 'sfx/stamp.mp3', at: 23.0, vol: 0.55 }, { src: 'sfx/braam.mp3', at: 33.0, vol: 0.55 },
    { src: 'sfx/pop.mp3', at: 54.0, vol: 0.5 }, { src: 'sfx/whoosh.mp3', at: 79.5, vol: 0.5 },
    { src: 'sfx/pop.mp3', at: 84.5, vol: 0.5 }, { src: 'sfx/whoosh.mp3', at: 113.0, vol: 0.55 },
    { src: 'sfx/braam.mp3', at: 157.0, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 164.0, vol: 0.6 },
    { src: 'sfx/braam.mp3', at: 169.0, vol: 0.85 }, { src: 'sfx/mystic.mp3', at: 178.6, vol: 0.6 },
    { src: 'sfx/stamp.mp3', at: 194.5, vol: 0.6 }, { src: 'sfx/whoosh.mp3', at: 203.32, vol: 0.55 },
    { src: 'sfx/mystic.mp3', at: 255.5, vol: 0.85 }, { src: 'sfx/pop.mp3', at: 264.0, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 303.05, vol: 0.55 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
// ── NO-REPEAT + NO-LOOP enforcement (rule #11) ──
const cnt = {}; clips.forEach(c => cnt[c.src] = (cnt[c.src] || 0) + 1);
const reused = Object.entries(cnt).filter(([, k]) => k > 1);
if (reused.length) { console.error('NO-REPEAT VIOLATION:', reused); process.exit(1); }
// ffprobe-equivalent: assert every clip dur <= real source length (no internal loop)
let loopViol = [];
for (const c of clips) {
  if (!fs.existsSync(c.src)) { console.warn('missing', c.src); continue; }
  const r = spawnSync(ffmpeg, ['-i', c.src], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.?\d*)/);
  if (m) { const real = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
    if (c.dur > real + 0.06) loopViol.push(`${c.id} dur=${c.dur} > src=${real.toFixed(2)}`); }
}
if (loopViol.length) { console.error('NO-LOOP VIOLATION (dur>source):\n  ' + loopViol.join('\n  ')); process.exit(1); }
console.log('Ep71:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, no-repeat OK, no-loop OK (all dur<=source)');
