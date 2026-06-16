// Restore all gitignored media for this Ep20 project:
//  1. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  2. Player stills copied from the repo's content/images library
// This episode is IMAGE-BASED (Ken-Burns motion on stills) — there are no
// generated video clips, so there is no assets-urls.json / Higgsfield fetch.
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  // README music plan: "Crossing the Chasm", "Desert City", "Five Armies", "Invariance"
  'music/cue-tense.mp3':  'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Crossing%20the%20Chasm.mp3',
  'music/cue-epic.mp3':   'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-andes.mp3':  'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Desert%20City.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const squadCopies = {
  // Iran — Team Melli (red/white/green)
  'assets/player-taremi.png':       `${repoImages}/Iran/Mehdi-Taremi.png`,
  'assets/player-jahanbakhsh.png':  `${repoImages}/Iran/Alireza-Jahanbakhsh.png`,
  'assets/player-ghoddos.png':      `${repoImages}/Iran/Saman-Ghoddos.png`,
  'assets/player-ezatolahi.png':    `${repoImages}/Iran/Saeid-Ezatolahi.png`,
  'assets/player-ghaedi.png':       `${repoImages}/Iran/Mehdi-Ghaedi.png`,
  'assets/squad/irn-1-Taremi.png':       `${repoImages}/Iran/Mehdi-Taremi.png`,
  'assets/squad/irn-2-Jahanbakhsh.png':  `${repoImages}/Iran/Alireza-Jahanbakhsh.png`,
  'assets/squad/irn-3-Ghoddos.png':      `${repoImages}/Iran/Saman-Ghoddos.png`,
  'assets/squad/irn-4-Ezatolahi.png':    `${repoImages}/Iran/Saeid-Ezatolahi.png`,
  'assets/squad/irn-5-Ghaedi.png':       `${repoImages}/Iran/Mehdi-Ghaedi.png`,
  // New Zealand — All Whites (black/white)
  'assets/player-wood.png':         `${repoImages}/New_Zealand/Chris-Wood.png`,
  'assets/player-stamenic.png':     `${repoImages}/New_Zealand/Marko-Stamenic.png`,
  'assets/player-cacace.png':       `${repoImages}/New_Zealand/Liberato-Cacace.png`,
  'assets/player-barbarouses.png':  `${repoImages}/New_Zealand/Kosta-Barbarouses.png`,
  'assets/player-singh.png':        `${repoImages}/New_Zealand/Sarpreet-Singh.png`,
  'assets/squad/nzl-1-Wood.png':         `${repoImages}/New_Zealand/Chris-Wood.png`,
  'assets/squad/nzl-2-Stamenic.png':     `${repoImages}/New_Zealand/Marko-Stamenic.png`,
  'assets/squad/nzl-3-Cacace.png':       `${repoImages}/New_Zealand/Liberato-Cacace.png`,
  'assets/squad/nzl-4-Barbarouses.png':  `${repoImages}/New_Zealand/Kosta-Barbarouses.png`,
  'assets/squad/nzl-5-Singh.png':        `${repoImages}/New_Zealand/Sarpreet-Singh.png`,
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
