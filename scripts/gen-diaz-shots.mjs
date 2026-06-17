// Generate the NON-REPEATING shot library for the Luis Díaz Bonus film (31 beats).
// Player beats = image->video from his real face; scene beats = text->video Pixar.
// The kidnapping beats are ABSTRACT/SUSPENSEFUL ONLY — no weapons, no violence
// (monetization-safety). Reads FAL_KEY from env.
import fs from 'node:fs';
import path from 'node:path';
const KEY = process.env.FAL_KEY; if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const I2V = 'fal-ai/kling-video/v1.6/standard/image-to-video';
const T2V = 'fal-ai/kling-video/v1.6/standard/text-to-video';
const FACE = 'https://raw.githubusercontent.com/DansiDanutz/WorldCup/main/content/images/Colombia/Luis-Diaz.png';
const OUT = 'marketing/player-films/diaz-freedom/assets';
const CONC = Number(process.env.CONC || 5); const DUR = process.env.DUR || '5';
const A = 'Cinematic Pixar-style 3D animation, dramatic film lighting, shallow depth of field. SOCCER/FOOTBALL ONLY — round-neck shirt, a pitch with goals, NO helmet, NOT american football. ';
const L = 'the adult Colombian soccer winger who looks exactly like the reference (Luis Díaz — lean, athletic, short dark hair), ';
const SHOTS = [
  ['d00-goal-shirt','i2v', A+L+'scoring a dramatic late goal in a packed night stadium and lifting his shirt to reveal a hidden message, intense emotion.'],
  ['d01-plea-sky','i2v', A+L+'an emotional close-up looking up to the sky with a desperate, hopeful plea, floodlights, a single tear.'],
  ['d02-desert','t2v', A+'a sweeping cinematic view of a vast arid Colombian desert at golden dusk, La Guajira, cactus and red dust, lonely and beautiful.'],
  ['d03-village','t2v', A+'a small dusty indigenous Wayuu desert village at dusk, simple homes, warm dignified light.'],
  ['d04-children','t2v', A+'indigenous children walking across a dry dusty plain carrying water, resilient and dignified, soft warm light.'],
  ['d05-skinny-boy','t2v', A+'a thin small boy joyfully playing soccer barefoot on a dusty dirt pitch at sunset, pure love of the game.'],
  ['d06-overlooked','t2v', A+'a small underweight boy looking up hopefully at tall adult scouts who turn away, dejected, soft sad light.'],
  ['d07-father-coach','t2v', A+'a kind father coaching a group of children on a dusty desert football pitch, whistle, dignity, hope.'],
  ['d08-friche-stall','t2v', A+'a father selling plates of traditional food at a humble roadside stall to earn money, warm determined light.'],
  ['d09-father-son-road','t2v', A+'a father and his young son walking a long desert road together carrying a football, silhouettes at golden hour.'],
  ['d10-tournament','t2v', A+'a vibrant indigenous youth football tournament on a modest pitch, colourful crowd, energy and hope.'],
  ['d11-legend-stands','t2v', A+'a famous older football legend with a huge curly golden afro watching intently from the stands, impressed.'],
  ['d12-young-dribble','i2v', A+L+'as a young player dribbling at electric pace past defenders, flair and courage, dazzling.'],
  ['d13-anfield','i2v', A+L+'in a red kit running out under the floodlights of a huge famous European stadium at night, awe.'],
  ['d14-beat-defenders','i2v', A+L+'in a red kit terrorising and gliding past top defenders, joyful and unstoppable.'],
  ['d15-phone-dark','t2v', A+'a phone ringing on a table in a dark quiet room at night, dread and suspense, single shaft of moonlight (no people).'],
  ['d16-night-road','t2v', A+'a tense empty desert road at night with distant headlights and an open door left ajar, ominous, cinematic suspense — NO people, NO weapons.'],
  ['d17-mountain-road','t2v', A+'a lonely winding mountain road disappearing into dark misty hills at night, a feeling of someone gone, melancholic.'],
  ['d18-anguish','i2v', A+L+'alone in shadow, head bowed in anguish and worry, a single low light, heavy emotion.'],
  ['d19-haunted-pitch','i2v', A+L+'standing on a floodlit pitch looking distant and haunted, carrying invisible weight, crowd blurred.'],
  ['d20-bench-run','i2v', A+L+'coming off the bench and running onto the pitch with tense determination, late in a night match.'],
  ['d21-score-erupt','i2v', A+L+'smashing the ball into the net in the last minute as the stadium erupts, raw release of emotion.'],
  ['d22-libertad','i2v', A+L+'lifting his shirt and pointing to the sky after a goal, an emotional plea, tears and floodlights.'],
  ['d23-fans-pray','t2v', A+'Colombian football fans in the stands holding hands and praying, hopeful and tearful, yellow and blue colours.'],
  ['d24-dawn-hope','t2v', A+'a hopeful dawn breaking gold and pink over dark mountains, relief and light after a long night.'],
  ['d25-father-home','t2v', A+'an older man walking a desert road home toward the sunrise, free at last, emotional and warm.'],
  ['d26-idol-portrait','i2v', A+L+'a heroic idol portrait in a yellow Colombia kit, adoring fans blurred behind, proud and beloved.'],
  ['d27-relief','i2v', A+L+'eyes closed in tender relief and gratitude, a small emotional smile, soft warm light.'],
  ['d28-arms-wide','i2v', A+L+'arms spread wide in triumphant emotion, the pride of his people, golden light, goosebumps.'],
  ['d29-cta','t2v', A+'a clean cinematic football stadium beauty shot at golden hour for an end-card, hopeful and grand.'],
  ['d30-outro','i2v', A+L+'a confident warm nod to camera as an outro, the next legend is coming.'],
];
const headers = { Authorization: `Key ${KEY}` };
const jget = (u) => fetch(u, { headers }).then((r) => r.json());
async function one(s){ const [name,mode,prompt]=s; const out=path.join(OUT,name+'.mp4'); if(fs.existsSync(out))return 'skip';
  const body={prompt,duration:DUR,aspect_ratio:'16:9'}; if(mode==='i2v')body.image_url=FACE;
  const sub=await fetch(`https://queue.fal.run/${mode==='i2v'?I2V:T2V}`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
  if(!sub.status_url)throw new Error('submit '+JSON.stringify(sub).slice(0,120));
  for(let t=0;t<240;t++){await new Promise(r=>setTimeout(r,5000)); const st=await jget(sub.status_url); if(st.status==='COMPLETED')break; if(st.status==='FAILED'||st.error)throw new Error('gen '+JSON.stringify(st).slice(0,120)); if(t===239)throw new Error('timeout');}
  const res=await jget(sub.response_url); const url=res?.video?.url||res?.data?.video?.url||res?.videos?.[0]?.url; if(!url)throw new Error('no url');
  const buf=Buffer.from(await fetch(url).then(r=>r.arrayBuffer())); if(buf.length<10000)throw new Error('tiny'); fs.writeFileSync(out,buf); return 'ok'; }
let i=0,ok=0,skip=0; const fail=[];
async function worker(){ while(i<SHOTS.length){ const s=SHOTS[i++]; try{const r=await one(s); if(r==='ok')ok++;else skip++;}catch(e){fail.push(s[0]+': '+e.message);} console.log(`[${ok+skip+fail.length}/${SHOTS.length}] ok=${ok} skip=${skip} fail=${fail.length} last=${s[0]}`);} }
fs.mkdirSync(OUT,{recursive:true});
await Promise.all(Array.from({length:CONC},worker));
console.log(`\nDIAZ SHOTS DONE ok=${ok} skip=${skip} fail=${fail.length}`); fail.forEach(f=>console.log('FAIL',f));
