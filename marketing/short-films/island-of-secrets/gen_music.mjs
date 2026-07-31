// Generate a cinematic music bed with fal.ai (stable-audio). Needs env FAL_KEY.
// Saves music/cue-open.mp3, cue-love.mp3, cue-finale.mp3. Fails soft per-cue.
import fs from 'node:fs';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('no FAL_KEY'); process.exit(1); }
const MODEL = process.env.FAL_AUDIO_MODEL || 'fal-ai/stable-audio';
const H = { 'Authorization': `Key ${KEY}`, 'Content-Type': 'application/json' };
fs.mkdirSync('music', { recursive: true });

const cues = [
  { name: 'cue-open',   secs: 47, prompt: 'slow mysterious cinematic ambient score, soft solo piano and airy sustained strings, lonely misty island at dusk, gentle and emotional, atmospheric, reverb, no drums, no percussion' },
  { name: 'cue-love',   secs: 47, prompt: 'warm romantic cinematic theme, tender solo piano with soft swelling strings, bittersweet love, slow and intimate, emotional film score, no drums' },
  { name: 'cue-finale', secs: 40, prompt: 'bittersweet emotional cinematic finale, swelling strings and gentle piano, melancholic yet hopeful, slow, lush film score, no drums' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findUrl(o) {
  if (!o || typeof o !== 'object') return null;
  if (typeof o.url === 'string' && /^https?:/.test(o.url)) return o.url;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === 'string' && /^https?:\/\/.*\.(mp3|wav|flac|m4a|ogg)/i.test(v)) return v;
    const nested = findUrl(v);
    if (nested) return nested;
  }
  return null;
}

for (const c of cues) {
  try {
    const sub = await fetch(`https://queue.fal.run/${MODEL}`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ prompt: c.prompt, seconds_total: c.secs, seconds_start: 0 }),
    });
    const subj = await sub.json();
    if (!sub.ok) { console.error(c.name, 'submit failed', sub.status, JSON.stringify(subj).slice(0, 300)); continue; }
    const id = subj.request_id || subj.requestId;
    const base = `https://queue.fal.run/${MODEL}/requests/${id}`;
    let done = false, result = null;
    for (let i = 0; i < 60; i++) {
      await sleep(3000);
      const st = await fetch(`${base}/status`, { headers: H });
      const stj = await st.json();
      if (stj.status === 'COMPLETED') { done = true; break; }
      if (stj.status === 'FAILED' || stj.status === 'ERROR') { console.error(c.name, 'job failed', JSON.stringify(stj).slice(0,200)); break; }
    }
    if (!done) { console.error(c.name, 'timed out'); continue; }
    const res = await fetch(base, { headers: H });
    result = await res.json();
    const url = findUrl(result);
    if (!url) { console.error(c.name, 'no audio url', JSON.stringify(result).slice(0, 300)); continue; }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(`music/${c.name}.mp3`, buf);
    console.log(`OK ${c.name} ${(buf.length/1024).toFixed(0)}KB <- ${url}`);
  } catch (e) {
    console.error(c.name, 'error', e.message);
  }
}
console.log('MUSIC DONE');
