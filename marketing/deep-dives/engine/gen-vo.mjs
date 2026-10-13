// gen-vo.mjs <episode-dir> — Brian VO, one mp3 per beat, via ElevenLabs.
//
// Needs ELEVENLABS_API_KEY in the environment (an environment secret — never a
// committed file). previous_text / next_text give each beat the prosody of the
// sentences around it, so 30 separate requests still sound like one read.
// Existing files are kept unless FORCE=1, so a re-run only fills gaps.
import fs from 'node:fs';
import path from 'node:path';
import { BRIAN_VOICE_ID, loadEpisode, rel } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const KEY = process.env.ELEVENLABS_API_KEY;
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
// VO made elsewhere (e.g. scripts/deep-dive-push-vo.mjs on the machine that holds the key)
// is already complete: nothing to generate, so no key is needed.
const have = ep.beats.every((_, i) => fs.existsSync(path.join(epDir, 'vo', `beat_${String(i + 1).padStart(2, '0')}.mp3`)));
if (have && process.env.FORCE !== '1') {
  console.log(`Brian VO already complete: ${ep.beats.length} beats`);
  process.exit(0);
}
if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set. Brian is mandatory for every episode, so no VO can be made.');
  console.error('Add it as an environment secret, then re-run. (PREVIEW=1 builds a silent picture-only preview.)');
  process.exit(2);
}

const voDir = path.join(epDir, 'vo');
fs.mkdirSync(voDir, { recursive: true });
const texts = ep.beats.map((b) => b.vo.trim());

for (let i = 0; i < texts.length; i++) {
  const out = path.join(voDir, `beat_${String(i + 1).padStart(2, '0')}.mp3`);
  if (fs.existsSync(out) && process.env.FORCE !== '1') { console.log('keep', rel(out)); continue; }
  const body = {
    text: texts[i],
    model_id: MODEL,
    previous_text: texts.slice(Math.max(0, i - 2), i).join(' ') || undefined,
    next_text: texts.slice(i + 1, i + 3).join(' ') || undefined,
    voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
  };
  let res;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${BRIAN_VOICE_ID}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(body),
    });
    if (res.ok || (res.status < 500 && res.status !== 429)) break;
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  if (!res.ok) {
    console.error(`beat ${i + 1}: ElevenLabs ${res.status} ${(await res.text()).slice(0, 300)}`);
    process.exit(1);
  }
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log('vo  ', rel(out), `(${texts[i].split(/\s+/).length} words)`);
}
console.log(`Brian VO complete: ${texts.length} beats`);
