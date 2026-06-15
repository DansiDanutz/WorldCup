// Restore all gitignored media for this Ep22 project:
//  1. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  2. Player stills copied from the repo's content/images library
// This episode is IMAGE-BASED (Ken-Burns motion on stills) — there are no
// generated video clips, so there is no assets-urls.json / Higgsfield fetch.
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  // README music plan: "Crossing the Chasm", "Five Armies", "Desert City", "Invariance"
  'music/cue-tense.mp3':  'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Crossing%20the%20Chasm.mp3',
  'music/cue-epic.mp3':   'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-andes.mp3':  'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Desert%20City.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const squadCopies = {
  // Iraq — Lions of Mesopotamia (green/white/black)
  'assets/player-iqbal.png':         `${repoImages}/Iraq/Zidane-Iqbal.png`,
  'assets/player-hussein.png':       `${repoImages}/Iraq/Aymen-Hussein.png`,
  'assets/player-hamadi.png':        `${repoImages}/Iraq/Ali-Al-Hamadi.png`,
  'assets/player-ammari.png':        `${repoImages}/Iraq/Amir-Al-Ammari.png`,
  'assets/player-sulaka.png':        `${repoImages}/Iraq/Rebin-Sulaka.png`,
  'assets/squad/irq-1-Iqbal.png':    `${repoImages}/Iraq/Zidane-Iqbal.png`,
  'assets/squad/irq-2-Hussein.png':  `${repoImages}/Iraq/Aymen-Hussein.png`,
  'assets/squad/irq-3-Hamadi.png':   `${repoImages}/Iraq/Ali-Al-Hamadi.png`,
  'assets/squad/irq-4-Ammari.png':   `${repoImages}/Iraq/Amir-Al-Ammari.png`,
  'assets/squad/irq-5-Sulaka.png':   `${repoImages}/Iraq/Rebin-Sulaka.png`,
  // Norway — the Vikings (red/navy/white)
  'assets/player-haaland.png':       `${repoImages}/Norway/Erling-Haaland.png`,
  'assets/player-odegaard.png':      `${repoImages}/Norway/Martin-Odegaard.png`,
  'assets/player-sorloth.png':       `${repoImages}/Norway/Alexander-Sorloth.png`,
  'assets/player-nusa.png':          `${repoImages}/Norway/Antonio-Nusa.png`,
  'assets/player-berge.png':         `${repoImages}/Norway/Sander-Berge.png`,
  'assets/squad/nor-1-Haaland.png':  `${repoImages}/Norway/Erling-Haaland.png`,
  'assets/squad/nor-2-Odegaard.png': `${repoImages}/Norway/Martin-Odegaard.png`,
  'assets/squad/nor-3-Sorloth.png':  `${repoImages}/Norway/Alexander-Sorloth.png`,
  'assets/squad/nor-4-Nusa.png':     `${repoImages}/Norway/Antonio-Nusa.png`,
  'assets/squad/nor-5-Berge.png':    `${repoImages}/Norway/Sander-Berge.png`,
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
