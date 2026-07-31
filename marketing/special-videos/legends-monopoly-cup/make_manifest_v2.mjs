#!/usr/bin/env node
// Build manifest.json (V2) from clips_v2.json + narration_v2.json (Brian VO).
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = new URL('.', import.meta.url).pathname;
const seq = JSON.parse(readFileSync(DIR + 'clips_v2.json', 'utf8')).sequence;
const nar = JSON.parse(readFileSync(DIR + 'narration_v2.json', 'utf8'));

const clips = seq.map(s => ({ id: s.v, file: s.src, raw: s.raw, screen: Math.round(s.screen * 1.10) }));
const vo = nar.lines.map(l => ({ file: `audio_v2/line_${String(l.id).padStart(2,'0')}.mp3`, at: l.at, vol: 1.0 }));

// Bespoke AI score, mapped to the V2 dramatic structure
const music = [
  { file: "music/score-mystery.m4a", at: 0,   dur: 44, vol: 0.23, fadeIn: 1, fadeOut: 5 },
  { file: "music/score-anthem.m4a",  at: 58,  dur: 60, vol: 0.21, fadeIn: 3, fadeOut: 5 },
  { file: "music/score-build.m4a",   at: 112, dur: 30, vol: 0.21, fadeIn: 2, fadeOut: 4 },
  { file: "music/score-jail.m4a",    at: 138, dur: 35, vol: 0.27, fadeIn: 2, fadeOut: 4 },
  { file: "music/score-mystery.m4a", at: 170, dur: 30, vol: 0.24, fadeIn: 2, fadeOut: 4 },
  { file: "music/score-build.m4a",   at: 198, dur: 44, vol: 0.22, fadeIn: 3, fadeOut: 5 },
  { file: "music/score-finale.m4a",  at: 240, dur: 35, vol: 0.25, fadeIn: 2, fadeOut: 5 },
  { file: "music/score-anthem.m4a",  at: 272, dur: 28, vol: 0.22, fadeIn: 2, fadeOut: 7 }
];

const S = (file, at, vol) => ({ file: `sfx/${file}.mp3`, at, vol });
const sfx = [
  S("whistle",0.3,0.28), S("braam",0.6,0.5), S("mystic",14,0.42), S("braam",22,0.4),
  S("whoosh",32,0.4), S("pop",38,0.4), S("whoosh",45,0.35), S("braam",52,0.45),
  S("goal",73,0.5), S("stamp",84,0.5), S("whoosh",98,0.4), S("pop",112,0.45),
  S("stamp",120,0.5), S("stamp",128,0.45),
  S("whoosh",137,0.4), S("heartbeat",146,0.5), S("braam",169,0.5), S("heartbeat",170,0.45), S("heartbeat",182,0.42),
  S("braam",197,0.5), S("whoosh",222,0.4), S("mystic",241,0.42), S("whoosh",260,0.4), S("braam",285,0.5)
];

const manifest = { W:1920, H:1080, fps:30, xfade:0.5, outfile:"LegendsMonopolyCup_v2.mp4", clips, vo, music, sfx };
writeFileSync(DIR + 'manifest.json', JSON.stringify(manifest, null, 2));
console.log(`V2 manifest: ${clips.length} clips, ${vo.length} VO, ${music.length} music, ${sfx.length} sfx`);
const total = clips.reduce((a,c)=>a+c.screen,0) - (clips.length-1)*0.5;
console.log(`timeline ≈ ${total.toFixed(1)}s`);
