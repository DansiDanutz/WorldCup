// WorldCup26 Legends — batch episode-thumbnail generator (1280x720 JPG).
//
// Renders one thumbnail per episode from thumbnails.config.json, fusing the
// proven episode formula (star face + <=4-word hook) with the best-performing
// app thumbnails (Pick 3 + climb the leaderboard, shown on a phone).
//
// Usage:
//   npm install                      # once (playwright; chromium is cached)
//   node gen-thumbnails.mjs          # render all -> ./out/epNN.jpg
//   node gen-thumbnails.mjs --install   # also copy into each episode's thumbnail.jpg
//   node gen-thumbnails.mjs --ep 13     # render a single episode
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve('../../..');
const OUT = path.resolve('out');
const ARG_INSTALL = process.argv.includes('--install');
const ARG_EP = (() => { const i = process.argv.indexOf('--ep'); return i > -1 ? Number(process.argv[i + 1]) : null; })();

// Team brand swatches (leaderboard rows + name tag).
const COLORS = {
  MEX: '#006847', RSA: '#007a4d', KOR: '#c8102e', CZE: '#11457e', CAN: '#d52b1e',
  BIH: '#002395', USA: '#1b3a8f', PAR: '#d52b1e', BRA: '#1f9d55', MAR: '#c1272d',
  ARG: '#75aadb', ALG: '#0a7d3e', HAI: '#00209f', ENG: '#cf142b', GHA: '#006b3f',
  QAT: '#8a1538', SUI: '#d52b1e', SCO: '#005eb8', AUS: '#00843d', TUR: '#e30a17',
  GER: '#e6b400', CUR: '#1d4ed8', NED: '#f36c21', JPN: '#c0163a',
};

const dataUri = (p) => {
  const abs = path.resolve(REPO, p);
  const ext = path.extname(abs).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
};

const PTS = ['21', '18', '15'];
const rowHtml = (code, pts, up) => `
  <div class="row${up ? ' up' : ''}">
    <span class="rk">${up ? 1 : (pts === '18' ? 2 : 3)}</span>
    <span class="sw" style="background:${COLORS[code] || '#888'}"></span>
    <span class="cd">${code}</span>
    <span class="pt">${pts}</span>
    ${up ? '<span class="ar">▲</span>' : ''}
  </div>`;

