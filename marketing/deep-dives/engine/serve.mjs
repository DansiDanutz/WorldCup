// Range-capable static server. python3 -m http.server ignores Range headers,
// which makes Chromium treat <video> sources as unseekable (seekable=[0,0]) -
// every currentTime seek clamps to 0 and clips render frozen at frame 0.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = +(process.env.PORT || 8094);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.jsx': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.css': 'text/css' };

const ROOT = path.resolve(process.cwd());
const ALLOWED = ['/marketing/deep-dives/', '/public/legend-cards/', '/content/videos/'];

http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400); return res.end(); // malformed percent-escape must not kill the render server
  }
  const clean = path.posix.normalize('/' + pathname);
  // Serve only what a render needs. The document root is the repository, so
  // everything else (.env files, keys, source) must stay unreachable.
  if (!ALLOWED.some((prefix) => clean.startsWith(prefix)) || clean.split('/').some((seg) => seg.startsWith('.'))) {
    res.writeHead(404); return res.end();
  }
  const f = path.resolve(ROOT, '.' + clean);
  // Exact-root containment: a bare prefix check would also accept sibling dirs
  // (e.g. ROOT + "-evil"). Symlinked assets still work — the check constrains
  // the requested URL path, not the symlink target.
  if ((f !== ROOT && !f.startsWith(ROOT + path.sep)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end();
  }
  const size = fs.statSync(f).size;
  const type = TYPES[path.extname(f)] || 'application/octet-stream';
  const m = (req.headers.range || '').match(/bytes=(\d*)-(\d*)/);
  if (m) {
    const s = m[1] ? +m[1] : 0;
    const e = Math.min(m[2] ? +m[2] : size - 1, size - 1);
    // unsatisfiable range (e.g. bytes=N- on an N-byte file) would produce a
    // negative Content-Length, which Node rejects by killing the response —
    // answer 416 instead so a probing client can't take the render server down
    if (s >= size || s > e) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end();
    }
    res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${s}-${e}/${size}`, 'Content-Length': e - s + 1 });
    fs.createReadStream(f, { start: s, end: e }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
    fs.createReadStream(f).pipe(res);
  }
}).listen(PORT, '127.0.0.1', () => console.log('range-capable server on 127.0.0.1:' + PORT));
