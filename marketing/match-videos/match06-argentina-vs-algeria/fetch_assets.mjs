// Restore all gitignored media for this project:
//  1. Higgsfield-generated clips/images from assets-urls.json (CDN URLs)
//  2. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  3. Squad montage stills + player clips copied from the repo's content library
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  ...JSON.parse(fs.readFileSync('assets-urls.json', 'utf8')),
  'music/cue-tango.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Tango%20de%20Manzana.mp3',
  'music/cue-desert.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Desert%20City.mp3',
  'music/cue-epic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const repoVideos = '../../../content/videos';
const squadCopies = {
  'assets/squad/arg-1-Lionel-Messi.png': `${repoImages}/Argentina/Lionel-Messi.png`,
  'assets/squad/arg-2-Julian-Alvarez.png': `${repoImages}/Argentina/Julian-Alvarez.png`,
  'assets/squad/arg-3-Enzo-Fernandez.png': `${repoImages}/Argentina/Enzo-Fernandez.png`,
  'assets/squad/arg-4-Alexis-Mac-Allister.png': `${repoImages}/Argentina/Alexis-Mac-Allister.png`,
  'assets/squad/arg-5-Emiliano-Martinez.png': `${repoImages}/Argentina/Emiliano-Martinez.png`,
  'assets/squad/alg-1-Riyad-Mahrez.png': `${repoImages}/Algeria/Riyad-Mahrez.png`,
  'assets/squad/alg-2-Ismail-Bennacer.png': `${repoImages}/Algeria/Ismail-Bennacer.png`,
  'assets/squad/alg-3-Amine-Gouiri.png': `${repoImages}/Algeria/Amine-Gouiri.png`,
  'assets/squad/alg-4-Aissa-Mandi.png': `${repoImages}/Algeria/Aissa-Mandi.png`,
  'assets/squad/alg-5-Hicham-Boudaoui.png': `${repoImages}/Algeria/Hicham-Boudaoui.png`,
  'assets/player-messi.mp4': `${repoVideos}/Argentina/Lionel-Messi.mp4`,
  'assets/player-alvarez.mp4': `${repoVideos}/Argentina/Julian-Alvarez.mp4`,
  'assets/player-enzo.mp4': `${repoVideos}/Argentina/Enzo-Fernandez.mp4`,
  'assets/player-macallister.mp4': `${repoVideos}/Argentina/Alexis-Mac-Allister.mp4`,
  'assets/player-dibu.mp4': `${repoVideos}/Argentina/Emiliano-Martinez.mp4`,
  'assets/player-mahrez.mp4': `${repoVideos}/Algeria/Riyad-Mahrez.mp4`,
  'assets/player-bennacer.mp4': `${repoVideos}/Algeria/Ismail-Bennacer.mp4`,
  'assets/player-gouiri.mp4': `${repoVideos}/Algeria/Amine-Gouiri.mp4`,
  'assets/player-mandi.mp4': `${repoVideos}/Algeria/Aissa-Mandi.mp4`,
  'assets/player-boudaoui.mp4': `${repoVideos}/Algeria/Hicham-Boudaoui.mp4`,
  'assets/lib-vini.mp4': `${repoVideos}/Brazil/Vinicius-Junior.mp4`,
  'assets/lib-son.mp4': `${repoVideos}/South_Korea/Son-Heung-min.mp4`,
  // Ep5 recap visual = Ep5's Brazilian euphoric crowd (re-downloadable from Ep5's assets-urls.json)
  'assets/lib-ep5-joy.mp4': '../match05-brazil-vs-morocco/assets/fan-bra-euphoric.mp4',
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
