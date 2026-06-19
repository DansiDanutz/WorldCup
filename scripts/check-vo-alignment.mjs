#!/usr/bin/env node
// check-vo-alignment.mjs — GUARD against the Ep33 defect: narration that drifts out
// of sync with the on-screen scenes. Run from an episode dir BEFORE every mux:
//     node ../../../scripts/check-vo-alignment.mjs        (or pass the dir as argv[2])
//
// It parses the SCENES table from match.html (the scene windows), reads narration.json
// (the VO `at` times) + each audio/line_NN.mp3 duration, and FAILS if:
//   1. a VO line's audio overruns the start of the next line (overlap > 0.5s),
//   2. a VO line ends past the 300s hard cut (> 300.3s),
//   3. a VO line starts in a scene whose content can't match it — heuristic: it prints
//      the scene each line lands in so a human/agent can eyeball that the squad lines are
//      in the squad scenes, the save lines in the drama scene, etc.
// Exit non-zero on any hard failure (1 or 2). The scene-mapping table is advisory output.
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const dir = process.argv[2] || '.';
const html = fs.readFileSync(path.join(dir, 'match.html'), 'utf8');
const { lines } = JSON.parse(fs.readFileSync(path.join(dir, 'narration.json'), 'utf8'));

// Parse SCENES = [ { c: SceneX, start: a, end: b }, ... ]
const scenes = [...html.matchAll(/c:\s*(\w+),\s*start:\s*([\d.]+),\s*end:\s*([\d.]+)/g)]
  .map((m) => ({ name: m[1].replace(/^Scene/, ''), start: +m[2], end: +m[3] }));
if (!scenes.length) { console.error('FAIL: could not parse SCENES from match.html'); process.exit(1); }
const sceneAt = (t) => (scenes.find((s) => t >= s.start && t < s.end) || { name: '??' }).name;

const dur = (f) => {
  try { return +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim(); }
  catch { return 0; }
};

let hard = 0;

// GUARD (the Ep35 lesson): the ScoreBug team codes are hardcoded in match-kit.jsx and are
// inherited verbatim when an episode is cloned from another. If they still read the template
// values for a different matchup, the score bug shows the WRONG nations (Ep33/34/35 all shipped
// "USA"/"AUS" once). Flag any score-bug code that isn't one of this episode's two teams.
try {
  const kit = fs.readFileSync(path.join(dir, 'match-kit.jsx'), 'utf8');
  const codes = [...kit.matchAll(/}}>([A-Z]{3})<\/div>/g)].map((m) => m[1]);
  if (codes.length) {
    // derive expected codes from the folder name (matchNN-teama-vs-teamb) is unreliable; just
    // surface the codes so they can be eyeballed, and HARD-FAIL on the known template leftovers.
    const template = codes.filter((c) => ['USA', 'AUS', 'JOR'].includes(c));
    console.log(`# ScoreBug team codes in match-kit.jsx: ${codes.join(' / ')}`);
    if (template.length) { console.error(`❌ ScoreBug still has template code(s) ${template.join(',')} — set them to THIS episode's teams.`); hard++; }
  }
} catch {}

console.log(`# ${path.resolve(dir).split('/').pop()} — VO ↔ scene alignment`);
console.log('  L   at    end   scene        note');
for (let i = 0; i < lines.length; i++) {
  const f = path.join(dir, `audio/line_${String(i).padStart(2, '0')}.mp3`);
  if (!fs.existsSync(f)) { console.error(`FAIL: missing ${f}`); hard++; continue; }
  const at = lines[i].at, end = at + dur(f);
  const next = i + 1 < lines.length ? lines[i + 1].at : 300;
  const notes = [];
  if (end - next > 0.5) { notes.push(`OVERLAP next by ${(end - next).toFixed(1)}s`); hard++; }
  if (end > 300.3) { notes.push(`PAST 300 by ${(end - 300).toFixed(1)}s`); hard++; }
  console.log(`  ${String(i).padStart(2)} ${at.toFixed(1).padStart(5)} ${end.toFixed(1).padStart(6)}  ${sceneAt(at).padEnd(11)} ${notes.join('; ')}`);
}
if (hard) { console.error(`\n❌ ${hard} hard timing problem(s) — fix narration.json before muxing.`); process.exit(1); }
console.log('\n✅ No overlaps, nothing past 300s. Eyeball the scene column: squad lines in *Squad, save lines in Drama, etc.');
