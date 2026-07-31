#!/usr/bin/env node
// V3 SYNC ENGINE: each clip's on-screen length is derived from its VO line(s) duration,
// so the player you HEAR is the player you SEE. Emits manifest.json for assemble.mjs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const DIR = new URL('.', import.meta.url).pathname;
const FP = DIR + 'node_modules/ffprobe-static/bin/linux/x64/ffprobe';
const dur = f => parseFloat(execSync(`${FP} -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`).toString().trim());

const seq = JSON.parse(readFileSync(DIR + 'clips_v3.json', 'utf8')).sequence;
const nar = JSON.parse(readFileSync(DIR + 'narration_v3.json', 'utf8'));
const vod = {}; // line id -> vo duration
for (const l of nar.lines) vod[l.id] = dur(`${DIR}audio_v3/line_${String(l.id).padStart(2,'0')}.mp3`);

const LEAD = 0.42, TAIL = 0.55, GAP = 0.22, FLEAD = 0.12, FTAIL = 0.20;
const clips = [], vo = [], cut = {}; // cut[id] = clipStart (for sfx)
let accStart = 0;
seq.forEach((c, i) => {
  const raw = dur(DIR + c.src);
  const hold = c.hold || 0;
  const lead = c.flash ? FLEAD : LEAD, tail = c.flash ? FTAIL : TAIL;
  let screen;
  if (c.lines.length === 0) { screen = raw + hold; }            // silent card (TITLE)
  else {
    const voSum = c.lines.reduce((a, id) => a + vod[id], 0);
    screen = lead + voSum + (c.lines.length - 1) * GAP + tail + hold;
  }
  screen = Math.round(screen * 100) / 100;
  const clipStart = (i === 0) ? 0 : accStart;
  cut[c.id] = clipStart;
  // place VO lines inside this clip
  let t = clipStart + lead;
  c.lines.forEach((id, k) => {
    vo.push({ file: `audio_v3/line_${String(id).padStart(2,'0')}.mp3`, at: Math.round(t*100)/100, vol: 1.0 });
    t += vod[id] + GAP;
  });
  clips.push({ id: c.id, file: c.src, raw: Math.round(raw*100)/100, screen, xf: c.xf ?? 0.4 });
  // advance: next clipStart = thisStart + screen - nextXf  (computed on next iter using its xf)
  const nextXf = (seq[i+1]?.xf) ?? 0.4;
  accStart = clipStart + screen - nextXf;
});
const totalDur = accStart + clips[clips.length-1].screen - (clips[clips.length-1] ? 0 : 0);
// recompute precise total: last clipStart + last screen
const lastStart = cut[seq[seq.length-1].id];
const total = lastStart + clips[clips.length-1].screen;

const S = (file, at, vol) => ({ file: `sfx/${file}.mp3`, at: Math.round(at*100)/100, vol });
const at = id => cut[id];
const sfx = [
  S("mystic", at("i01")+0.1, 0.4), S("whoosh", at("i02"), 0.4), S("whoosh", at("i03"), 0.4),
  S("braam", at("i04")+0.2, 0.55), S("braam", at("i05"), 0.6),
  S("whoosh", at("v09"), 0.3), S("whoosh", at("v10"), 0.3), S("braam", at("v11")+0.1, 0.4),
  S("goal", at("v13")+0.3, 0.5), S("stamp", at("v14")+0.2, 0.45), S("whoosh", at("v16"), 0.45),
  S("pop", at("v17")+0.3, 0.45), S("stamp", at("v18")+0.2, 0.5), S("stamp", at("v19")+0.2, 0.45),
  S("heartbeat", at("v22")+0.2, 0.5), S("heartbeat", at("v23")+0.2, 0.45),
  S("braam", at("v24")+0.2, 0.6), S("heartbeat", at("v25")+0.2, 0.4),
  S("braam", at("v27")+0.1, 0.5), S("whoosh", at("v28")+0.1, 0.4),
  S("braam", at("v29")+0.2, 0.6), S("mystic", at("v30")+0.2, 0.42), S("whoosh", at("v31"), 0.4)
];

// dynamic score mapped to section starts
const music = [
  { file: "music/score-mystery.m4a", at: 0,             dur: at("v05")+2, vol: 0.26, fadeIn: 0.5, fadeOut: 3 },
  { file: "music/score-anthem.m4a",  at: at("v12")-1,   dur: (at("v20")-at("v12"))+3, vol: 0.22, fadeIn: 2, fadeOut: 4 },
  { file: "music/score-jail.m4a",    at: at("v20")-1,   dur: (at("v27")-at("v20"))+3, vol: 0.27, fadeIn: 1.5, fadeOut: 4 },
  { file: "music/score-build.m4a",   at: at("v27")-1,   dur: (at("v30")-at("v27"))+3, vol: 0.23, fadeIn: 2, fadeOut: 3 },
  { file: "music/score-finale.m4a",  at: at("v30")-1,   dur: (total-at("v30"))+1, vol: 0.25, fadeIn: 1.5, fadeOut: 6 }
];

const manifest = { W:1920, H:1080, fps:30, xfade:0.4, outfile:"LegendsMonopolyCup_v3.mp4", clips, vo, music, sfx };
writeFileSync(DIR + 'manifest.json', JSON.stringify(manifest, null, 2));
console.log(`V3 manifest: ${clips.length} clips, ${vo.length} VO lines, ${music.length} music, ${sfx.length} sfx`);
console.log(`timeline ≈ ${total.toFixed(1)}s (${Math.floor(total/60)}:${String(Math.round(total%60)).padStart(2,'0')})`);
console.log(`last VO at ${vo[vo.length-1].at}s — must be < ${total.toFixed(1)}s`);
