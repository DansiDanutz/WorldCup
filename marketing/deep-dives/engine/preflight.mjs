// preflight.mjs <episode-dir> — the gate every render must pass. Exit 1 on any
// failure; never render past a red gate. Encodes CLAUDE.md rules #0, #9, #10 and
// the documentary skill's identity law for a Deep Dive episode.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadEpisode, cardArtPath, loadLibrary, beatShots, MIN_RATE } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const PREVIEW = process.env.PREVIEW === '1';
const fails = [], warns = [];
const fail = (m) => fails.push(m), warn = (m) => warns.push(m);

// Rule #0 — no gambling look, no prize/cash wording anywhere we publish.
const BANNED = /\b(odds|bets?|betting|wager|stakes?|jackpot|bookmaker|coefficients?|prize money|cash prizes?|win money|payout)\b/i;
// Scene types that only draw shapes and type. Moving pictures come only as `clip`
// shots from the owned library (library/clips.json), never ad-hoc files.
const CODE_SCENES = new Set(['date', 'nameplate', 'title', 'chapter', 'kinetic', 'stadium', 'route', 'stat',
  'impact', 'artifact', 'timeline', 'jersey', 'pitch', 'cardwall', 'versus', 'clock', 'ballnet', 'card', 'phone',
  'heartbeat', 'clip']);
const LIB = loadLibrary();
const usedClips = new Map();
const words = (s) => String(s).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const TEXT_KEYS = ['label', 'title', 'text', 'sub', 'unit', 'meta', 'name', 'stat'];

