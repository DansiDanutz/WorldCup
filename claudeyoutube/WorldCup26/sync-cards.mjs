// Rebuild images/cards/ from the app's real Legend Card art.
//
// The timeline (clips.json -> CardShowcase / CardWall / PhoneMock / CardDrift)
// advertises the actual cards from worldcup26.world. Those PNGs live in the app
// at public/legend-cards/ and are NOT duplicated into git a second time here -
// images/cards/ is a generated working copy and stays gitignored.
//
// cards-manifest.json is the checked-in provenance map:
//   "<local name in images/cards>": "<subfolder>/<file in public/legend-cards>"
// so a fresh clone can reproduce the render exactly.
//
//   node sync-cards.mjs           # copy the cards
//   node sync-cards.mjs --check   # verify only, non-zero exit if anything is missing
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '../../public/legend-cards');
const DEST = path.join(HERE, 'images/cards');
const CHECK = process.argv.includes('--check');

const manifest = JSON.parse(fs.readFileSync(path.join(HERE, 'cards-manifest.json'), 'utf8'));
const entries = Object.entries(manifest);

const missingSource = entries.filter(([, from]) => !fs.existsSync(path.join(SRC, from)));
if (missingSource.length) {
  console.error(`${missingSource.length} card(s) missing from ${SRC}:`);
  for (const [to, from] of missingSource) console.error(`  ${from}  (needed as ${to})`);
  process.exit(1);
}

if (CHECK) {
  const absent = entries.filter(([to]) => !fs.existsSync(path.join(DEST, to)));
  if (absent.length) {
    console.error(`${absent.length} card(s) not yet synced into images/cards - run: node sync-cards.mjs`);
    process.exit(1);
  }
  console.log(`OK - all ${entries.length} legend cards present in images/cards/`);
  process.exit(0);
}

fs.mkdirSync(DEST, { recursive: true });
let copied = 0;
for (const [to, from] of entries) {
  fs.copyFileSync(path.join(SRC, from), path.join(DEST, to));
  copied++;
}
console.log(`synced ${copied} legend cards -> ${path.relative(process.cwd(), DEST)}`);
