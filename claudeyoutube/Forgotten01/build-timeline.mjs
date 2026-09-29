// Computes the FORGOTTEN Vol.1 timeline and emits film.json (the single source of
// truth read by the renderer and the mux).
//
// Shape of the film:
//   cold open (music + graphics, no VO — there is no ElevenLabs key in this container)
//   10 chapters: plate + LivingCard, each carrying that legend's existing Brian VO
//   an interlude at the midpoint, then the app close (card wall + phone + CTA)
import fs from 'node:fs';
const ch = JSON.parse(fs.readFileSync('build/chapters.json', 'utf8'));
const CARD = s => `images/cards/${s}`;
const cards = fs.readdirSync('images/cards').sort();

const COLD = 58, LEAD = 6, TAIL = 9, INTERLUDE = 18, CLOSE = 82;
const CLIP = 5.04;                       // native length of every source clip
const film = { duration: 0, chapters: [], graphics: [], vo: [], sfx: { hits: [] }, music: { cues: [] } };
const G = (o) => film.graphics.push(o);
const hit = (src, at, vol = 0.5) => film.sfx.hits.push({ src: `sfx/${src}.mp3`, at: +at.toFixed(2), vol });

// ── cold open ────────────────────────────────────────────────────────────────
G({ at: 0, dur: COLD, type: 'ambient', tint: '#0c2b22' });
G({ at: 0.6, dur: 5.4, type: 'impact', text: 'FORGOTTEN', size: 250 });          hit('braam', 0.5);
G({ at: 6.2, dur: 12.0, type: 'cardwall', srcs: cards.map(CARD), label: 'TEN LEGENDS', columns: 5 });
hit('whoosh', 6.2); hit('braam', 6.6, 0.45);
G({ at: 18.2, dur: 31.4, type: 'drift', srcs: cards.map(CARD), count: 7, opacity: 0.44 }); // never a flat text slate
G({ at: 18.6, dur: 5.2, type: 'impact', text: 'HE BEAT ENGLAND', size: 150 });   hit('stamp', 18.7);
G({ at: 23.9, dur: 5.2, type: 'impact', text: 'THEN VANISHED', size: 170, accent: 'red' }); hit('stamp', 24.0);
G({ at: 29.2, dur: 5.4, type: 'impact', text: 'BROKEN LEGS', size: 175 });        hit('stamp', 29.3);
G({ at: 34.7, dur: 5.4, type: 'impact', text: 'HE HID IN GOAL', size: 150 });     hit('stamp', 34.8);
G({ at: 41.0, dur: 8.0, type: 'kinetic', words: ['FOOTBALL', 'REMEMBERS', 'ITS CHAMPIONS'], size: 120 });
G({ at: 49.4, dur: 8.6, type: 'impact', text: 'IT FORGOT THESE', size: 148 });    hit('braam', 49.5);