if (ep.title.length > 100) fail(`title is ${ep.title.length} chars (YouTube max 100)`);
if (!ep.title.toLowerCase().includes(ep.player.name.toLowerCase().split(' ').slice(-1)[0])) fail('title must lead with the searchable player name');
if (words(ep.thumbnail.hook) > 4) fail(`thumbnail hook "${ep.thumbnail.hook}" is over 4 words`);
if (!Array.isArray(ep.sources) || ep.sources.filter((s) => /^https?:\/\//.test(s.url)).length < 3) fail('need ≥3 cited sources (rule #9)');
if (!ep.card?.story || ep.card.story.length < 60) fail('card story missing or too short');
// the album reads each card aloud (Brian, 75–145 words incl. its framing) — stories over 45 words overflow it
if (words(ep.card.story) > 45) fail(`card story is ${words(ep.card.story)} words (max 45, the card voice-over overflows)`);

const allText = [ep.title, ep.thumbnail.hook, ep.card.title, ep.card.story];
ep.beats.forEach((b, i) => {
  const n = i + 1;
  if (!b.vo || words(b.vo) < 2) fail(`beat ${n}: empty VO`);
  allText.push(b.vo);
  const shots = beatShots(b);
  shots.forEach((shot) => {
    if (shot.clip) {
      const c = LIB[shot.clip];
      if (!c) { fail(`beat ${n}: clip "${shot.clip}" is not in library/clips.json`); return; }
      if (!fs.existsSync(path.join(ROOT, c.src))) fail(`beat ${n}: clip file ${c.src} missing (run library/fetch.mjs)`);
      // rule #11: every clip plays at most once in a video
      if (usedClips.has(shot.clip)) fail(`beat ${n}: clip "${shot.clip}" already used in beat ${usedClips.get(shot.clip)} (no-repeat rule)`);
      usedClips.set(shot.clip, n);
      if (shot.tag != null) { allText.push(String(shot.tag)); if (words(shot.tag) > 4) fail(`beat ${n}: tag "${shot.tag}" is over 4 words (rule #10)`); }
    } else if (!shot.scene) fail(`beat ${n}: a shot needs "clip" or "scene"`);
  });
  const scenes = shots.flatMap((sh) => (sh.scene ? [sh.scene] : sh.over ? [sh.over] : []));
  scenes.forEach((s) => {
    if (!s || !CODE_SCENES.has(s.type) || s.type === 'clip') fail(`beat ${n}: scene type "${s?.type}" is not a drawn scene`);
    for (const k of TEXT_KEYS) if (s[k] != null) {
      allText.push(String(s[k]));
      if (words(s[k]) > 4) fail(`beat ${n}: on-screen ${k} "${s[k]}" is over 4 words (rule #10)`);
    }
    (s.words || []).forEach((w) => allText.push(w.w));
    if (s.words && s.words.length > 4) fail(`beat ${n}: kinetic beat shows ${s.words.length} words (max 4)`);
    (s.years || []).forEach((y) => { allText.push(String(y.label || '')); if (words(y.label || '') > 3) fail(`beat ${n}: timeline label "${y.label}" over 3 words`); });
    // other text the scenes render: comparison labels and map place names
    [...(s.rows || []).map((r) => r.label), ...[s.a, s.b, ...(s.stops || [])].filter(Boolean).map((pt) => pt.name)]
      .filter((v) => v != null).forEach((v) => {
        allText.push(String(v));
        if (words(v) > 4) fail(`beat ${n}: on-screen "${v}" is over 4 words (rule #10)`);
      });
  });
});
allText.forEach((s) => { const m = String(s).match(BANNED); if (m) fail(`banned wording "${m[0]}" in: ${String(s).slice(0, 80)}`); });

const last = ep.beats[ep.beats.length - 1];
const lastShot = beatShots(last).at(-1);
if (lastShot.scene?.type !== 'phone') fail('the episode must end on the phone end card (worldcup26.world)');
if (!/worldcup26\.world/i.test(last.vo) || !/no prizes/i.test(last.vo)) fail('closing VO must name worldcup26.world and say "no prizes"');
if (!ep.beats.some((b) => beatShots(b).some((s) => s.scene?.type === 'card'))) fail('no card reveal beat');

// VO present (one mp3 per beat) unless this is a picture-only preview.
const vo = ep.beats.map((_, i) => path.join(epDir, 'vo', `beat_${String(i + 1).padStart(2, '0')}.mp3`));
const missingVo = vo.filter((f) => !fs.existsSync(f));
if (missingVo.length && !PREVIEW) fail(`${missingVo.length}/${vo.length} Brian VO files missing (run gen-vo.mjs)`);

if (!fs.existsSync(cardArtPath(ep))) fail('card art missing (run make-art.mjs)');
for (const cue of ['cue-cinematic-open', 'cue-reverent', 'cue-triumph']) {
  if (!fs.existsSync(path.join(ROOT, 'marketing/deep-dives/engine/music', `${cue}.mp3`))) fail(`music cue ${cue} missing (run fetch-music.sh)`);
}

const filmFile = path.join(epDir, 'build/film.json');
if (fs.existsSync(filmFile)) {
  const film = JSON.parse(fs.readFileSync(filmFile, 'utf8'));
  if (!PREVIEW && (film.duration < 270 || film.duration > 390)) fail(`duration ${film.duration}s is outside the 4:30–6:30 window`);
  const srcs = [];
  film.graphics.forEach((g) => { if (g.src) srcs.push(g.src); (g.srcs || []).forEach((s) => srcs.push(s)); });
  [...new Set(srcs)].forEach((s) => { if (!fs.existsSync(path.join(ROOT, s.replace(/^\//, '')))) fail(`missing asset ${s}`); });
  // every second covered (the ambient base spans the film, but check anyway)
  for (let s = 0; s < Math.floor(film.duration); s++) {
    if (!film.graphics.some((g) => g.at <= s + 0.5 && g.at + g.dur >= s + 0.5)) { fail(`uncovered second at ${s}s`); break; }
  }
  // a clip slowed past MIN_RATE looks broken, and one that runs out loops visibly
  film.graphics.filter((g) => g.type === 'clip').forEach((g) => {
    if (g.rate < MIN_RATE) fail(`clip ${g.clip} at ${g.at}s plays at ${g.rate}x to fill ${g.dur}s — split the beat or use a longer clip`);
    if (g.offset + g.dur * g.rate > g.clipDur + 0.05) fail(`clip ${g.clip} at ${g.at}s runs past its end and would loop`);
  });
  const clipTime = film.graphics.filter((g) => g.type === 'clip').reduce((n, g) => n + g.dur, 0);
  if (usedClips.size && clipTime / film.duration < 0.5) warn(`clips cover only ${Math.round(100 * clipTime / film.duration)}% of the film`);
  const per = film.duration / Math.max(1, film.sfx.hits.length);
  if (per > 9) warn(`sound design is thin: 1 hit per ${per.toFixed(1)}s (target ≈ 6.5s)`);
  if (film.preview && !PREVIEW) fail('film.json is a PREVIEW build — rebuild with VO before the final render');
} else {
  fail('build/film.json missing (run build.mjs)');
}

warns.forEach((w) => console.log('warn ', w));
if (fails.length) {
  fails.forEach((f) => console.error('FAIL ', f));
  console.error(`\npreflight RED: ${fails.length} failure(s) — fix before rendering`);
  process.exit(1);
}
console.log(`preflight GREEN: ${ep.slug} — ${ep.beats.length} beats, ${ep.sources.length} sources${PREVIEW ? ' (preview)' : ''}`);
