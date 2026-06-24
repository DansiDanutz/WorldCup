#!/usr/bin/env node
// Generate Brian VO (real ElevenLabs) for narration_v2.json -> audio_v2/line_NN.mp3
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const DIR = new URL('.', import.meta.url).pathname;
// load key from .env.local
const env = readFileSync(DIR + '.env.local', 'utf8');
const KEY = (env.match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
if (!KEY) { console.error('no ELEVENLABS_API_KEY'); process.exit(1); }
const VOICE = 'nPczCjzI2devNBz1zQrb'; // Brian (series canon)
const nar = JSON.parse(readFileSync(DIR + (process.argv[2] || 'narration_v2.json'), 'utf8'));
const OUT = DIR + (process.argv[3] || 'audio_v2');
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const l of nar.lines) {
  if (l.card || l.tbd || !l.text || !l.text.trim()) { console.log(`skip ${l.id} (${l.card?'card':l.tbd?'TBD-round3':'empty'})`); continue; }
  const out = `${OUT}/line_${String(l.id).padStart(2,'0')}.mp3`;
  if (existsSync(out)) { console.log(`skip ${l.id} (exists)`); continue; }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: l.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.5, use_speaker_boost: true }
    })
  });
  if (!res.ok) { console.error(`line ${l.id} FAILED ${res.status}: ${await res.text()}`); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`line ${String(l.id).padStart(2,'0')}  ${(buf.length/1024|0)}KB  "${l.text.slice(0,42)}..."`);
  await sleep(350);
}
console.log('ALL BRIAN VO DONE');
