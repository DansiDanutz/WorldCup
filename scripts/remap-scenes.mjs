import fs from 'fs';
const dir = process.argv[2];
const OLD = [0,16,28,44,98.5,133.5,164.5,186,242,256,270,288,300];
const html = fs.readFileSync(dir+'/match.html','utf8');
const se=[...html.matchAll(/start:\s*([\d.]+),\s*end:\s*([\d.]+)/g)].map(x=>[+x[1],+x[2]]);
const NEW = se.map(x=>x[0]); NEW.push(se[se.length-1][1]);
if(NEW.length!==OLD.length){console.error('scene count mismatch',NEW.length,OLD.length);process.exit(1);}
function remap(T){
  if(T<=OLD[0]) return NEW[0]+(T-OLD[0]);
  for(let i=0;i<OLD.length-1;i++){ if(T<=OLD[i+1]+1e-9){ const f=(T-OLD[i])/(OLD[i+1]-OLD[i]); return NEW[i]+f*(NEW[i+1]-NEW[i]); } }
  return NEW[NEW.length-1]+(T-OLD[OLD.length-1]);
}
let js=fs.readFileSync(dir+'/match-scenes.jsx','utf8'), n=0;
js=js.replace(/(start|end)=\{(\d+(?:\.\d+)?)\}/g,(full,prop,num)=>{n++;return `${prop}={${remap(+num).toFixed(2)}}`;});
fs.writeFileSync(dir+'/match-scenes.jsx',js);
console.log('remapped '+n+' absolute timings in '+dir.split('/').pop());
