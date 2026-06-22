#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const DIR = new URL('.', import.meta.url).pathname;
const FP = DIR + 'node_modules/ffprobe-static/bin/linux/x64/ffprobe';
const dur = f => parseFloat(execSync(`${FP} -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`).toString().trim());
const seq = JSON.parse(readFileSync(DIR + 'clips_v5.json', 'utf8')).sequence;
const nar = JSON.parse(readFileSync(DIR + 'narration_v5.json', 'utf8'));
const vod = {};
for (const l of nar.lines) vod[l.id] = dur(`${DIR}audio_v5/line_${String(l.id).padStart(2,'0')}.mp3`);
const LEAD = 0.5, TAIL = 0.68, GAP = 0.3, FLEAD = 0.12, FTAIL = 0.2;
const clips = [], vo = [], cut = {};
let accStart = 0;
seq.forEach((c, i) => {
  const raw = dur(DIR + c.src), hold = c.hold || 0;
  const lead = c.flash ? FLEAD : LEAD, tail = c.flash ? FTAIL : TAIL;
  let screen;
  if (c.lines.length === 0) screen = raw + hold;
  else { const voSum = c.lines.reduce((a,id)=>a+vod[id],0); screen = lead + voSum + (c.lines.length-1)*GAP + tail + hold; }
  screen = Math.round(screen*100)/100;
  const clipStart = (i===0)?0:accStart; cut[c.id]=clipStart;
  let t = clipStart + lead;
  c.lines.forEach(id => { vo.push({ file:`audio_v5/line_${String(id).padStart(2,'0')}.mp3`, at:Math.round(t*100)/100, vol:1.0 }); t += vod[id]+GAP; });
  clips.push({ id:c.id, file:c.src, raw:Math.round(raw*100)/100, screen, xf:c.xf??0.4 });
  const nextXf = (seq[i+1]?.xf)??0.4; accStart = clipStart + screen - nextXf;
});
const total = cut[seq[seq.length-1].id] + clips[clips.length-1].screen;
const S=(f,a,v)=>({file:`sfx/${f}.mp3`,at:Math.round(a*100)/100,vol:v}); const at=id=>cut[id]??0;
const sfx=[
  S("mystic",at("i01")+0.1,0.4),S("whoosh",at("i02"),0.4),S("whoosh",at("i03"),0.4),S("braam",at("i04")+0.2,0.55),S("braam",at("tit"),0.6),
  S("whoosh",at("v07"),0.35),S("whoosh",at("v08"),0.35),S("whoosh",at("v09"),0.35),S("braam",at("v10")+0.1,0.45),
  S("braam",at("v14")+0.1,0.4),S("goal",at("v15")+0.3,0.5),S("whoosh",at("v16"),0.3),S("braam",at("v17")+0.2,0.45),
  S("goal",at("v20")+0.3,0.5),S("goal",at("v21")+0.3,0.5),S("stamp",at("v22")+0.2,0.45),
  S("whoosh",at("v24"),0.45),S("whoosh",at("v25")+0.1,0.45),S("pop",at("v26")+0.3,0.45),
  S("stamp",at("v27")+0.2,0.5),S("stamp",at("v28")+0.2,0.45),S("goal",at("v29")+0.3,0.5),
  S("heartbeat",at("v32")+0.2,0.5),S("heartbeat",at("v33")+0.2,0.45),S("braam",at("v35")+0.2,0.6),S("heartbeat",at("v36")+0.3,0.4),
  S("braam",at("v39")+0.1,0.5),S("whoosh",at("v43")+0.1,0.4),S("braam",at("v44")+0.2,0.6),
  S("braam",at("v46"),0.55),S("whoosh",at("v47")+0.1,0.4),S("braam",at("v48")+0.2,0.55),S("mystic",at("v49")+0.2,0.42),S("whoosh",at("v51"),0.4)
];
const music=[
  {file:"music/score-mystery.m4a",at:0,dur:at("v11")+2,vol:0.26,fadeIn:0.5,fadeOut:3},
  {file:"music/score-anthem.m4a",at:at("v19")-1,dur:(at("v30")-at("v19"))+3,vol:0.22,fadeIn:2,fadeOut:4},
  {file:"music/score-jail.m4a",at:at("v30")-1,dur:(at("v39")-at("v30"))+3,vol:0.27,fadeIn:1.5,fadeOut:4},
  {file:"music/score-build.m4a",at:at("v39")-1,dur:(at("v49")-at("v39"))+3,vol:0.23,fadeIn:2,fadeOut:3},
  {file:"music/score-finale.m4a",at:at("v49")-1,dur:(total-at("v49"))+1,vol:0.25,fadeIn:1.5,fadeOut:6}
];
const manifest={W:1920,H:1080,fps:30,xfade:0.4,outfile:"LegendsMonopolyCup_v5.mp4",clips,vo,music,sfx};
writeFileSync(DIR+'manifest.json',JSON.stringify(manifest,null,2));
console.log(`V5 manifest: ${clips.length} clips, ${vo.length} VO, ${music.length} music, ${sfx.length} sfx`);
console.log(`timeline ≈ ${total.toFixed(1)}s (${Math.floor(total/60)}:${String(Math.round(total%60)).padStart(2,'0')}) | last VO ${vo[vo.length-1].at}s`);
