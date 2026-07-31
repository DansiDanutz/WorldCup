// Generate sound-design SFX with ElevenLabs sound-generation. Needs ELEVENLABS_API_KEY.
// Ambient beds (loopable) + one-shot hits. Saves to sfx/. Fails soft per item.
import fs from 'node:fs';
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('no ELEVENLABS_API_KEY'); process.exit(1); }
const API = 'https://api.elevenlabs.io/v1/sound-generation';
fs.mkdirSync('sfx', { recursive: true });

const items = [
  // ambient beds (loopable)
  { name: 'amb-ocean', secs: 22, loop: true,  text: 'continuous gentle ocean waves lapping a calm quiet shore, seamless soft sea ambience' },
  { name: 'amb-birds', secs: 18, loop: true,  text: 'distant seagulls and seabirds calling over a lonely island, soft breeze, peaceful ambience' },
  { name: 'amb-wind',  secs: 18, loop: true,  text: 'soft sea wind blowing gently, airy atmospheric ambient drone' },
  { name: 'amb-fire',  secs: 18, loop: true,  text: 'warm crackling fireplace, cozy soft fire ambience' },
  { name: 'amb-storm', secs: 12, loop: false, text: 'heavy storm at sea, pouring rain and rolling thunder, howling wind' },
  // one-shot hits
  { name: 'thunder',        secs: 4, loop: false, text: 'a single loud dramatic thunderclap with a deep rumble' },
  { name: 'door-open',      secs: 4, loop: false, text: 'an old heavy wooden door slowly creaking open' },
  { name: 'door-close',     secs: 3, loop: false, text: 'a wooden door closing gently with a soft latch click' },
  { name: 'footsteps-wood', secs: 5, loop: false, text: 'slow soft footsteps walking on creaking old wooden floorboards' },
  { name: 'furniture',      secs: 4, loop: false, text: 'an old wooden chair creaking as someone sits down, wood furniture' },
  { name: 'ribbon',         secs: 4, loop: false, text: 'hands gently setting down a small gift box, soft paper and satin ribbon rustle' },
  { name: 'waves-dock',     secs: 6, loop: false, text: 'sea waves gently lapping against old wooden dock posts' },
];

for (const it of items) {
  const f = `sfx/${it.name}.mp3`;
  if (fs.existsSync(f)) { console.log('skip', it.name); continue; }
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text: it.text, duration_seconds: it.secs, prompt_influence: 0.5, loop: !!it.loop }),
    });
    if (!r.ok) { console.error(it.name, 'failed', r.status, (await r.text()).slice(0, 200)); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(f, buf);
    console.log(`OK ${it.name} ${(buf.length/1024).toFixed(0)}KB`);
  } catch (e) { console.error(it.name, 'error', e.message); }
}
console.log('SFX DONE');
