// retime-episode.mjs <episodeDir> <ffmpegPath>
// Re-times narration so NO line overlaps the next (Brian never sped up, rule #12),
// extends DURATION past 300s if needed, shifts scenes + clips to match, and caps
// every clip so it loops at most once.
import fs from 'fs';
import { execSync } from 'child_process';

const dir = process.argv[2];
const ff = process.argv[3];
const GAP = 0.5;        // breathing space between lines
const OUTRO = 2.0;      // tail after last line
const LOOPCAP = 9.0;    // max clip window (5s source => <=1 loop)

const durOf = (f) => {
  try {
    const o = execSync(`${ff} -i "${f}" 2>&1 || true`).toString();
    const m = o.match(/Duration: (\d+):(\d+):([\d.]+)/);
    return m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : 0;
  } catch { return 0; }
};

const narr = JSON.parse(fs.readFileSync(`${dir}/narration.json`, 'utf8'));
const lines = narr.lines;
const durs = lines.map((_, i) => durOf(`${dir}/audio/line_${String(i).padStart(2, '0')}.mp3`));
const origAt = lines.map((l) => l.at);

// new line starts: never overlap, never before the original cue
const newAt = [];
for (let i = 0; i < lines.length; i++) {
  let na = origAt[i];
  if (i > 0) na = Math.max(na, newAt[i - 1] + durs[i - 1] + GAP);
  newAt.push(na);
}
// shift applied at any original time T = shift of the last line at/<=T
const shiftAt = (T) => {
  let s = 0;
  for (let i = 0; i < lines.length; i++) {
    if (origAt[i] <= T + 1e-6) s = newAt[i] - origAt[i]; else break;
  }
  return s;
};

// SCENES from match.html
let html = fs.readFileSync(`${dir}/match.html`, 'utf8');
const block = html.match(/const SCENES = \[([\s\S]*?)\];/)[1];
const re = /\{\s*c:\s*(\w+),\s*start:\s*([\d.]+),\s*end:\s*([\d.]+)\s*\}/g;
const scenes = []; let m;
while ((m = re.exec(block))) scenes.push({ c: m[1], start: +m[2], end: +m[3] });
const ns = scenes.map((s) => ({ c: s.c, start: s.start + shiftAt(s.start), end: s.end + shiftAt(s.end) }));
for (let i = 1; i < ns.length; i++) ns[i].start = ns[i - 1].end; // keep contiguous

const lastEnd = newAt[newAt.length - 1] + durs[durs.length - 1] + OUTRO;
const DURATION = Math.max(ns[ns.length - 1].end, lastEnd);
ns[ns.length - 1].end = DURATION;

// write narration
lines.forEach((l, i) => { l.at = Math.round(newAt[i] * 100) / 100; });
fs.writeFileSync(`${dir}/narration.json`, JSON.stringify(narr, null, 2) + '\n');

// write SCENES + DURATION
const scenesStr = 'const SCENES = [\n' +
  ns.map((s) => `  { c: ${s.c}, start: ${s.start.toFixed(2)}, end: ${s.end.toFixed(2)} },`).join('\n') +
  '\n];';
html = html.replace(/const SCENES = \[[\s\S]*?\];/, scenesStr);
html = html.replace(/const DURATION = [\d.]+;/, `const DURATION = ${DURATION.toFixed(2)};`);
fs.writeFileSync(`${dir}/match.html`, html);

// clips: shift at, cap dur (no >1 loop), extend looping music bed
const clips = JSON.parse(fs.readFileSync(`${dir}/clips.json`, 'utf8'));
clips.clips.forEach((c) => { c.at = Math.round((c.at + shiftAt(c.at)) * 100) / 100; if (c.dur > LOOPCAP) c.dur = LOOPCAP; });
if (clips.music) clips.music.cues.forEach((c) => {
  c.at = Math.round((c.at + shiftAt(c.at)) * 100) / 100;
  if (c.loop) c.dur = Math.max(c.dur, DURATION - c.at + 2); // looping bed covers full length
});
if (clips.sfx) clips.sfx.hits.forEach((h) => { h.at = Math.round((h.at + shiftAt(h.at)) * 100) / 100; });
fs.writeFileSync(`${dir}/clips.json`, JSON.stringify(clips, null, 2) + '\n');

fs.writeFileSync(`${dir}/DURATION.txt`, DURATION.toFixed(2));
const overlaps = lines.filter((l, i) => i < lines.length - 1 && (newAt[i] + durs[i]) > newAt[i + 1] + 0.05).length;
console.log(`retimed ${dir.split('/').pop()}: DURATION ${DURATION.toFixed(1)}s (was 300), residual overlaps ${overlaps}`);
