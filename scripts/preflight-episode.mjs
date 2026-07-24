#!/usr/bin/env node
// preflight-episode.mjs — the MANDATORY gate that must pass before any episode render.
//
//   node scripts/preflight-episode.mjs <episodeDir> [epNumber]
//
// CLAUDE.md describes this gate as non-skippable, but it had never been implemented —
// which is exactly why wrong-likeness showcases (Ep101 Yamal, Ep106 Mbappé) and
// overlapping VO reached finished renders. Every check below is mechanical: it reads
// the episode's own artifacts and exits non-zero on any violation.
//
// Exit 0 = clear to render. Exit 1 = fix the source first.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = process.argv[2];
const epNum = process.argv[3];
if (!dir || !fs.existsSync(dir)) {
  console.error('usage: node scripts/preflight-episode.mjs <episodeDir> [epNumber]');
  process.exit(2);
}

const fails = [];
const warns = [];
const ok = [];
const P = (...p) => path.join(dir, ...p);
const read = f => (fs.existsSync(P(f)) ? fs.readFileSync(P(f), 'utf8') : null);

const probe = f => {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' });
  const v = parseFloat((r.stdout || '').trim());
  return Number.isFinite(v) ? v : null;
};

// ── 1. narration + VO completeness, and NO VO OVERLAP (Rule #12) ────────────────
const narrRaw = read('narration.json');
if (!narrRaw) fails.push('narration.json missing');
else {
  const lines = JSON.parse(narrRaw).lines || [];
  const durs = [];
  let missing = 0;
  lines.forEach((l, i) => {
    const f = P('audio', `line_${String(i).padStart(2, '0')}.mp3`);
    if (!fs.existsSync(f)) { missing++; durs.push(null); return; }
    durs.push(probe(f));
  });
  if (missing) fails.push(`VO incomplete: ${missing}/${lines.length} line mp3s missing (expects 0-indexed line_00.mp3 …)`);
  else ok.push(`VO complete: ${lines.length} lines`);

  let overlaps = 0, minGap = Infinity;
  for (let i = 0; i < lines.length - 1; i++) {
    if (durs[i] == null) continue;
    const end = lines[i].at + durs[i];
    const gap = lines[i + 1].at - end;
    if (gap < 0) { overlaps++; fails.push(`VO OVERLAP: line ${i} ends ${end.toFixed(2)}s but line ${i + 1} starts ${lines[i + 1].at}s (${gap.toFixed(2)}s)`); }
    if (gap < minGap) minGap = gap;
  }
  if (!overlaps && durs.every(d => d != null)) ok.push(`VO spacing clean (min gap ${minGap.toFixed(2)}s)`);
}

// ── 2. clips: sources exist, and NO clip window exceeds its source (Rule #11) ────
const clipsRaw = read('clips.json');
let clipIds = new Set();
if (!clipsRaw) fails.push('clips.json missing');
else {
  const j = JSON.parse(clipsRaw);
  const clips = j.clips || [];
  if (!clips.length) fails.push('clips[] is EMPTY — clip-based only, no stills fallback (Rule #11)');
  const srcDur = new Map();
  for (const c of clips) {
    clipIds.add(c.id);
    const src = P(c.src);
    if (!fs.existsSync(src)) { fails.push(`clip source missing: ${c.src} (id ${c.id})`); continue; }
    if (!srcDur.has(c.src)) srcDur.set(c.src, probe(src));
    const d = srcDur.get(c.src);
    if (d != null && c.dur > d + 0.05) fails.push(`CLIP LOOP: "${c.id}" window ${c.dur}s > source ${d.toFixed(2)}s (${c.src})`);
  }
  if (!fails.some(f => f.startsWith('CLIP LOOP'))) ok.push(`no clip loops (${clips.length} windows, ${srcDur.size} unique sources)`);

  // music cues
  for (const c of (j.music?.cues || [])) {
    if (!fs.existsSync(P(c.src))) fails.push(`music cue missing: ${c.src}`);
  }
  if ((j.music?.cues || []).length) ok.push(`${j.music.cues.length} music cues present`);
}

// ── 3. scene-file text rules ────────────────────────────────────────────────────
const sceneFiles = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let sceneText = '';
for (const f of sceneFiles) sceneText += fs.readFileSync(P(f), 'utf8') + '\n';