function buildHtml(c) {
  const accent = COLORS[c.face] || '#c9942e';
  const bg = dataUri('public/leaderboard-bg.png');
  const player = dataUri(c.img);
  const rows = [
    rowHtml(c.face, PTS[0], true),
    rowHtml(c.away, PTS[1], false),
    rowHtml(c.marquee, PTS[2], false),
  ].join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Arial Black','DejaVu Sans',sans-serif}
  #c{position:relative;width:1280px;height:720px;overflow:hidden;background:#08120e}
  #bg{position:absolute;inset:0;background:url('${bg}') center/cover;filter:brightness(0.5) saturate(1.1)}
  #bgtint{position:absolute;inset:0;background:linear-gradient(105deg,rgba(6,30,22,.92) 38%,rgba(6,30,22,.35) 62%,rgba(6,30,22,.7))}
  #player{position:absolute;left:0;top:0;height:720px;width:680px;
    background:url('${player}') top center/cover;
    -webkit-mask-image:linear-gradient(to right,#000 64%,transparent 100%);mask-image:linear-gradient(to right,#000 64%,transparent 100%)}
  #pshade{position:absolute;left:0;bottom:0;width:680px;height:320px;background:linear-gradient(to top,rgba(4,18,13,.95),transparent)}
  #head{position:absolute;top:34px;left:44px;width:760px;font-size:116px;line-height:.92;font-weight:900;color:#FFD24A;
    text-transform:uppercase;letter-spacing:-1px;-webkit-text-stroke:7px #06140e;paint-order:stroke fill;text-shadow:0 8px 30px rgba(0,0,0,.7)}
  #name{position:absolute;left:46px;bottom:104px;display:flex;align-items:center;gap:14px}
  #name .sw{width:30px;height:30px;border-radius:6px;background:${accent};border:3px solid #fff}
  #name .nm{font-size:46px;font-weight:900;color:#fff;-webkit-text-stroke:4px #06140e;paint-order:stroke fill}
  #sub{position:absolute;left:46px;bottom:60px;font-size:24px;font-weight:800;color:#7fe3c0;letter-spacing:1px}
  #phone{position:absolute;right:54px;top:74px;width:312px;height:566px;border-radius:42px;background:#0a1a14;border:9px solid #16302a;
    box-shadow:0 26px 60px rgba(0,0,0,.6);transform:rotate(4deg);overflow:hidden}
  #notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:120px;height:22px;background:#16302a;border-radius:14px;z-index:2}
  #ph-hd{padding:40px 20px 12px;text-align:center}
  #ph-hd .t{font-size:30px;font-weight:900;color:#37d39a;letter-spacing:1px}
  #ph-hd .s{font-size:18px;font-weight:800;color:#9fb7af;margin-top:2px}
  .row{display:flex;align-items:center;gap:10px;margin:10px 16px;padding:12px;border-radius:14px;background:#0f231b}
  .row.up{background:linear-gradient(90deg,#15512f,#1c7a45);box-shadow:0 0 0 3px rgba(55,211,154,.5)}
  .row .rk{font-size:26px;font-weight:900;color:#FFD24A;width:30px}
  .row .sw{width:26px;height:26px;border-radius:6px;border:2px solid #fff}
  .row .cd{font-size:26px;font-weight:900;color:#fff;flex:1}
  .row .pt{font-size:24px;font-weight:900;color:#cfe}
  .row .ar{font-size:24px;color:#9cffd0}
  #climb{margin:14px 16px 0;text-align:center;font-size:23px;font-weight:900;color:#06140e;background:#FFD24A;border-radius:12px;padding:10px}
  #pill{position:absolute;right:54px;bottom:30px;background:#FFD24A;color:#06140e;font-size:30px;font-weight:900;padding:12px 22px;border-radius:999px;box-shadow:0 10px 26px rgba(0,0,0,.5);transform:rotate(4deg)}
  #url{position:absolute;left:46px;bottom:18px;font-size:22px;font-weight:900;color:#fff;opacity:.92}
  #badge{position:absolute;top:30px;right:54px;background:${accent};color:#fff;font-size:20px;font-weight:900;padding:8px 16px;border-radius:8px;transform:rotate(4deg);z-index:3;letter-spacing:1px}
</style></head><body>
  <div id="c">
    <div id="bg"></div><div id="bgtint"></div>
    <div id="player"></div><div id="pshade"></div>
    <div id="head">${c.hook}</div>
    <div id="name"><span class="sw"></span><span class="nm">${c.name}</span></div>
    <div id="sub">${c.sub}</div>
    <div id="badge">EP ${c.ep}</div>
    <div id="phone"><div id="notch"></div>
      <div id="ph-hd"><div class="t">LEADERBOARD</div><div class="s">MY 3 TEAMS</div></div>
      ${rows}
      <div id="climb">▲ CLIMB TO #1</div>
    </div>
    <div id="pill">PICK 3 · FREE</div>
    <div id="url">worldcup26.world</div>
  </div>
</body></html>`;
}

const { episodes } = JSON.parse(fs.readFileSync('thumbnails.config.json', 'utf8'));
const list = ARG_EP ? episodes.filter((e) => e.ep === ARG_EP) : episodes;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const c of list) {
  await page.setContent(buildHtml(c), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(150);
  const outFile = path.join(OUT, `ep${String(c.ep).padStart(2, '0')}.jpg`);
  await page.locator('#c').screenshot({ path: outFile, type: 'jpeg', quality: 90 });
  console.log('ok ', outFile);
  if (ARG_INSTALL && c.dir) {
    const dest = path.resolve(REPO, 'marketing/match-videos', c.dir, 'thumbnail.jpg');
    fs.copyFileSync(outFile, dest);
    console.log('   -> installed', dest);
  }
}
await browser.close();
console.log('DONE', list.length, 'thumbnails');
