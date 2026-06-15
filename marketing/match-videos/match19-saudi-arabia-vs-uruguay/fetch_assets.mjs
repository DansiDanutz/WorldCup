// Restore all gitignored media for this Ep19 project:
//  1. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  2. Player stills copied from the repo's content/images library
// This episode is IMAGE-BASED (Ken-Burns motion on stills) — there are no
// generated video clips, so there is no assets-urls.json / Higgsfield fetch.
// Saudi Arabia (Green Falcons) vs Uruguay (La Celeste).
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  // README music plan: "Crossing the Chasm", "Five Armies", "Desert City", "Invariance"
  'music/cue-tense.mp3':  'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Crossing%20the%20Chasm.mp3',
  'music/cue-epic.mp3':   'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-desert.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Desert%20City.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const squadCopies = {
  // Saudi Arabia — the Green Falcons (green/white)
  'assets/player-aldawsari.png':     `${repoImages}/Saudi_Arabia/Salem-Al-Dawsari.png`,
  'assets/player-alburaikan.png':    `${repoImages}/Saudi_Arabia/Firas-Al-Buraikan.png`,
  'assets/player-alfaraj.png':       `${repoImages}/Saudi_Arabia/Salman-Al-Faraj.png`,
  'assets/player-alowais.png':       `${repoImages}/Saudi_Arabia/Mohammed-Al-Owais.png`,
  'assets/player-alshahrani.png':    `${repoImages}/Saudi_Arabia/Yasser-Al-Shahrani.png`,
  'assets/squad/ksa-1-AlDawsari.png':   `${repoImages}/Saudi_Arabia/Salem-Al-Dawsari.png`,
  'assets/squad/ksa-2-AlBuraikan.png':  `${repoImages}/Saudi_Arabia/Firas-Al-Buraikan.png`,
  'assets/squad/ksa-3-AlFaraj.png':     `${repoImages}/Saudi_Arabia/Salman-Al-Faraj.png`,
  'assets/squad/ksa-4-AlOwais.png':     `${repoImages}/Saudi_Arabia/Mohammed-Al-Owais.png`,
  'assets/squad/ksa-5-AlShahrani.png':  `${repoImages}/Saudi_Arabia/Yasser-Al-Shahrani.png`,
  // Uruguay — La Celeste (sky blue/navy)
  'assets/player-valverde.png':      `${repoImages}/Uruguay/Federico-Valverde.png`,
  'assets/player-nunez.png':         `${repoImages}/Uruguay/Darwin-Nunez.png`,
  'assets/player-araujo.png':        `${repoImages}/Uruguay/Ronald-Araujo.png`,
  'assets/player-gimenez.png':       `${repoImages}/Uruguay/Jose-Gimenez.png`,
  'assets/player-arrascaeta.png':    `${repoImages}/Uruguay/Giorgian-de-Arrascaeta.png`,
  'assets/squad/uru-1-Valverde.png':    `${repoImages}/Uruguay/Federico-Valverde.png`,
  'assets/squad/uru-2-Nunez.png':       `${repoImages}/Uruguay/Darwin-Nunez.png`,
  'assets/squad/uru-3-Araujo.png':      `${repoImages}/Uruguay/Ronald-Araujo.png`,
  'assets/squad/uru-4-Gimenez.png':     `${repoImages}/Uruguay/Jose-Gimenez.png`,
  'assets/squad/uru-5-Arrascaeta.png':  `${repoImages}/Uruguay/Giorgian-de-Arrascaeta.png`,
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
