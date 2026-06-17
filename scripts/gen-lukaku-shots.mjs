// Generate a full, NON-REPEATING shot library for the Lukaku Bonus film.
// One unique 10s clip per narration beat (~33). Player beats use the real
// Lukaku face (image->video from content/images/Belgium/RomeluLukaku.png);
// scene beats use text->video Pixar-style. Reads FAL_KEY from env.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const I2V = 'fal-ai/kling-video/v1.6/standard/image-to-video';
const T2V = 'fal-ai/kling-video/v1.6/standard/text-to-video';
const FACE = 'https://raw.githubusercontent.com/DansiDanutz/WorldCup/main/content/images/Belgium/RomeluLukaku.png';
const OUT = 'marketing/player-films/lukaku-the-promise/assets';
const CONC = Number(process.env.CONC || 4);
const DUR = process.env.DUR || '5';

const A = 'Cinematic Pixar-style 3D animation, dramatic film lighting, shallow depth of field, soccer/football only — round-neck shirt, NO helmet, NOT american football. ';
const L = 'adult Black Belgian soccer striker who looks exactly like the reference (Romelu Lukaku — tall, powerful, short hair, strong jaw), ';
// shots: [name, mode, prompt]
const SHOTS = [
  ['s00-header-goal','i2v', A+L+'rising highest in a packed night stadium to power a header, the net snapping tight, floodlights, slow-motion.'],
  ['s01-idol-cameras','i2v', A+L+'lit by camera flashes after scoring, a giant of a man, but his eyes hide a secret, emotional close-up.'],
  ['s02-portrait','i2v', A+L+'quiet heroic portrait looking to camera, stadium bokeh behind, the title moment.'],
  ['s03-boy-fridge','t2v', A+'a six-year-old Black Belgian boy in a small dim Antwerp kitchen at dawn, opening an old refrigerator before school, soft cold light.'],
  ['s04-milk-water','t2v', A+'close-up of a mother\'s hands pouring water into the last of a milk carton to stretch it, on a worn kitchen table, melancholic.'],
  ['s05-boy-realize','t2v', A+'the same six-year-old boy\'s face slowly understanding they are broke, a single quiet tear, soft window light.'],
  ['s06-father-faded','t2v', A+'a retired Black footballer father in a faded jacket sitting in a dim room, an old framed football photo, money worries.'],
  ['s07-social-housing','t2v', A+'a bleak social-housing flat, a mattress on the floor, a candle because the electricity is off, bread on a plate, dignity in poverty.'],
  ['s08-grandfather','t2v', A+'an elderly Black grandfather gently holding a frightened small boy, a tender last-words moment, warm dim light.'],
  ['s09-boy-promise','t2v', A+'the small boy alone, clenching his fist with stubborn determination, a silent impossible promise, dramatic light.'],
  ['s10-boy-mother','t2v', A+'the boy looking up at his tired mother with fierce love, vowing silently to buy back her smile, intimate.'],
  ['s11-youth-train','t2v', A+'a determined Black teenage soccer player training alone at dusk on a worn pitch, playing like a son with a debt, intense.'],
  ['s12-academy','t2v', A+'a talented Black youth soccer prospect progressing through academy training grounds, badges and cones, hopeful rising.'],
  ['s13-debut-16','i2v', A+L+'as a sixteen-year-old making his professional debut, running onto a floodlit pitch, nervous and electric.'],
  ['s14-promise-kept','i2v', A+L+'young, standing tall on the pitch after his debut, promise kept, only the beginning, triumphant.'],
  ['s15-epl','i2v', A+L+'in a red Premier League kit powering past defenders and scoring in a roaring English stadium.'],
  ['s16-inter-title','i2v', A+L+'in a blue-and-black Inter Milan striped kit celebrating a league title, confetti, ecstatic.'],
  ['s17-belgium','i2v', A+L+'in a red Belgium national-team kit leading his golden generation, arms wide, proud.'],
  ['s18-record','i2v', A+L+'celebrating a record-breaking goal for his nation, eighty-nine, overwhelmed with emotion.'],
  ['s19-montage','i2v', A+L+'a sweeping career montage of scoring across world stadiums, three hundred goals, powerful.'],
  ['s20-idol-crowd','i2v', A+L+'standing before an adoring sea of fans, the broke boy now an idol to millions, goosebumps.'],
  ['s21-tested','i2v', A+L+'alone and pensive in a tunnel, idols are tested, his hardest opponent never wore a shirt.'],
  ['s22-headline-praise','t2v', A+'a glowing newspaper/social headline praising "the Belgian striker", bright, celebratory typography motion.'],
  ['s23-headline-racism','t2v', A+'a cold harsh headline that adds "of Congolese descent" after a miss, the sting of prejudice, desaturated.'],
  ['s24-answer-goals','i2v', A+L+'jaw set, answering his critics the only way he knows — striking the ball hard into the net.'],
  ['s25-point-sky','i2v', A+L+'after scoring, pointing to the sky and to his heart, every goal has a meaning.'],
  ['s26-mother-callback','t2v', A+'callback to the mother at the refrigerator on a cold Antwerp morning, making the milk last, tender memory.'],
  ['s27-keep-word','i2v', A+L+'embracing his proud mother outside a warm new home he bought her, he kept his word, emotional.'],
  ['s28-debt','i2v', A+L+'a soulful close-up, what turns a player into an idol is the debt he refused to forget.'],
  ['s29-roar','i2v', A+L+'an explosive primal roar of celebration after a goal, veins, passion, now you know the secret.'],
  ['s30-boy-and-man','t2v', A+'a poetic split of a small Antwerp boy and the grown idol superimposed, still the same child keeping his promise.'],
  ['s31-cta','t2v', A+'a clean cinematic football stadium beauty shot at golden hour for an end-card, hopeful and grand.'],
  ['s32-outro','i2v', A+L+'a confident wink/nod to camera as an outro, the next legend is coming.'],
];

