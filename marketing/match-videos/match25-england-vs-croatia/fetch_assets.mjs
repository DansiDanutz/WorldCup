// Restore all gitignored media for this Ep25 project:
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
  // England — the Three Lions (white / navy / red)
  'assets/player-kane.png':         `${repoImages}/England/Harry-Kane.png`,
  'assets/player-bellingham.png':   `${repoImages}/England/Jude-Bellingham.png`,
  'assets/player-saka.png':         `${repoImages}/England/Bukayo-Saka.png`,
  'assets/player-foden.png':        `${repoImages}/England/Phil-Foden.png`,
  'assets/player-rice.png':         `${repoImages}/England/Declan-Rice.png`,
  'assets/squad/eng-1-Bellingham.png': `${repoImages}/England/Jude-Bellingham.png`,
  'assets/squad/eng-2-Kane.png':       `${repoImages}/England/Harry-Kane.png`,
  'assets/squad/eng-3-Saka.png':       `${repoImages}/England/Bukayo-Saka.png`,
  'assets/squad/eng-4-Foden.png':      `${repoImages}/England/Phil-Foden.png`,
  'assets/squad/eng-5-Rice.png':       `${repoImages}/England/Declan-Rice.png`,
  // Croatia — Vatreni (red / white checkerboard / blue)
  'assets/player-modric.png':       `${repoImages}/Croatia/Luka-Modric.png`,
  'assets/player-gvardiol.png':     `${repoImages}/Croatia/Josko-Gvardiol.png`,
  'assets/player-kovacic.png':      `${repoImages}/Croatia/Mateo-Kovacic.png`,
  'assets/player-kramaric.png':     `${repoImages}/Croatia/Andrej-Kramaric.png`,
  'assets/player-livakovic.png':    `${repoImages}/Croatia/Dominik-Livakovic.png`,
  'assets/squad/cro-1-Modric.png':     `${repoImages}/Croatia/Luka-Modric.png`,
  'assets/squad/cro-2-Gvardiol.png':   `${repoImages}/Croatia/Josko-Gvardiol.png`,
  'assets/squad/cro-3-Kovacic.png':    `${repoImages}/Croatia/Mateo-Kovacic.png`,
  'assets/squad/cro-4-Kramaric.png':   `${repoImages}/Croatia/Andrej-Kramaric.png`,
  'assets/squad/cro-5-Livakovic.png':  `${repoImages}/Croatia/Dominik-Livakovic.png`,
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
