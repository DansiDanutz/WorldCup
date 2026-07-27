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

http.createServer((req, res) => {
  const f = path.resolve(ROOT, '.' + path.posix.normalize('/' + decodeURIComponent(new URL(req.url, 'http://x').pathname)));
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
    res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${s}-${e}/${size}`, 'Content-Length': e - s + 1 });
    fs.createReadStream(f, { start: s, end: e }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
    fs.createReadStream(f).pipe(res);
  }
}).listen(PORT, () => console.log('range-capable server on :' + PORT));
