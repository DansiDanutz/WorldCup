// Batch-generate the missing per-team player animation library via fal.ai.
// Source = content/images/<Team>/<Player>.png (public GitHub raw URL) -> kling
// image->video -> content/videos/<Team>/<player>.mp4. Soccer-only prompt.
//
// Usage: FAL_KEY=... node scripts/gen-team-library.mjs [Team1 Team2 ...]
//   - no args  -> every content/images team with 0 saved clips (the gaps)
//   - team args -> only those teams (skips players already rendered)
// Never commit FAL_KEY; it is read from the environment only.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const MODEL = 'fal-ai/kling-video/v1.6/standard/image-to-video';
const RAW = 'https://raw.githubusercontent.com/DansiDanutz/WorldCup/main/content/images';
const IMG = 'content/images', VID = 'content/videos';
const CONC = Number(process.env.CONC || 5);
const onlyTeams = process.argv.slice(2);

const slug = (f) => f.replace(/\.png$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const encPath = (p) => p.split('/').map(encodeURIComponent).join('/');
const prompt = (name, team) =>
  `Cinematic Pixar-style 3D animated portrait of soccer/football player ${name} of ${team}. ` +
  `Subtle motion: a confident look to camera, then a determined nod; slow push-in, shallow depth of field, ` +
  `stadium crowd bokeh behind, round-neck football shirt, dramatic rim light, volumetric haze. ` +
  `SOCCER ONLY — NO helmet, NO shoulder pads, NOT american football, NO gridiron goalposts.`;

const teams = (onlyTeams.length ? onlyTeams : fs.readdirSync(IMG))
  .filter((d) => d !== 'Supporters' && fs.existsSync(path.join(IMG, d)) && fs.statSync(path.join(IMG, d)).isDirectory());

const jobs = [];
for (const t of teams) {
  const outdir = path.join(VID, t);
  const existing = fs.existsSync(outdir) ? fs.readdirSync(outdir).filter((f) => f.endsWith('.mp4')).length : 0;
  if (!onlyTeams.length && existing >= 5) continue;            // auto mode: only fill gaps
  const imgs = fs.readdirSync(path.join(IMG, t)).filter((f) => /\.png$/i.test(f)).slice(0, 6);
  for (const f of imgs) {
    const out = path.join(outdir, slug(f) + '.mp4');
    if (fs.existsSync(out)) continue;                          // resume: skip done
    jobs.push({ team: t, name: f.replace(/\.png$/i, '').replace(/-/g, ' '), out,
      url: `${RAW}/${encPath(t)}/${encodeURIComponent(f)}` });
  }
}
console.log(`Teams: ${teams.length} | clips to generate: ${jobs.length}`);

const headers = { Authorization: `Key ${KEY}` };
async function jget(u) { return fetch(u, { headers }).then((r) => r.json()); }

async function one(j) {
  fs.mkdirSync(path.dirname(j.out), { recursive: true });
  const sub = await fetch(`https://queue.fal.run/${MODEL}`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt(j.name, j.team), image_url: j.url, duration: '5', aspect_ratio: '16:9' }),
  }).then((r) => r.json());
  if (!sub.status_url) throw new Error('submit: ' + JSON.stringify(sub).slice(0, 140));
  for (let t = 0; t < 180; t++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await jget(sub.status_url);
    if (st.status === 'COMPLETED') break;
    if (st.status === 'FAILED' || st.error) throw new Error('gen: ' + JSON.stringify(st).slice(0, 140));
    if (t === 179) throw new Error('timeout');
  }
  const res = await jget(sub.response_url);
  const vurl = res?.video?.url || res?.data?.video?.url || res?.videos?.[0]?.url;
  if (!vurl) throw new Error('no url: ' + JSON.stringify(res).slice(0, 140));
  const buf = Buffer.from(await fetch(vurl).then((r) => r.arrayBuffer()));
  if (buf.length < 10000) throw new Error('tiny file');
  fs.writeFileSync(j.out, buf);
}

let i = 0, done = 0; const failed = [];
async function worker() {
  while (i < jobs.length) {
    const j = jobs[i++];
    try { await one(j); done++; }
    catch (e) { failed.push(`${j.team}/${path.basename(j.out)}: ${e.message}`); }
    console.log(`[${done + failed.length}/${jobs.length}] ok=${done} fail=${failed.length}  last=${j.team}/${path.basename(j.out)}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`\nGEN DONE  ok=${done}  failed=${failed.length}`);
failed.forEach((f) => console.log('FAIL', f));
