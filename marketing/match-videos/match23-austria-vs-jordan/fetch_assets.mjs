// Restore all gitignored media for this Ep23 project:
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
  // Austria — heirs of the Wunderteam (red / white)
  'assets/player-alaba.png':        `${repoImages}/Austria/David-Alaba.png`,
  'assets/player-sabitzer.png':     `${repoImages}/Austria/Marcel-Sabitzer.png`,
  'assets/player-laimer.png':       `${repoImages}/Austria/Konrad-Laimer.png`,
  'assets/player-arnautovic.png':   `${repoImages}/Austria/Marko-Arnautovic.png`,
  'assets/player-baumgartner.png':  `${repoImages}/Austria/Christoph-Baumgartner.png`,
  'assets/squad/aut-1-Alaba.png':        `${repoImages}/Austria/David-Alaba.png`,
  'assets/squad/aut-2-Sabitzer.png':     `${repoImages}/Austria/Marcel-Sabitzer.png`,
  'assets/squad/aut-3-Laimer.png':       `${repoImages}/Austria/Konrad-Laimer.png`,
  'assets/squad/aut-4-Arnautovic.png':   `${repoImages}/Austria/Marko-Arnautovic.png`,
  'assets/squad/aut-5-Baumgartner.png':  `${repoImages}/Austria/Christoph-Baumgartner.png`,
  // Jordan — Al-Nashama, the Brave Ones (red / black / green / white)
  'assets/player-tamari.png':       `${repoImages}/Jordan/Musa-Al-Taamari.png`,
  'assets/player-naimat.png':       `${repoImages}/Jordan/Yazan-Al-Naimat.png`,
  'assets/player-dardour.png':      `${repoImages}/Jordan/Hamza-Al-Dardour.png`,
  'assets/player-rawabdeh.png':     `${repoImages}/Jordan/Noor-Al-Rawabdeh.png`,
  'assets/player-arab.png':         `${repoImages}/Jordan/Yazan-Al-Arab.png`,
  'assets/squad/jor-1-Tamari.png':       `${repoImages}/Jordan/Musa-Al-Taamari.png`,
  'assets/squad/jor-2-Naimat.png':       `${repoImages}/Jordan/Yazan-Al-Naimat.png`,
  'assets/squad/jor-3-Dardour.png':      `${repoImages}/Jordan/Hamza-Al-Dardour.png`,
  'assets/squad/jor-4-Rawabdeh.png':     `${repoImages}/Jordan/Noor-Al-Rawabdeh.png`,
  'assets/squad/jor-5-Arab.png':         `${repoImages}/Jordan/Yazan-Al-Arab.png`,
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
