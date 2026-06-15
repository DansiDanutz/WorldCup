// Restore all gitignored media for this Ep16 project:
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
  'music/cue-fire.mp3':   'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Desert%20City.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoImages = '../../../content/images';
const squadCopies = {
  // Sweden — Blagult: blue (#006aa7) / yellow (#fecc00)
  'assets/player-gyokeres.png':      `${repoImages}/Sweden/Viktor-Gyokeres.png`,
  'assets/player-isak.png':          `${repoImages}/Sweden/Alexander-Isak.png`,
  'assets/player-elanga.png':        `${repoImages}/Sweden/Anthony-Elanga.png`,
  'assets/player-bergvall.png':      `${repoImages}/Sweden/Lucas-Bergvall.png`,
  'assets/player-lindelof.png':      `${repoImages}/Sweden/Victor-Lindelof.png`,
  'assets/squad/swe-1-Gyokeres.png':  `${repoImages}/Sweden/Viktor-Gyokeres.png`,
  'assets/squad/swe-2-Isak.png':      `${repoImages}/Sweden/Alexander-Isak.png`,
  'assets/squad/swe-3-Elanga.png':    `${repoImages}/Sweden/Anthony-Elanga.png`,
  'assets/squad/swe-4-Bergvall.png':  `${repoImages}/Sweden/Lucas-Bergvall.png`,
  'assets/squad/swe-5-Lindelof.png':  `${repoImages}/Sweden/Victor-Lindelof.png`,
  // Tunisia — the Eagles of Carthage: red (#e70013) / white
  'assets/player-mejbri.png':        `${repoImages}/Tunisia/HannibalMejbri.png`,
  'assets/player-talbi.png':         `${repoImages}/Tunisia/MontassarTalbi.png`,
  'assets/player-skhiri.png':        `${repoImages}/Tunisia/EllyesSkhiri.png`,
  'assets/player-achouri.png':       `${repoImages}/Tunisia/EliasAchouri.png`,
  'assets/player-bronn.png':         `${repoImages}/Tunisia/DylanBronn.png`,
  'assets/squad/tun-1-Mejbri.png':    `${repoImages}/Tunisia/HannibalMejbri.png`,
  'assets/squad/tun-2-Talbi.png':     `${repoImages}/Tunisia/MontassarTalbi.png`,
  'assets/squad/tun-3-Skhiri.png':    `${repoImages}/Tunisia/EllyesSkhiri.png`,
  'assets/squad/tun-4-Achouri.png':   `${repoImages}/Tunisia/EliasAchouri.png`,
  'assets/squad/tun-5-Bronn.png':     `${repoImages}/Tunisia/DylanBronn.png`,
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
