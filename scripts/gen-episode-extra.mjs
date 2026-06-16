// Generate EXTRA distinct clips for an episode so the scene can play every clip
// once (no-repeat rule, CLAUDE.md #11). For each star player (content/images/<Team>)
// make 2 distinct action variants (image->video), plus scene clips (text->video):
// home fans (2 moods), away fans, stadium wide, stadium night, mystery-2.
// Usage: FAL_KEY=... node scripts/gen-episode-extra.mjs <epDir> <TeamA> <TeamB>
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const [, , epDir, teamA, teamB] = process.argv;
if (!epDir || !teamA || !teamB) { console.error('args: <epDir> <TeamA> <TeamB>'); process.exit(1); }
const I2V = 'fal-ai/kling-video/v1.6/standard/image-to-video';
const T2V = 'fal-ai/kling-video/v1.6/standard/text-to-video';
const RAW = 'https://raw.githubusercontent.com/DansiDanutz/WorldCup/main/content/images';
const OUT = path.join('marketing/match-videos', epDir, 'assets');
const CONC = Number(process.env.CONC || 4);
const DUR = process.env.DUR || '5';
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
const slug = (f) => f.replace(/\.(png|jpg)$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const BASE = 'Cinematic Pixar-style 3D animation, dramatic stadium lighting, shallow depth of field. SOCCER/FOOTBALL ONLY — round-neck shirt, a pitch with goals, NO helmet, NO shoulder pads, NOT american football. ';
const ACTIONS = [
  ['act', 'sprinting with the ball at full pace, dribbling past a defender, dynamic low angle'],
  ['cel', 'celebrating a goal with an explosive roar and arms wide, crowd blurred behind'],
];
const jobs = [];
for (const team of [teamA, teamB]) {
  const dir = path.join('content/images', team);
  if (!fs.existsSync(dir)) { console.error('no images for', team); continue; }
  const imgs = fs.readdirSync(dir).filter((f) => /\.(png|jpg)$/i.test(f)).slice(0, 5);
  for (const f of imgs) {
    for (const [suf, action] of ACTIONS) {
      const out = path.join(OUT, `${slug(f)}-${suf}.mp4`);
      jobs.push({ out, mode: 'i2v', url: `${RAW}/${enc(team)}/${encodeURIComponent(f)}`,
        prompt: BASE + `the soccer player from the reference, ${action}.` });
    }
  }
}
const tag3 = teamA.slice(0, 3).toLowerCase();
const scene = [
  [`fans-${tag3}-anx.mp4`, `${BASE}a packed home end of ${teamA} ultras, anxious and praying, scarves up, tense.`],
  [`fans-${tag3}-joy.mp4`, `${BASE}a packed home end of ${teamA} fans erupting in jubilation, flares and flags.`],
  [`fans-away2.mp4`, `${BASE}a colourful away end of ${teamB} supporters singing and bouncing, drums.`],
  ['stadium-wide.mp4', `${BASE}a sweeping wide aerial of a full World Cup stadium at dusk, floodlights blazing.`],
  ['stadium-night.mp4', `${BASE}a dramatic night view of a packed stadium, fireworks over the stands.`],
  ['mystery2.mp4', `${BASE}a mysterious hooded elder supporter in the stands, face half in shadow, knowing eyes, cinematic.`],
];
for (const [name, prompt] of scene) jobs.push({ out: path.join(OUT, name), mode: 't2v', prompt });

console.log(`${epDir}: ${jobs.length} extra clips to generate`);
const headers = { Authorization: `Key ${KEY}` };
const jget = (u) => fetch(u, { headers }).then((r) => r.json());
async function one(j) {
  if (fs.existsSync(j.out)) return 'skip';
  const body = { prompt: j.prompt, duration: DUR, aspect_ratio: '16:9' };
  if (j.mode === 'i2v') body.image_url = j.url;
  const sub = await fetch(`https://queue.fal.run/${j.mode === 'i2v' ? I2V : T2V}`, {
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
  if (!url) throw new Error('no url');
  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  if (buf.length < 10000) throw new Error('tiny');
  fs.writeFileSync(j.out, buf);
  return 'ok';
}
fs.mkdirSync(OUT, { recursive: true });
let i = 0, ok = 0, skip = 0; const fail = [];
async function worker() {
  while (i < jobs.length) {
    const j = jobs[i++];
    try { const r = await one(j); if (r === 'ok') ok++; else skip++; }
    catch (e) { fail.push(path.basename(j.out) + ': ' + e.message); }
    console.log(`[${ok + skip + fail.length}/${jobs.length}] ${epDir} ok=${ok} skip=${skip} fail=${fail.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`${epDir} EXTRA DONE ok=${ok} skip=${skip} fail=${fail.length}`);
fail.forEach((f) => console.log('FAIL', f));