// no subtitles / narration paragraphs (Rule #10)
const lineEq = sceneText.match(/<LowerThird[^>]*\bline=/g) || [];
const noteEq = sceneText.match(/<HistoryPlate[^>]*\bnote=/g) || [];
if (lineEq.length) fails.push(`Rule #10: ${lineEq.length} LowerThird line= subtitle(s)`);
if (noteEq.length) fails.push(`Rule #10: ${noteEq.length} HistoryPlate note= subtitle(s)`);
if (!lineEq.length && !noteEq.length) ok.push('no line=/note= subtitles (Rule #10)');

// banned wording (Rules #15 + monetization #1)
const banned = [
  [/\bunderdogs?\b/i, 'Rule #15: "underdog"'],
  [/\bbookmaker|\bbetting\b|\bwager\b|\bstake\b|\bodds\b/i, 'monetization: betting/odds wording'],
  [/\bjackpot\b|\bcash prize\b|\bwin money\b/i, 'monetization: prize/cash wording'],
];
// Only scan AUDIENCE-FACING text. The upload pack's "⚠️ PRE-UPLOAD" block legitimately
// names the banned terms in order to forbid them ("No prize/cash/betting/odds wording"),
// so scan the pack from its TITLE heading onward — that is what viewers actually see.
const packRaw = read('UPLOAD_PACK.md') || '';
const packIdx = packRaw.search(/^##\s*TITLE/mi);
const packAudience = packIdx >= 0 ? packRaw.slice(packIdx) : packRaw;
const textArtifacts = [sceneText, read('narration.json') || '', packAudience].join('\n');
for (const [re, label] of banned) {
  if (re.test(textArtifacts)) fails.push(`${label} found in episode text artifacts`);
}
if (!fails.some(f => f.includes('Rule #15') || f.startsWith('monetization'))) ok.push('no banned wording (underdog / betting / prizes)');

// leftover template text from copied episodes
for (const t of ['Wunderteam', 'Nashama', 'FlagAUT']) {
  if (sceneText.includes(t)) fails.push(`leftover template text: "${t}"`);
}

// correct on-screen episode number
if (epNum) {
  const re = new RegExp(`Episode\\s*${epNum}\\b`, 'i');
  if (!re.test(sceneText)) warns.push(`on-screen "Episode ${epNum}" not found in scene files`);
  else ok.push(`on-screen episode number = ${epNum}`);
}

// ── 4. NAMED-SHOWCASE LIKENESS SIGN-OFF (Rules #28/#29) ─────────────────────────
// Every showcase that puts a real player's NAME on screen must be signed off in
// likeness.json against the still/clip it actually shows. This is the check that
// would have stopped Ep101 (Yamal) and Ep106 (Mbappé) before they ever rendered.
const showcases = [...sceneText.matchAll(/<(?:Player|Award)Showcase[^>]*?clipId="([^"]+)"[^>]*?\bname="([^"]*)"/g)]
  .map(m => ({ clipId: m[1], name: m[2].trim() }));

if (showcases.length) {
  const signRaw = read('likeness.json');
  if (!signRaw) {
    fails.push(`likeness.json MISSING — ${showcases.length} named showcase(s) need visual sign-off (Rule #29). ` +
      `Create it: {"verified":[{"clipId","name","sourceJob","checkedBy","note"}]}`);
  } else {
    const verified = (JSON.parse(signRaw).verified || []);
    const byClip = new Map(verified.map(v => [v.clipId, v]));
    for (const s of showcases) {
      const v = byClip.get(s.clipId);
      if (!v) fails.push(`Rule #29: showcase "${s.name}" (clip ${s.clipId}) has NO likeness sign-off`);
      else if (v.name.replace(/\s+/g, '').toLowerCase() !== s.name.replace(/\s+/g, '').toLowerCase())
        fails.push(`Rule #29: clip ${s.clipId} signed off as "${v.name}" but is captioned "${s.name}"`);
      else if (!v.sourceJob) fails.push(`Rule #29: "${s.name}" sign-off has no sourceJob (which still/clip was checked?)`);
    }
    if (!fails.some(f => f.startsWith('Rule #29'))) ok.push(`${showcases.length} named showcase(s) likeness-verified`);
  }
} else ok.push('no named showcases to verify');

// ── report ──────────────────────────────────────────────────────────────────────
console.log(`\nPREFLIGHT — ${path.basename(dir)}\n${'='.repeat(60)}`);
for (const o of ok) console.log(`  PASS  ${o}`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log('='.repeat(60));
if (fails.length) {
  console.log(`RED — ${fails.length} blocking issue(s). Fix the source, do NOT render.\n`);
  process.exit(1);
}
console.log('GREEN — clear to render.\n');
