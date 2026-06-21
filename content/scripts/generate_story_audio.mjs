// Generate match-story voiceover MP3s with ElevenLabs (voice: Brian).
//
// Reads a narration JSON from scripts/narration/<Match>.json and writes one
// MP3 per line into scripts/narration/audio/<Match>/line_XX.mp3, ready for
// make_match_presentation.py to mux into the match video.
//
// Usage:
//   ELEVENLABS_API_KEY=sk_... node generate_story_audio.mjs Mexico-vs-South-Africa
//   Optional env: VOICE_ID, VOICE_NAME (default Brian), MODEL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));

const match = process.argv[2];
if (!match) { console.error('Usage: node generate_story_audio.mjs <Match-Name>'); process.exit(1); }

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('ERROR: set ELEVENLABS_API_KEY'); process.exit(1); }

const narrationFile = path.join(SCRIPTS_DIR, 'narration', `${match}.json`);
if (!fs.existsSync(narrationFile)) { console.error(`ERROR: ${narrationFile} not found`); process.exit(1); }
const narration = JSON.parse(fs.readFileSync(narrationFile, 'utf8'));

const MODEL = process.env.MODEL || narration.model || 'eleven_multilingual_v2';
const API = 'https://api.elevenlabs.io';
const H = { 'xi-api-key': KEY };

const outDir = path.join(SCRIPTS_DIR, 'narration', 'audio', match);
fs.mkdirSync(outDir, { recursive: true });

// ── Pick a voice (same resolution rules as marketing/worldcup26-ad) ────────
let voiceId = process.env.VOICE_ID || '';
let voiceName = process.env.VOICE_NAME || narration.voice || 'Brian';

if (!voiceId) {
  const r = await fetch(`${API}/v1/voices`, { headers: H });
  if (!r.ok) { console.error('voices fetch failed:', r.status, await r.text()); process.exit(1); }
  const { voices } = await r.json();
  const lead = (s) => (s || '').toLowerCase().split(/\s*[-–—]\s*/)[0].trim();
  const chosen = voices.find(v => lead(v.name) === voiceName.toLowerCase())
              || voices.find(v => (v.name || '').toLowerCase().startsWith(voiceName.toLowerCase()))
              || voices[0];
  voiceId = chosen.voice_id; voiceName = chosen.name;
}
console.log(`>> ${match}: voice ${voiceName || voiceId} (model ${MODEL})`);
fs.writeFileSync(path.join(outDir, '_voice.txt'), `${voiceName || ''} ${voiceId}\nmodel ${MODEL}\n`);

const voice_settings = { stability: 0.42, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true };

for (let i = 0; i < narration.lines.length; i++) {
  const { text } = narration.lines[i];
  const f = path.join(outDir, `line_${String(i).padStart(2, '0')}.mp3`);
  if (fs.existsSync(f)) { console.log(`  line ${i}  skip (already generated)`); continue; }
  const url = `${API}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings }),
  });
  if (!r.ok) { console.error(`line ${i} failed:`, r.status, await r.text()); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(f, buf);
  console.log(`  line ${i}  ${(buf.length / 1024).toFixed(0)}KB  "${text.slice(0, 48)}..."`);
}
console.log('AUDIO DONE');
