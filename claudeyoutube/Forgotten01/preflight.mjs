// Preflight gate (worldcup-documentary skill §4). A render that starts red is a process failure.
import fs from 'node:fs';
const f = JSON.parse(fs.readFileSync('film.json', 'utf8'));
let bad = 0; const fail = (m) => { console.error('  FAIL ' + m); bad++; };

// 1. every second covered — no black
const cov = new Array(Math.ceil(f.duration)).fill(0);
for (const g of f.graphics) for (let s = Math.floor(g.at); s < Math.min(cov.length, Math.ceil(g.at + g.dur)); s++) cov[s]++;
const gaps = []; let st = null;
cov.forEach((v, s) => { if (!v && st === null) st = s; if (v && st !== null) { gaps.push(`${st}-${s}`); st = null; } });
if (st !== null) gaps.push(`${st}-${cov.length}`);
gaps.length ? fail(`uncovered seconds: ${gaps.join(', ')}`) : console.log('  ok  no uncovered seconds');

// 2. no media reused (rule #11 no-repeat)
const all = f.chapters.flatMap(c => c.media.map(m => m.src));
const dup = all.filter((s, i) => all.indexOf(s) !== i);
dup.length ? fail(`media reused: ${[...new Set(dup)].join(', ')}`) : console.log(`  ok  ${all.length} media, each used once`);

// 3. every referenced file resolves
const refs = new Set([...all, ...f.vo.map(v => v.src), ...f.chapters.map(c => c.card),
  ...f.sfx.hits.map(h => h.src), ...f.music.cues.map(c => c.src),
  ...f.graphics.flatMap(g => g.srcs || [])]);
const miss = [...refs].filter(p => !fs.existsSync(p));
miss.length ? fail(`missing files (${miss.length}): ${miss.slice(0, 5).join(', ')}`) : console.log(`  ok  all ${refs.size} referenced files exist`);

// 4. VO sits inside its chapter and never overlaps the next
f.vo.forEach((v, i) => {
  const c = f.chapters[i];
  if (v.at < c.at || v.at + v.dur > c.at + c.dur + 0.01) fail(`VO ${i + 1} outside chapter window`);
  const nxt = f.vo[i + 1];
  if (nxt && v.at + v.dur > nxt.at) fail(`VO ${i + 1} overlaps VO ${i + 2}`);
});
console.log('  ok  VO slots inside chapters, no overlap');

// 5. rule #10 — on-screen text is labels only, never sentences
const text = [...f.graphics.filter(g => g.text).map(g => g.text),
              ...f.graphics.filter(g => g.label).map(g => g.label),
              ...f.chapters.flatMap(c => [c.label, c.meta])];
const sentences = text.filter(s => s.split(/\s+/).length > 4);
sentences.length ? fail(`on-screen text over 4 words: ${sentences.join(' | ')}`) : console.log(`  ok  ${text.length} on-screen strings, all <=4 words`);

// 6. monetization — no betting/prize wording
const blob = JSON.stringify(f).toLowerCase();
const banned = ['odds', 'bet ', 'betting', 'wager', 'bookmaker', 'jackpot', 'prize money', 'cash prize'];
const found = banned.filter(w => blob.includes(w));
found.length ? fail(`banned wording: ${found.join(', ')}`) : console.log('  ok  no betting/prize wording');

console.log(bad ? `\nPREFLIGHT RED — ${bad} failure(s)` : '\nPREFLIGHT GREEN');
process.exit(bad ? 1 : 0);
