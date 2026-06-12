// Restore all gitignored media for this project:
//  1. Higgsfield-generated clips/images from assets-urls.json (CDN URLs)
//  2. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  3. Squad montage stills copied from the repo's content/images library
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  ...JSON.parse(fs.readFileSync('assets-urls.json', 'utf8')),
  'music/cue-tense.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Achilles.mp3',
  'music/cue-epic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const squadCopies = {
  'assets/squad/kor-1-Son-Heung-min.png': `${repoImages}/South_Korea/Son-Heung-min.png`,
  'assets/squad/kor-2-Kim-Min-jae.png': `${repoImages}/South_Korea/Kim-Min-jae.png`,
  'assets/squad/kor-3-Lee-Kang-in.png': `${repoImages}/South_Korea/Lee-Kang-in.png`,
  'assets/squad/kor-4-Hwang-Hee-chan.png': `${repoImages}/South_Korea/Hwang-Hee-chan.png`,
  'assets/squad/kor-5-Hwang-In-beom.png': `${repoImages}/South_Korea/Hwang-In-beom.png`,
  'assets/squad/cze-1-Patrik-Schick.png': `${repoImages}/Czech_Republic/Patrik-Schick.png`,
  'assets/squad/cze-2-Tomas-Soucek.png': `${repoImages}/Czech_Republic/Tomas-Soucek.png`,
  'assets/squad/cze-3-Adam-Hlozek.png': `${repoImages}/Czech_Republic/Adam-Hlozek.png`,
  'assets/squad/cze-4-Vladimir-Coufal.png': `${repoImages}/Czech_Republic/Vladimir-Coufal.png`,
  'assets/squad/cze-5-Jindrich-Stanek.png': `${repoImages}/Czech_Republic/Jindrich-Stanek.png`,
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
