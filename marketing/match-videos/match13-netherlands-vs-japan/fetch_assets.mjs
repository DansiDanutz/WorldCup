// Restore all gitignored media for Episode 13 (Netherlands vs Japan):
//  1. Higgsfield-generated player/scene/crowd clips from assets-urls.json (CDN URLs)
//  2. Music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0)
//  3. Recap / app-montage library clips copied from the repo's content/videos
import fs from 'node:fs';
import path from 'node:path';

const downloads = {
  ...JSON.parse(fs.readFileSync('assets-urls.json', 'utf8')),
  // cue-desert/epic/heroic match the rest of the series; cue-anthem is the
  // shared series opener bed (grand, building) used since Ep8.
  'music/cue-anthem.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Crossing%20the%20Chasm.mp3',
  'music/cue-desert.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Desert%20City.mp3',
  'music/cue-epic.mp3':   'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3',
  'music/cue-heroic.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3',
};

const repoVideos = '../../../content/videos';
const libCopies = {
  'assets/lib-nazon.mp4': `${repoVideos}/Haiti/Duckens-Nazon.mp4`,   // Ep7 recap (Haiti)
  'assets/lib-vini.mp4':  `${repoVideos}/Brazil/Vinicius-Junior.mp4`, // Ep5/7 recap (Brazil)
  'assets/lib-messi.mp4': `${repoVideos}/Argentina/Lionel-Messi.mp4`, // app-montage legend
};

let ok = 0, fail = 0;
for (const [dest, url] of Object.entries(downloads)) {
  try {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) { ok++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1024) throw new Error('too small (' + buf.length + 'B)');
    fs.writeFileSync(dest, buf);
    console.log('ok  ', dest, (buf.length / 1024 / 1024).toFixed(2) + 'MB');
    ok++;
  } catch (e) { console.error('FAIL', dest, '<-', url, '::', e.message); fail++; }
}
for (const [dest, src] of Object.entries(libCopies)) {
  try {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) { ok++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(src)) throw new Error('missing source ' + src);
    fs.copyFileSync(src, dest);
    console.log('copy', dest);
    ok++;
  } catch (e) { console.error('FAIL', dest, '::', e.message); fail++; }
}
console.log(`\nfetch-assets: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
