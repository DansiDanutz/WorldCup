// Each Short's VO ends with its own app CTA ("collect his legendary card ... worldcup26 dot world").
// Ten of those back-to-back would grate, so the anthology uses STORY-ONLY audio and lands a single
// CTA at the end. This finds the silence that starts that closing CTA sentence.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const F = 'node_modules/ffmpeg-static/ffmpeg';
const SRC = '../../content/youtube/did-you-know';
const legends = fs.readdirSync(SRC).filter(d => /^(0[1-9]|10)-/.test(d)).sort();
const out = [];
for (const slug of legends) {
  const vo = path.join(SRC, slug, 'assets/audio/vo_brian.mp3');
  if (!fs.existsSync(vo)) continue;
  const log = spawnSync(F, ['-i', vo, '-af', 'silencedetect=noise=-34dB:d=0.32', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr || '';
  const m = log.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const dur = m ? (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]) : 0;
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(x => +x[1]);
  const ends   = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(x => +x[1]);
  let cut = null;
  for (let i = starts.length - 1; i >= 0; i--) {
    const resume = ends.find(e => e > starts[i]) ?? starts[i];
    const tail = dur - resume;
    if (tail >= 4.5 && tail <= 14) { cut = { silence: +starts[i].toFixed(2), resume: +resume.toFixed(2), tail: +tail.toFixed(2) }; break; }
  }
  out.push({ slug, dur: +dur.toFixed(2), story: cut ? cut.silence : +dur.toFixed(2), cut });
  console.log(`${slug.padEnd(34)} dur=${dur.toFixed(1)}s  ${cut ? `CTA@${cut.resume}s (tail ${cut.tail}s) -> story ends ${cut.silence}s` : 'NO BOUNDARY (keeps full)'}`);
}
fs.writeFileSync('build/vo-cuts.json', JSON.stringify(out, null, 2) + '\n');
console.log(`\n${out.filter(o=>o.cut).length}/${out.length} boundaries found; story-only total = ${out.reduce((a,o)=>a+o.story,0).toFixed(0)}s`);
