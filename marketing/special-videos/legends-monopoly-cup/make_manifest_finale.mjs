#!/usr/bin/env node
// FINALE manifest builder (runs at RENDER time, after Round 3: all VO incl. tbd lines exist
// + LEADERBOARD numbers filled). VO-driven sync. Outputs manifest.json for assemble.mjs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const DIR = new URL('.', import.meta.url).pathname;
const FP = DIR + 'node_modules/ffprobe-static/bin/linux/x64/ffprobe';
const dur = f => parseFloat(execSync(`${FP} -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`).toString().trim());
const seq = JSON.parse(readFileSync(DIR + 'clips_finale.json', 'utf8')).sequence;
const nar = JSON.parse(readFileSync(DIR + 'narration_finale.json', 'utf8'));
const vod = {}; let missing = [];
for (const l of nar.lines) {
  if (l.card || !l.text || !l.text.trim()) continue;
  const f = `${DIR}audio_finale/line_${String(l.id).padStart(2,'0')}.mp3`;
  if (!existsSync(f)) { missing.push(l.id); continue; }
  vod[l.id] = dur(f);
}
if (missing.length) { console.error(`\n  ⛔ Missing VO for lines: ${missing.join(', ')}\n  -> generate them first (Round-3 lines 19,21,23,25,27): node gen_brian.mjs narration_finale.json audio_finale\n`); process.exit(1); }
const LEAD=0.5,TAIL=0.7,GAP=0.3,FLEAD=0.12,FTAIL=0.2;
const clips=[],vo=[],cut={}; let accStart=0;
seq.forEach((c,i)=>{
  const raw=dur(DIR+c.src),hold=c.hold||0;
  const lead=c.flash?FLEAD:LEAD,tail=c.flash?FTAIL:TAIL;
  let screen;
  if(c.lines.length===0) screen=raw+hold;
  else{const v=c.lines.reduce((a,id)=>a+vod[id],0);screen=lead+v+(c.lines.length-1)*GAP+tail+hold;}
  screen=Math.round(screen*100)/100;
  const cs=(i===0)?0:accStart; cut[c.id]=cs;
  let t=cs+lead;
  c.lines.forEach(id=>{vo.push({file:`audio_finale/line_${String(id).padStart(2,'0')}.mp3`,at:Math.round(t*100)/100,vol:1.0});t+=vod[id]+GAP;});
  clips.push({id:c.id,file:c.src,raw:Math.round(raw*100)/100,screen,xf:c.xf??0.4});
  const nx=(seq[i+1]?.xf)??0.4; accStart=cs+screen-nx;
});
const total=cut[seq[seq.length-1].id]+clips[clips.length-1].screen;
const S=(f,a,v)=>({file:`sfx/${f}.mp3`,at:Math.round(a*100)/100,vol:v}); const at=id=>cut[id]??0;
const sfx=[
  S("mystic",at("i01")+0.1,0.4),S("braam",at("tit"),0.55),S("braam",at("v09")+0.3,0.6),S("braam",at("gb")+0.2,0.6),
  S("goal",at("v13")+0.3,0.5),S("goal",at("v19")+0.3,0.5),S("goal",at("v21")+0.3,0.5),S("goal",at("v23")+0.3,0.5),S("goal",at("v25")+0.3,0.5),S("goal",at("v27")+0.3,0.5),
  S("braam",at("lb")+0.2,0.5),S("mystic",at("v41")+0.2,0.45),S("mystic",at("v42")+0.2,0.42),S("braam",at("v49")+0.3,0.6),
  S("braam",at("kn")+0.2,0.55),S("whoosh",at("v59")+0.1,0.45),S("braam",at("v64")+0.2,0.6),S("braam",at("cta"),0.5)
];
const music=[
  {file:"music/score-mystery.m4a",at:0,dur:at("v18")+2,vol:0.26,fadeIn:0.5,fadeOut:3},
  {file:"music/score-anthem.m4a",at:at("v18")-1,dur:(at("v40")-at("v18"))+3,vol:0.22,fadeIn:2,fadeOut:4},
  {file:"music/score-jail.m4a",at:at("v40")-1,dur:(at("v53")-at("v40"))+3,vol:0.26,fadeIn:1.5,fadeOut:4},
  {file:"music/score-build.m4a",at:at("v53")-1,dur:(at("v64")-at("v53"))+3,vol:0.23,fadeIn:2,fadeOut:4},
  {file:"music/score-finale.m4a",at:at("v64")-1,dur:(total-at("v64"))+1,vol:0.25,fadeIn:1.5,fadeOut:6}
];
const manifest={W:1920,H:1080,fps:30,xfade:0.4,outfile:"LegendsGame_GroupFinale.mp4",clips,vo,music,sfx};
writeFileSync(DIR+'manifest.json',JSON.stringify(manifest,null,2));
console.log(`FINALE manifest: ${clips.length} clips, ${vo.length} VO, ${music.length} music, ${sfx.length} sfx`);
console.log(`timeline ≈ ${total.toFixed(1)}s (${Math.floor(total/60)}:${String(Math.round(total%60)).padStart(2,'0')}) | last VO ${vo[vo.length-1].at}s`);
