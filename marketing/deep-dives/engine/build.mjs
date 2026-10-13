// build.mjs <episode-dir> — episode.json + Brian VO durations -> build/film.json.
//
// Run from anywhere; every path in film.json is relative to the REPO ROOT, which is
// what serve.mjs serves and what mux-audio.mjs resolves against.
//
// With VO present (vo/beat_NN.mp3) each beat lasts exactly as long as Brian takes
// to say it. Without VO (PREVIEW=1) durations are estimated from word count so the
// picture can be reviewed before the voice exists; a preview is never shipped.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, FFMPEG, rel, loadEpisode, cardArtPath, loadLibrary, beatShots } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const PREVIEW = process.env.PREVIEW === '1';
const WPS = 2.55; // Brian's pace (words per second) for the preview estimate

function audioDuration(file) {
  const out = spawnSync(FFMPEG, ['-i', file], { encoding: 'utf8' }).stderr || '';
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`cannot read duration of ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

const voFile = (i) => path.join(epDir, 'vo', `beat_${String(i + 1).padStart(2, '0')}.mp3`);
const beats = ep.beats.map((b, i) => {
  const words = b.vo.trim().split(/\s+/).length;
  const has = fs.existsSync(voFile(i));
  if (!has && !PREVIEW) throw new Error(`missing VO ${rel(voFile(i))} — run gen-vo.mjs, or PREVIEW=1 for a silent preview`);
  return { ...b, voDur: has ? audioDuration(voFile(i)) : words / WPS + 0.35, voSrc: has ? rel(voFile(i)) : null };
});

const LIB = loadLibrary();
const P = ep.player;
const colors = P.colors;
const film = { duration: 0, episode: ep.slug, preview: PREVIEW, graphics: [], vo: [], sfx: { hits: [] }, music: { cues: [] } };
const G = (o) => film.graphics.push(o);
const hit = (name, at, vol = 0.5) => film.sfx.hits.push({ src: rel(path.join(ROOT, 'marketing/deep-dives/engine/sfx', `${name}.mp3`)), at: +at.toFixed(2), vol });

// Real album cards drift behind every beat so no frame is a flat slate (doc LAW #2).
const albumDir = path.join(ROOT, 'public/legend-cards/did-you-know');
const album = fs.readdirSync(albumDir).filter((f) => f.endsWith('.png')).sort()
  .map((f) => '/' + rel(path.join(albumDir, f)));

const LEAD = 0.5;   // breath before the first word
const GAP = 0.55;   // breath between beats
const SFX_FOR = {
  title: [['braam', 0.1, 0.6]], chapter: [['whoosh', 0, 0.5], ['braam', 0.35, 0.42]],
  stat: [['whoosh', 0.1, 0.35], ['stamp', 2.3, 0.55]], impact: [['stamp', 0.05, 0.6]],
  kinetic: [['pop', 0.1, 0.35]], card: [['whoosh', 0, 0.55], ['braam', 0.5, 0.4]],
  cardwall: [['whoosh', 0, 0.5]], route: [['whoosh', 0.4, 0.45]], pitch: [['whoosh', 0.2, 0.35], ['pop', 1.6, 0.3]],
  artifact: [['whoosh', 0.1, 0.45], ['pop', 1.0, 0.3]], versus: [['pop', 0.5, 0.35], ['pop', 1.0, 0.35]],
  heartbeat: [['heartbeat', 0.2, 0.55]], date: [['stamp', 1.4, 0.5]], timeline: [['pop', 1.0, 0.3], ['pop', 2.2, 0.3]],
  jersey: [['whoosh', 0.05, 0.45]], nameplate: [['stamp', 0.6, 0.5]], phone: [['pop', 0.2, 0.4]],
  ballnet: [['whoosh', 0.2, 0.45], ['stamp', 1.2, 0.5]], stadium: [['whoosh', 0.2, 0.4]],
};

let t = LEAD;
let chapter = 0;
const chapters = [];
const tints = ['#102a20', '#0e1f3a', '#2a1020', '#1d2a10'];
beats.forEach((b, i) => {
  const dur = b.voDur + GAP;
  const enrich = (scene) => {
    const s = { ...scene };
    if (s.type === 'chapter') { chapter += 1; s.index = chapter; chapters.push({ at: t, title: s.title }); }
    if (s.type === 'title' || s.type === 'jersey') { s.colors = s.colors || colors; s.number = s.number ?? P.number; }
    if (s.type === 'title') { s.name = s.name || P.name; s.nation = s.nation || P.nation; }
    if (s.type === 'jersey') s.name = s.name ?? P.short;
    if (s.type === 'card') { s.src = '/' + rel(cardArtPath(ep)); s.name = s.name || ep.card.title.toUpperCase(); s.meta = s.meta || P.nation.toUpperCase(); }
    if (s.type === 'cardwall' || s.type === 'drift') s.srcs = s.srcs || album;
    if (s.type === 'phone') s.srcs = ['/' + rel(cardArtPath(ep)), ...album];
    return s;
  };
  // a beat is a run of shots: library clips (optionally with a drawn overlay) and drawn scenes
  let at = t;
  beatShots(b).forEach((shot, k) => {
    const sd = dur * shot.share;
    const D = +(sd + 0.25).toFixed(2), AT = +at.toFixed(2);
    if (shot.clip) {
      const c = LIB[shot.clip];
      if (!c) throw new Error(`beat ${i + 1}: clip "${shot.clip}" is not in library/clips.json`);
      // play at real speed when the clip is long enough, else slow it just enough to fill the shot
      const rate = shot.rate ?? Math.min(1, (c.dur - (shot.offset || 0) - 0.1) / D);
      G({ at: AT, dur: D, type: 'clip', clip: shot.clip, src: '/' + c.src, rate: +rate.toFixed(3), offset: shot.offset || 0,
        clipDur: c.dur, vertical: c.h > c.w, aspect: +(c.w / c.h).toFixed(4), blur: c.blur, dim: shot.over ? 0.42 : 0, tag: shot.tag, k: i + k });
      if (k === 0) hit('whoosh', at, 0.18);
      if (shot.over) {
        const o = enrich(shot.over);
        G({ at: AT, dur: D, ...o });
        (SFX_FOR[o.type] || [['pop', 0.2, 0.25]]).forEach(([n, off, v]) => hit(n, at + off, v));
      }
    } else {
      const ps = enrich(shot.scene);
      G({ at: AT, dur: D, ...ps });
      (SFX_FOR[ps.type] || [['pop', 0.2, 0.25]]).forEach(([n, off, v]) => hit(n, at + off, v));
    }
    at += sd;
  });
  film.vo.push({ src: b.voSrc, at: +t.toFixed(2), dur: +b.voDur.toFixed(2), text: b.vo });
  t += dur;
});
const END_PAD = 1.2;
film.duration = +(t + END_PAD).toFixed(2);

// always-on layers: ambient base, card drift, the corner name bug after the title
G({ at: 0, dur: film.duration, type: 'ambient', tint: tints[0] });
chapters.forEach((c, i) => G({ at: +c.at.toFixed(2), dur: +(film.duration - c.at).toFixed(2), type: 'ambient', tint: tints[(i + 1) % tints.length] }));
G({ at: 0, dur: film.duration, type: 'drift', srcs: album, count: 6, opacity: 0.14 });
const afterTitle = film.graphics.find((g) => g.type === 'title');
const phone = film.graphics.find((g) => g.type === 'phone');
const bugFrom = afterTitle ? afterTitle.at + afterTitle.dur : 6;
G({ at: +bugFrom.toFixed(2), dur: +((phone ? phone.at : film.duration) - bugFrom).toFixed(2), type: 'bug',
  name: P.name, number: P.number, colors });
// graphics render in array order: base layers first
film.graphics.sort((a, b) => (['ambient', 'drift'].includes(a.type) ? 0 : 1) - (['ambient', 'drift'].includes(b.type) ? 0 : 1));

// music arc: open -> reverent -> triumph (Kevin MacLeod, CC-BY 4.0)
const music = (n) => rel(path.join(ROOT, 'marketing/deep-dives/engine/music', `${n}.mp3`));
const third = film.duration / 3;
const closeAt = phone ? Math.max(phone.at - 8, third * 2) : third * 2;
film.music.cues.push({ src: music('cue-cinematic-open'), at: 0, dur: +third.toFixed(2), vol: 0.32, loop: true, fadeIn: 1.5, fadeOut: 4 });
film.music.cues.push({ src: music('cue-reverent'), at: +third.toFixed(2), dur: +(closeAt - third).toFixed(2), vol: 0.26, loop: true, fadeIn: 3, fadeOut: 4 });
film.music.cues.push({ src: music('cue-triumph'), at: +closeAt.toFixed(2), dur: +(film.duration - closeAt).toFixed(2), vol: 0.36, loop: true, fadeIn: 2, fadeOut: 3 });

film.chapters = chapters.map((c) => ({ at: +c.at.toFixed(2), title: c.title }));
fs.mkdirSync(path.join(epDir, 'build'), { recursive: true });
fs.writeFileSync(path.join(epDir, 'build/film.json'), JSON.stringify(film, null, 1) + '\n');
const mm = Math.floor(film.duration / 60), ss = Math.round(film.duration % 60);
console.log(`${ep.slug}: ${mm}:${String(ss).padStart(2, '0')} (${film.duration}s)${PREVIEW ? ' PREVIEW (estimated VO timing)' : ''}`);
console.log(`beats ${beats.length} · chapters ${chapters.length} · graphics ${film.graphics.length} · sfx ${film.sfx.hits.length} (1 per ${(film.duration / film.sfx.hits.length).toFixed(1)}s)`);
