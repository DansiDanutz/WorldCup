// gen_srt.mjs — auto-generate YouTube subtitles (.srt) from narration.json.
// Self-evolution feature (Ep4+): most feed views start muted; captions lift
// retention and accessibility. Upload the .srt with the video.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const { lines } = JSON.parse(fs.readFileSync('narration.json', 'utf8'));
const durOf = (f) => {
  const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  return m ? (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]) : 4;
};
const ts = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60),
        ms = Math.round((s % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

// split a long line into <=2 caption chunks at sentence/clause boundaries
const chunk = (text) => {
  if (text.length <= 84) return [text];
  const parts = text.split(/(?<=[.!?…])\s+/);
  const out = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + ' ' + p).trim().length > 84 && cur) { out.push(cur.trim()); cur = p; }
    else cur = (cur + ' ' + p).trim();
  }
  if (cur) out.push(cur.trim());
  return out;
};

let srt = '', n = 1;
for (let i = 0; i < lines.length; i++) {
  const at = lines[i].at;
  const dur = durOf(`audio/line_${String(i).padStart(2, '0')}.mp3`);
  const chunks = chunk(lines[i].text);
  const per = dur / chunks.length;
  chunks.forEach((c, k) => {
    srt += `${n++}\n${ts(at + k * per)} --> ${ts(at + (k + 1) * per - 0.05)}\n${c}\n\n`;
  });
}
fs.writeFileSync('subtitles.srt', srt);
console.log(`subtitles.srt written (${n - 1} cues)`);
