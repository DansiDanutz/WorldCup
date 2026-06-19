// Range-capable static server, crash-proof for long Playwright renders.
// python3 -m http.server ignores Range headers (breaks <video> seeking), and the
// naive pipe() crashes on aborted range requests (EPIPE/ECONNRESET) — Chromium
// aborts video ranges constantly while seeking, which was killing the render.
// This version guards every stream/socket error so the server never exits.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = +(process.env.PORT || 8097);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.jsx': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.css': 'text/css' };

process.on('uncaughtException', (e) => console.error('serve uncaught (ignored):', e && e.message));
process.on('unhandledRejection', () => {});

const server = http.createServer((req, res) => {
  res.on('error', () => {});
  try {
    const f = path.join(process.cwd(), decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!f.startsWith(process.cwd()) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    const size = fs.statSync(f).size;
    const type = TYPES[path.extname(f)] || 'application/octet-stream';
    const m = (req.headers.range || '').match(/bytes=(\d*)-(\d*)/);
    let stream;
    if (m) {
      const s = m[1] ? +m[1] : 0;
      const e = Math.min(m[2] ? +m[2] : size - 1, size - 1);
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${s}-${e}/${size}`, 'Content-Length': e - s + 1 });
      stream = fs.createReadStream(f, { start: s, end: e });
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
      stream = fs.createReadStream(f);
    }
    stream.on('error', () => { try { res.destroy(); } catch (_) {} });
    res.on('close', () => { try { stream.destroy(); } catch (_) {} });
    stream.pipe(res);
  } catch (_) {
    try { res.writeHead(500); res.end(); } catch (e2) {}
  }
});
server.on('clientError', (e, socket) => { try { socket.destroy(); } catch (_) {} });
server.keepAliveTimeout = 0;
server.listen(PORT, () => console.log('range-capable server on :' + PORT));
