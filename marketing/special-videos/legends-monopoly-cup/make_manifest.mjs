#!/usr/bin/env node
// Builds manifest.json: clips (timeline order + slow-mo screen durations),
// VO (narration at scene times), music (bespoke scores by section), SFX hits.
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = new URL('.', import.meta.url).pathname;
const nar = JSON.parse(readFileSync(DIR + 'narration.json', 'utf8'));

const order = ["c01","c02","c03","c04","c05","c06","c07","c08","c09","c10","c11","c12","c13","c14","c15","c16","c17","c18","c19","c20","c21","c22","c23","c24","c25","c26","c27","c28"];
const ten = new Set(["c01","c08","c16","c17","c20","c27"]); // 10s-raw -> 15s screen
const clips = order.map(id => ({ id, file: `prep/${id}.mp4`, raw: ten.has(id)?10:5, screen: ten.has(id)?15:10 }));

const vo = nar.lines.map(l => ({ file: `audio/line_${String(l.id).padStart(2,'0')}.mp3`, at: l.at, vol: 1.0 }));

// Bespoke AI scores (original, generated in-workspace). Reused across cues = fine.
const music = [
  { file: "music/score-mystery.m4a", at: 0,   dur: 42, vol: 0.24, fadeIn: 1, fadeOut: 5 },
  { file: "music/score-anthem.m4a",  at: 40,  dur: 58, vol: 0.22, fadeIn: 3, fadeOut: 5 },
  { file: "music/score-build.m4a",   at: 96,  dur: 52, vol: 0.22, fadeIn: 3, fadeOut: 5 },
  { file: "music/score-jail.m4a",    at: 146, dur: 35, vol: 0.27, fadeIn: 2, fadeOut: 4 },
  { file: "music/score-mystery.m4a", at: 178, dur: 24, vol: 0.24, fadeIn: 2, fadeOut: 4 },
  { file: "music/score-build.m4a",   at: 200, dur: 40, vol: 0.22, fadeIn: 3, fadeOut: 4 },
  { file: "music/score-finale.m4a",  at: 236, dur: 35, vol: 0.25, fadeIn: 2, fadeOut: 5 },
  { file: "music/score-anthem.m4a",  at: 268, dur: 30, vol: 0.22, fadeIn: 2, fadeOut: 7 }
];

const S = (file, at, vol) => ({ file: `sfx/${file}.mp3`, at, vol });
const sfx = [
  S("whistle",0.3,0.30), S("braam",0.6,0.5), S("mystic",14,0.4),
  S("whoosh",33,0.4), S("pop",42,0.4), S("whoosh",49,0.35), S("braam",56,0.45),
  S("goal",72,0.5), S("stamp",86,0.5),
  S("whoosh",96,0.4), S("pop",112,0.45), S("whoosh",118,0.35),
  S("stamp",125,0.5), S("stamp",133,0.45),
  S("whoosh",143,0.4), S("heartbeat",152,0.5), S("heartbeat",162,0.45), S("heartbeat",172,0.45), S("heartbeat",182,0.4),
  S("braam",200,0.5), S("mystic",216,0.4),
  S("whoosh",234,0.4), S("braam",243,0.45), S("mystic",253,0.4),
  S("braam",262,0.5), S("whoosh",286,0.45)
];

const manifest = { W:1920, H:1080, fps:30, xfade:0.5, outfile:"LegendsMonopolyCup.mp4", clips, vo, music, sfx };
writeFileSync(DIR + 'manifest.json', JSON.stringify(manifest, null, 2));
console.log(`manifest.json written: ${clips.length} clips, ${vo.length} VO, ${music.length} music, ${sfx.length} sfx`);
