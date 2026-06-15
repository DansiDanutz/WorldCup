// Restore all gitignored media for this Ep15 project:
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
  // Ivory Coast — Les Elephants (orange/white/green)
  'assets/player-kessie.png':        `${repoImages}/Ivory_Coast/Franck-Kessie.png`,
  'assets/player-adingra.png':       `${repoImages}/Ivory_Coast/Simon-Adingra.png`,
  'assets/player-diallo.png':        `${repoImages}/Ivory_Coast/Amad-Diallo.png`,
  'assets/player-diomande.png':      `${repoImages}/Ivory_Coast/Ousmane-Diomande.png`,
  'assets/player-yandiomande.png':   `${repoImages}/Ivory_Coast/Yan-Diomande.png`,
  'assets/squad/civ-1-Kessie.png':       `${repoImages}/Ivory_Coast/Franck-Kessie.png`,
  'assets/squad/civ-2-Adingra.png':      `${repoImages}/Ivory_Coast/Simon-Adingra.png`,
  'assets/squad/civ-3-Diallo.png':       `${repoImages}/Ivory_Coast/Amad-Diallo.png`,
  'assets/squad/civ-4-Diomande.png':     `${repoImages}/Ivory_Coast/Ousmane-Diomande.png`,
  'assets/squad/civ-5-YanDiomande.png':  `${repoImages}/Ivory_Coast/Yan-Diomande.png`,
  // Ecuador — La Tri (yellow/blue/red)
  'assets/player-caicedo.png':       `${repoImages}/Ecuador/MoisesCaicedo.png`,
  'assets/player-hincapie.png':      `${repoImages}/Ecuador/PieroHincapie.png`,
  'assets/player-pacho.png':         `${repoImages}/Ecuador/WillianPacho.png`,
  'assets/player-valencia.png':      `${repoImages}/Ecuador/EnnerValencia.png`,
  'assets/player-plata.png':         `${repoImages}/Ecuador/Gonzalo-Plata.png`,
  'assets/squad/ecu-1-Caicedo.png':      `${repoImages}/Ecuador/MoisesCaicedo.png`,
  'assets/squad/ecu-2-Hincapie.png':     `${repoImages}/Ecuador/PieroHincapie.png`,
  'assets/squad/ecu-3-Pacho.png':        `${repoImages}/Ecuador/WillianPacho.png`,
  'assets/squad/ecu-4-Valencia.png':     `${repoImages}/Ecuador/EnnerValencia.png`,
  'assets/squad/ecu-5-Plata.png':        `${repoImages}/Ecuador/Gonzalo-Plata.png`,
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