// ── chapters ─────────────────────────────────────────────────────────────────
let t = COLD;
ch.forEach((c, i) => {
  const dur = LEAD + c.voDur + TAIL;
  const half = Math.floor(ch.length / 2);
  if (i === half) { // midpoint interlude
    G({ at: t, dur: INTERLUDE, type: 'ambient', tint: '#10263d' });
    G({ at: t + 0.4, dur: INTERLUDE - 1.2, type: 'cardwall', srcs: cards.map(CARD), label: 'COLLECT THE LEGENDS', columns: 5 });
    hit('whoosh', t + 0.4); hit('braam', t + 0.8, 0.45);
    t += INTERLUDE;
  }
  const side = i % 2 === 0 ? 'left' : 'right';

  // media: every clip plays exactly once (rule #11), images fill the rest
  const winStart = 2.4, winEnd = dur - 0.8;
  const clipTime = c.clips.length * CLIP;
  const imgTime = Math.max(0, (winEnd - winStart) - clipTime);
  const per = c.images.length ? imgTime / c.images.length : 0;
  const media = []; let m = winStart;
  const maxLen = Math.max(c.clips.length, c.images.length);
  for (let k = 0; k < maxLen; k++) {
    if (k < c.clips.length) { media.push({ src: `legends/${c.slug}/clips/${c.clips[k]}`, type: 'video', at: +m.toFixed(2), dur: CLIP }); m += CLIP; }
    if (k < c.images.length && per > 0.6) { media.push({ src: `legends/${c.slug}/images/${c.images[k]}`, type: 'image', at: +m.toFixed(2), dur: +per.toFixed(2) }); m += per; }
  }

  film.chapters.push({ index: i + 1, name: c.name, label: c.label, meta: c.meta,
    card: CARD(cards.find(f => f.startsWith(c.slug.slice(0, 2)))),
    at: +t.toFixed(2), dur: +dur.toFixed(2), side, media });

  G({ at: t, dur, type: 'ambient', tint: i % 2 ? '#0e1f3a' : '#102a20' });
  G({ at: t + 0.2, dur: dur - 0.4, type: 'drift', srcs: cards.map(CARD), count: 7, opacity: 0.42 });
  film.vo.push({ src: c.vo, at: +(t + LEAD).toFixed(2), dur: c.voDur });
  hit('whoosh', t + 0.15); hit('stamp', t + 0.95); hit('pop', t + 1.6, 0.34);
  t += dur;
});

// ── close ────────────────────────────────────────────────────────────────────
const cs = t;
G({ at: cs, dur: CLOSE, type: 'ambient', tint: '#0d3b2e' });
G({ at: cs + 0.2, dur: 15.6, type: 'drift', srcs: cards.map(CARD), count: 7, opacity: 0.44 });
G({ at: cs + 0.4, dur: 15.0, type: 'impact', text: 'THEY ARE CARDS NOW', size: 130 }); hit('braam', cs + 0.4);
G({ at: cs + 15.8, dur: 20.0, type: 'cardwall', srcs: cards.map(CARD), label: '100+ LEGEND CARDS', columns: 5 });
hit('whoosh', cs + 15.8);
G({ at: cs + 36.2, dur: 44.0, type: 'phone', srcs: cards.map(CARD) });            hit('pop', cs + 36.3);
G({ at: cs + 36.2, dur: 44.0, type: 'drift', srcs: cards.map(CARD), count: 6, opacity: 0.26 });
t += CLOSE;
film.duration = +t.toFixed(2);

// ── music: emotional arc, cued to the chapter map ────────────────────────────
const cue = (src, at, dur, vol = 0.34, loop = true) =>
  film.music.cues.push({ src: `music/${src}.mp3`, at: +at.toFixed(2), dur: +dur.toFixed(2), vol, loop, fadeIn: 2, fadeOut: 4 });
const c0 = film.chapters[0].at, c5 = film.chapters[5].at;
cue('cue-cinematic-open', 0, COLD, 0.40);
cue('cue-reverent', c0, c5 - c0, 0.30);
cue('cue-noble', c5, cs - c5, 0.30);
cue('cue-triumph', cs, CLOSE, 0.42);

fs.writeFileSync('film.json', JSON.stringify(film, null, 1) + '\n');
const mm = Math.floor(film.duration / 60), ss = Math.round(film.duration % 60);
console.log(`FORGOTTEN Vol.1 — ${mm}:${String(ss).padStart(2,'0')} (${film.duration}s)`);
console.log(`chapters ${film.chapters.length} · vo ${film.vo.length} · graphics ${film.graphics.length} · sfx ${film.sfx.hits.length} · music ${film.music.cues.length}`);
console.log(`media: ${film.chapters.reduce((a,c)=>a+c.media.filter(m=>m.type==='video').length,0)} clips + ${film.chapters.reduce((a,c)=>a+c.media.filter(m=>m.type==='image').length,0)} images`);
