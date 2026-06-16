// Restore all gitignored media for this Ep18 project:
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
  // Belgium — the Red Devils (red/black/gold)
  'assets/player-debruyne.png':      `${repoImages}/Belgium/KevinDeBruyne.png`,
  'assets/player-lukaku.png':        `${repoImages}/Belgium/RomeluLukaku.png`,
  'assets/player-doku.png':          `${repoImages}/Belgium/JeremyDoku.png`,
  'assets/player-courtois.png':      `${repoImages}/Belgium/ThibautCourtois.png`,
  'assets/player-trossard.png':      `${repoImages}/Belgium/LeandroTrossard.png`,
  'assets/squad/bel-1-DeBruyne.png':     `${repoImages}/Belgium/KevinDeBruyne.png`,
  'assets/squad/bel-2-Lukaku.png':       `${repoImages}/Belgium/RomeluLukaku.png`,
  'assets/squad/bel-3-Doku.png':         `${repoImages}/Belgium/JeremyDoku.png`,
  'assets/squad/bel-4-Courtois.png':     `${repoImages}/Belgium/ThibautCourtois.png`,
  'assets/squad/bel-5-Trossard.png':     `${repoImages}/Belgium/LeandroTrossard.png`,
  // Egypt — the Pharaohs (red/white/black)
  'assets/player-salah.png':         `${repoImages}/Egypt/MohamedSalah.png`,
  'assets/player-marmoush.png':      `${repoImages}/Egypt/OmarMarmoush.png`,
  'assets/player-trezeguet.png':     `${repoImages}/Egypt/Trezeguet.png`,
  'assets/player-elshenawy.png':     `${repoImages}/Egypt/MohamedElShenawy.png`,
  'assets/player-abdelkarim.png':    `${repoImages}/Egypt/HamzaAbdelkarim.png`,
  'assets/squad/egy-1-Salah.png':        `${repoImages}/Egypt/MohamedSalah.png`,
  'assets/squad/egy-2-Marmoush.png':     `${repoImages}/Egypt/OmarMarmoush.png`,
  'assets/squad/egy-3-Trezeguet.png':    `${repoImages}/Egypt/Trezeguet.png`,
  'assets/squad/egy-4-ElShenawy.png':    `${repoImages}/Egypt/MohamedElShenawy.png`,
  'assets/squad/egy-5-Abdelkarim.png':   `${repoImages}/Egypt/HamzaAbdelkarim.png`,
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
