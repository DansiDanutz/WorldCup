// Generate per-line voiceover MP3s with ElevenLabs.
// Needs env ELEVENLABS_API_KEY. Optional: VOICE_ID, VOICE_NAME, MODEL.
import fs from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('ERROR: set ELEVENLABS_API_KEY'); process.exit(1); }
const MODEL = process.env.MODEL || 'eleven_multilingual_v2';
const API = 'https://api.elevenlabs.io';
const H = { 'xi-api-key': KEY };

const { lines } = JSON.parse(fs.readFileSync('narration.json', 'utf8'));
fs.mkdirSync('audio', { recursive: true });

// ── Pick a voice ────────────────────────────────────────────────────────────
// Preference: a confident, warm, energetic narrator that suits a hype promo.
const PREF = ['Brian','Adam','Antoni','Josh','George','Daniel','Bill','Liam','Will','Charlie','Roger'];
let voiceId = process.env.VOICE_ID || '';
let voiceName = process.env.VOICE_NAME || '';

if (!voiceId) {
  const r = await fetch(`${API}/v1/voices`, { headers: H });
  if (!r.ok) { console.error('voices fetch failed:', r.status, await r.text()); process.exit(1); }
  const { voices } = await r.json();
  // ElevenLabs names carry suffixes ("Brian - Deep, Resonant..."), so match the
  // leading name token, then fall back to a startsWith match.
  const lead = (s) => (s || '').toLowerCase().split(/\s*[-–—]\s*/)[0].trim();
  const byName = (n) => voices.find(v => lead(v.name) === n.toLowerCase())
                     || voices.find(v => (v.name || '').toLowerCase().startsWith(n.toLowerCase()));
  let chosen = voiceName ? byName(voiceName) : null;
  if (!chosen) for (const n of PREF) { chosen = byName(n); if (chosen) break; }
  if (!chosen) chosen = voices.find(v => /narrat|narration/i.test(v.labels?.use_case || '')) || voices[0];
  voiceId = chosen.voice_id; voiceName = chosen.name;
  console.log(`Available voices: ${voices.map(v=>v.name).join(', ')}`);
}
console.log(`>> Using voice: ${voiceName || voiceId}  (model ${MODEL})`);
fs.writeFileSync('audio/_voice.txt', `${voiceName || ''} ${voiceId}\nmodel ${MODEL}\n`);

const voice_settings = { stability: 0.42, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true };

for (let i = 0; i < lines.length; i++) {
  const { text } = lines[i];
  const f = `audio/line_${String(i).padStart(2, '0')}.mp3`;
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
  console.log(`  line ${i}  ${(buf.length/1024).toFixed(0)}KB  "${text.slice(0,48)}..."`);
}
console.log('AUDIO DONE');
