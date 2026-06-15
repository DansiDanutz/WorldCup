// Restore all gitignored media for this Ep17 project:
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
  // Spain — La Roja: red / gold
  'assets/player-yamal.png':        `${repoImages}/Spain/Lamine-Yamal.png`,
  'assets/player-rodri.png':        `${repoImages}/Spain/Rodri.png`,
  'assets/player-pedri.png':        `${repoImages}/Spain/Pedri.png`,
  'assets/player-nico.png':         `${repoImages}/Spain/Nico-Williams.png`,
  'assets/player-carvajal.png':     `${repoImages}/Spain/Dani-Carvajal.png`,
  'assets/squad/esp-1-Yamal.png':       `${repoImages}/Spain/Lamine-Yamal.png`,
  'assets/squad/esp-2-Rodri.png':       `${repoImages}/Spain/Rodri.png`,
  'assets/squad/esp-3-Pedri.png':       `${repoImages}/Spain/Pedri.png`,
  'assets/squad/esp-4-Nico.png':        `${repoImages}/Spain/Nico-Williams.png`,
  'assets/squad/esp-5-Carvajal.png':    `${repoImages}/Spain/Dani-Carvajal.png`,
  // Cape Verde — Tubarões Azuis (Blue Sharks): blue / white / red
  'assets/player-mendes.png':       `${repoImages}/Cape_Verde/Ryan-Mendes.png`,
  'assets/player-garry.png':        `${repoImages}/Cape_Verde/Garry-Rodrigues.png`,
  'assets/player-logan.png':        `${repoImages}/Cape_Verde/Logan-Costa.png`,
  'assets/player-jamiro.png':       `${repoImages}/Cape_Verde/Jamiro-Monteiro.png`,
  'assets/player-lopes.png':        `${repoImages}/Cape_Verde/Roberto-Lopes.png`,
  'assets/squad/cpv-1-Mendes.png':      `${repoImages}/Cape_Verde/Ryan-Mendes.png`,
  'assets/squad/cpv-2-Garry.png':       `${repoImages}/Cape_Verde/Garry-Rodrigues.png`,
  'assets/squad/cpv-3-Logan.png':       `${repoImages}/Cape_Verde/Logan-Costa.png`,
  'assets/squad/cpv-4-Jamiro.png':      `${repoImages}/Cape_Verde/Jamiro-Monteiro.png`,
  'assets/squad/cpv-5-Lopes.png':       `${repoImages}/Cape_Verde/Roberto-Lopes.png`,
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
