// Re-download all generated Higgsfield assets from their CDN URLs.
// assets-urls.json maps local paths -> public result URLs (written at
// generation time; see jobs-manifest.json for the underlying job IDs).
import fs from 'node:fs';
import path from 'node:path';

const map = JSON.parse(fs.readFileSync('assets-urls.json', 'utf8'));
let ok = 0, fail = 0;
for (const [dest, url] of Object.entries(map)) {
  try {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) { console.log('skip (exists)', dest); ok++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    console.log('ok  ', dest);
    ok++;
  } catch (e) {
    console.error('FAIL', dest, e.message);
    fail++;
  }
}
console.log(`done: ${ok} ok, ${fail} failed`);
if (fail) process.exit(1);
