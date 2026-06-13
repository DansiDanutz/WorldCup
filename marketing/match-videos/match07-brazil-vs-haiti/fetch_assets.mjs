// Restore all gitignored media for this project:
//  1. Higgsfield-generated clips/images from assets-urls.json (CDN URLs)
//  2. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  3. Squad montage stills + player clips copied from the repo's content library
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  ...JSON.parse(fs.readFileSync('assets-urls.json', 'utf8')),
  'music/cue-drums.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Drums%20of%20the%20Deep.mp3',
  'music/cue-samba.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Samba%20Isobel.mp3',
  'music/cue-epic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const repoVideos = '../../../content/videos';
const squadCopies = {
  'assets/squad/bra-1-Vinicius-Junior.png': `${repoImages}/Brazil/Vinicius-Junior.png`,
  'assets/squad/bra-2-Neymar.png': `${repoImages}/Brazil/Neymar.png`,
  'assets/squad/bra-3-Raphinha.png': `${repoImages}/Brazil/Raphinha.png`,
  'assets/squad/bra-4-Bruno-Guimaraes.png': `${repoImages}/Brazil/Bruno-Guimaraes.png`,
  'assets/squad/bra-5-Alisson.png': `${repoImages}/Brazil/Alisson.png`,
  'assets/squad/hai-1-Duckens-Nazon.png': `${repoImages}/Haiti/Duckens-Nazon.png`,
  'assets/squad/hai-2-Derrick-Etienne-Jr.png': `${repoImages}/Haiti/Derrick-Etienne-Jr.png`,
  'assets/squad/hai-3-Johny-Placide.png': `${repoImages}/Haiti/Johny-Placide.png`,
  'assets/squad/hai-4-Carlens-Arcus.png': `${repoImages}/Haiti/Carlens-Arcus.png`,
  'assets/squad/hai-5-Bryan-Alceus.png': `${repoImages}/Haiti/Bryan-Alceus.png`,
  'assets/player-vini.mp4': `${repoVideos}/Brazil/Vinicius-Junior.mp4`,
  'assets/player-neymar.mp4': `${repoVideos}/Brazil/Neymar.mp4`,
  'assets/player-raphinha.mp4': `${repoVideos}/Brazil/Raphinha.mp4`,
  'assets/player-bruno.mp4': `${repoVideos}/Brazil/Bruno-Guimaraes.mp4`,
  'assets/player-alisson.mp4': `${repoVideos}/Brazil/Alisson.mp4`,
  'assets/lib-messi.mp4': `${repoVideos}/Argentina/Lionel-Messi.mp4`,
  'assets/lib-son.mp4': `${repoVideos}/South_Korea/Son-Heung-min.mp4`,
  // crowd/recap clips re-downloadable from the source episodes' assets-urls.json
  'assets/fan-bra-euphoric.mp4': '../match05-brazil-vs-morocco/assets/fan-bra-euphoric.mp4',
  'assets/fan-bra-anxious.mp4': '../match05-brazil-vs-morocco/assets/fan-bra-anxious.mp4',
  'assets/stadium-wc.mp4': '../match05-brazil-vs-morocco/assets/stadium-wc.mp4',
  'assets/lib-ep6-joy.mp4': '../match06-argentina-vs-algeria/assets/fan-arg-joy.mp4',
};

let ok = 0, fail = 0;
for (const [dest, url] of Object.entries(downloads)) {
  try {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) { ok++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    console.log('ok  ', dest);
    ok++;
  } catch (e) { console.error('FAIL', dest, e.message); fail++; }
}
for (const [dest, src] of Object.entries(squadCopies)) {
  try {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) { ok++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log('copy', dest);
    ok++;
  } catch (e) { console.error('FAIL', dest, e.message); fail++; }
}
console.log(`done: ${ok} ok, ${fail} failed`);
if (fail) process.exit(1);
