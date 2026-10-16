// fetch.mjs — download any library clip that isn't on disk yet. The clips are
// paid Higgsfield generations we already own; the MP4s are too big for git, so
// clips.json keeps each one's CDN URL and this restores them in a fresh checkout.
//   node marketing/deep-dives/library/fetch.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const lib = JSON.parse(fs.readFileSync(path.join(HERE, 'clips.json'), 'utf8'));
let got = 0, missing = 0;
for (const [alias, c] of Object.entries(lib)) {
  const file = path.join(ROOT, c.src);
  if (fs.existsSync(file)) continue;
  if (!c.url) { console.error(`missing ${c.src} (repo file, no URL to fetch)`); missing++; continue; }
  const res = await fetch(c.url);
  if (!res.ok) { console.error(`${alias}: ${res.status}`); missing++; continue; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  got++;
}
console.log(`library: ${Object.keys(lib).length} clips, fetched ${got}, missing ${missing}`);
process.exit(missing ? 1 : 0);