const headers = { Authorization: `Key ${KEY}` };
const jget = (u) => fetch(u, { headers }).then((r) => r.json());
async function one(s) {
  const [name, mode, prompt] = s;
  const out = path.join(OUT, name + '.mp4');
  if (fs.existsSync(out)) return 'skip';
  const model = mode === 'i2v' ? I2V : T2V;
  const body = { prompt, duration: DUR, aspect_ratio: '16:9' };
  if (mode === 'i2v') body.image_url = FACE;
  const sub = await fetch(`https://queue.fal.run/${model}`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());
  if (!sub.status_url) throw new Error('submit ' + JSON.stringify(sub).slice(0, 120));
  for (let t = 0; t < 240; t++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await jget(sub.status_url);
    if (st.status === 'COMPLETED') break;
    if (st.status === 'FAILED' || st.error) throw new Error('gen ' + JSON.stringify(st).slice(0, 120));
    if (t === 239) throw new Error('timeout');
  }
  const res = await jget(sub.response_url);
  const url = res?.video?.url || res?.data?.video?.url || res?.videos?.[0]?.url;
  if (!url) throw new Error('no url ' + JSON.stringify(res).slice(0, 120));
  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  if (buf.length < 10000) throw new Error('tiny');
  fs.writeFileSync(out, buf);
  return 'ok';
}
let i = 0, ok = 0, skip = 0; const fail = [];
async function worker() {
  while (i < SHOTS.length) {
    const s = SHOTS[i++];
    try { const r = await one(s); if (r === 'ok') ok++; else skip++; }
    catch (e) { fail.push(s[0] + ': ' + e.message); }
    console.log(`[${ok + skip + fail.length}/${SHOTS.length}] ok=${ok} skip=${skip} fail=${fail.length} last=${s[0]}`);
  }
}
fs.mkdirSync(OUT, { recursive: true });
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`\nLUKAKU SHOTS DONE ok=${ok} skip=${skip} fail=${fail.length}`);
fail.forEach((f) => console.log('FAIL', f));
