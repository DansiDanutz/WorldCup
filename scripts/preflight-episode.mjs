#!/usr/bin/env node
// PREFLIGHT GATE — run BEFORE every episode render. Exits non-zero if ANY
// requirement is unmet, so we never render a broken/incomplete episode twice.
// Usage: node scripts/preflight-episode.mjs <episodeDir> <epNumber>
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const dir = process.argv[2];
const epNum = process.argv[3]; // e.g. "33"
if (!dir || !fs.existsSync(dir)) { console.error('PREFLIGHT: bad dir', dir); process.exit(2); }
const r = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(dir, f));
const fails = [];
const warns = [];
const FAIL = (m) => fails.push(m);
const WARN = (m) => warns.push(m);

// 1) Core files present
for (const f of ['match-scenes.jsx', 'match-kit.jsx', 'animations.jsx', 'match.html',
                 'render.mjs', 'serve.mjs', 'mux.mjs', 'clips.json', 'narration.json', 'gen_audio.mjs']) {
  if (!exists(f)) FAIL(`missing core file: ${f}`);
}
if (fails.length) { report(); process.exit(1); }

const scene = r('match-scenes.jsx');
const clips = JSON.parse(r('clips.json'));
const narration = JSON.parse(r('narration.json'));
const lines = narration.lines || narration;

// 2) VO present — one mp3 per narration line
const nLines = lines.length;
let voCount = 0;
for (let i = 0; i < nLines; i++) if (exists(`audio/line_${String(i).padStart(2, '0')}.mp3`)) voCount++;
if (voCount < nLines) FAIL(`VO incomplete: ${voCount}/${nLines} audio/line_NN.mp3 (run gen_audio.mjs)`);

// 3) MUSIC present — every cue file referenced must exist
const cues = clips.music?.cues || [];
if (!cues.length) WARN('clips.json has no music cues');
for (const c of cues) if (!exists(c.src)) FAIL(`MISSING MUSIC FILE: ${c.src} (copy music/ folder)`);

// 4) Clip srcs — every src/clip referenced exists on disk
const srcs = [...scene.matchAll(/(?:src=|clip:\s*)['"](assets\/[A-Za-z0-9_-]+\.mp4)['"]/g)].map((m) => m[1]);
for (const s of [...new Set(srcs)]) if (!exists(s)) FAIL(`MISSING CLIP: ${s}`);

// 5) NO-REPEAT — no clip src used more than once
const counts = {};
for (const s of srcs) counts[s] = (counts[s] || 0) + 1;
const dups = Object.entries(counts).filter(([, n]) => n > 1).map(([s, n]) => `${s}×${n}`);
if (dups.length) FAIL(`NO-REPEAT violated: ${dups.join(', ')}`);

// 6) Squad photos referenced must exist
const imgs = [...scene.matchAll(/img:\s*['"](assets\/squad\/[^'"]+)['"]/g)].map((m) => m[1]);
for (const im of [...new Set(imgs)]) if (!exists(im)) FAIL(`MISSING SQUAD PHOTO: ${im}`);

// 7) NO leftover template furniture (rendered strings only — strip JS comments)
const rendered = scene.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
// always-wrong template artifacts (team-specific terms that legitimately RECUR
// — Wunderteam/Sindelar/FlagAUT for Austria episodes — are NOT here; they're soft-checked)
const hardLeftover = ['NASHAMA', 'IRAQ 1', 'FlagJOR', 'THE BRAVE ONES'];
for (const t of hardLeftover) if (rendered.includes(t)) FAIL(`leftover template text: "${t}"`);
// ambiguous (may be a real player name like "JORDAN AYEW", or a valid debut "DOOR OPENS") — review
const softLeftover = ['AUSTRIA', 'JORDAN', 'DOOR OPENS', 'ROYALTY', 'WUNDERTEAM', 'SINDELAR'];
for (const t of softLeftover) if (rendered.includes(t)) WARN(`check "${t}" is intentional (real name / valid hook) not a template leftover`);
const epLabel = new RegExp(`Episode\\s+(?!${epNum}\\b)\\d+`);
const m = rendered.match(epLabel);
if (m) FAIL(`wrong episode number on screen: "${m[0]}" (expected Episode ${epNum})`);

// 8) MONETIZATION — no betting/odds look
// betting decimals (2.10) and gambling words in RENDERED string literals only
const shown = [...rendered.matchAll(/['"]([^'"]{2,})['"]/g)].map((x) => x[1]).join(' | ');
if (/x\d\.\d{2}\b|\bodds\b|\bbet(ting)?\b|\bwager\b|\bstake\b|\bcoef\b/i.test(shown)) FAIL('gambling/odds wording shown on screen (monetization risk)');

// 9) NO SUBTITLES — banned sentence props (rule #10)
if (/<LowerThird[^>]*\sline=/.test(scene)) FAIL('LowerThird line= sentence (no-subtitles rule)');
if (/<HistoryPlate[^>]*\snote=/.test(scene)) FAIL('HistoryPlate note= sentence (no-subtitles rule)');

// 11) NO VO OVERLAP / NO SPEED-UP (rule #12) — each line's audio must finish before the next starts
try {
  const req = createRequire(import.meta.url);
  let ff = 'ffmpeg';
  for (const p of [path.join(dir, 'node_modules/ffmpeg-static'), 'ffmpeg-static']) { try { ff = req(p); break; } catch {} }
  const durOf = (f) => { try { const o = execSync(`"${ff}" -i "${path.join(dir, f)}" 2>&1 || true`).toString(); const mm = o.match(/Duration: (\d+):(\d+):([\d.]+)/); return mm ? (+mm[1] * 3600 + +mm[2] * 60 + +mm[3]) : 0; } catch { return 0; } };
  const DUR = +((r('match.html').match(/const DURATION = ([\d.]+)/) || [])[1] || 300);
  let over = 0;
  for (let i = 0; i < nLines; i++) {
    const d = durOf(`audio/line_${String(i).padStart(2, '0')}.mp3`);
    const next = i < nLines - 1 ? lines[i + 1].at : DUR;
    if (lines[i].at + d > next + 0.15) { over++; if (over <= 4) FAIL(`VO OVERLAP/speed-up: line ${i} (${d.toFixed(1)}s @${lines[i].at}s) runs past next @${next}s — run scripts/retime-episode.mjs`); }
  }
} catch (e) { WARN('could not measure VO durations (ffmpeg): ' + e.message); }

// 12) NO CLIP LOOP (rule #11) — a ~5s source must not be stretched into a long looping window
for (const c of clips.clips || []) if ((c.dur || 0) > 10.5) FAIL(`clip LOOPS >1×: ${c.id || c.src} dur ${c.dur}s (cap <=9s — run retimer)`);

// 10) Syntax sanity — balanced braces/parens
let b = 0, p = 0; for (const ch of scene) { if (ch === '{') b++; else if (ch === '}') b--; else if (ch === '(') p++; else if (ch === ')') p--; }
if (b !== 0 || p !== 0) FAIL(`unbalanced braces(${b})/parens(${p}) — scene may be mid-edit/broken`);

function report() {
  if (warns.length) console.log('PREFLIGHT WARN:\n - ' + warns.join('\n - '));
  if (fails.length) console.log(`PREFLIGHT FAILED (${fails.length}):\n - ` + fails.join('\n - '));
  else console.log(`PREFLIGHT PASS — ${dir} ready to render (${nLines} VO lines, ${cues.length} music cues, ${new Set(srcs).size} unique clips, no repeats).`);
}
report();
process.exit(fails.length ? 1 : 0);
