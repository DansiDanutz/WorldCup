// Ep70 England vs Panama — NO-REPEAT (rule #11): every clip used EXACTLY ONCE.
// 30 distinct clips. OUR PREDICTION ENG 1-1 PAN (canon England-vs-Panama.md 'The
// Ghost of 2018': Panama return to exorcise the 6-1 — Waterman a shock career goal,
// Bárcenas 'El Mago' cuts inside on 43' and curls inches WIDE, England equalize
// through Kane; a level scoreline that makes the world stop talking about 2018).
// Rule #16 Mola tease+payoff (you don't erase the past, you layer it). #17 holo
// reveal + #18 premium prediction card. #19 full-frame. #20 15s mystic intro.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-engfan', 'cg-eng-fan.mp4', 0.0, 5.0), C('cg-panfan', 'cg-pan-fan.mp4', 5.0, 5.0),
  C('cg-tease', 'cg-mystery-tease.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('eng-crowd', 'eng-crowd.mp4', 44.0, 11.5),
  C('s-kane', 'eng-kane.mp4', 55.5, 5.6), C('s-bellingham', 'eng-bellingham.mp4', 61.1, 4.0),
  C('s-foden', 'eng-foden.mp4', 65.1, 3.0), C('s-rice', 'eng-rice.mp4', 68.1, 5.5),
  C('s-pickford', 'eng-pickford.mp4', 73.6, 5.9),
  C('pan-crowd', 'pan-crowd.mp4', 79.5, 11.1),
  C('s-carrasquilla', 'pan-carrasquilla.mp4', 90.6, 4.6), C('s-barcenas', 'pan-barcenas.mp4', 95.2, 3.0),
  C('s-murillo', 'pan-murillo.mp4', 98.2, 2.6), C('s-waterman', 'pan-waterman.mp4', 100.8, 2.4),
  C('duel-eng', 'duel-eng.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-pan', 'duel-pan.mp4', 122.5, 9.6),
  C('dr-pan-shock', 'dr-pan-shock.mp4', 132.0, 10.0), C('dr-barcenas-wide', 'dr-barcenas-wide.mp4', 142.0, 10.0),
  C('dr-eng-press', 'dr-eng-press.mp4', 152.0, 10.0), C('dr-eng-equalize', 'dr-eng-equalize.mp4', 162.0, 10.0),
  C('dr-pan-defend', 'dr-pan-defend.mp4', 172.0, 11.0), C('dr-eng-chance', 'dr-eng-chance.mp4', 183.0, 10.0),
  C('dr-end-level', 'dr-end-level.mp4', 193.0, 10.4),
  C('vd-respect', 'verdict-respect.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-mola', 'my-mola.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep70 England vs Panama — NO-REPEAT (rule #11): every clip once, 30 distinct. OUR PREDICTION ENG 1-1 PAN (Waterman shock goal ~25 PAN 0-1; Bárcenas 43 cuts inside and curls WIDE; Kane equalizes ~65 1-1; a level scoreline). Legend 070 The Mola Maker. Rule #16 tease+payoff, #17 holo reveal, #18 premium prediction card, #19 full-frame, #20 mystic intro. vol=0.',
  clips,
  music: { cues: [
    { src: 'music/cue-tense.mp3', at: 0, dur: 30, vol: 0.5, fadeIn: 0.5, fadeOut: 3, loop: false },
    { src: 'music/cue-epic.mp3', at: 31.56, dur: 288, vol: 0.4, fadeIn: 2.5, fadeOut: 4, loop: true },
    { src: 'music/cue-heroic.mp3', at: 272, dur: 34, vol: 0.48, fadeIn: 2.5, fadeOut: 3, loop: false },
  ]},
  sfx: { hits: [
    { src: 'sfx/heartbeat.mp3', at: 0.3, vol: 0.95 }, { src: 'sfx/heartbeat.mp3', at: 6, vol: 0.8 },
    { src: 'sfx/braam.mp3', at: 11.5, vol: 0.85 }, { src: 'sfx/whoosh.mp3', at: 22.06, vol: 0.6 },
    { src: 'sfx/stamp.mp3', at: 22.38, vol: 0.6 }, { src: 'sfx/whoosh.mp3', at: 26.17, vol: 0.55 },
    { src: 'sfx/braam.mp3', at: 44, vol: 0.6 }, { src: 'sfx/pop.mp3', at: 55.5, vol: 0.55 },
    { src: 'sfx/whoosh.mp3', at: 79.5, vol: 0.55 }, { src: 'sfx/pop.mp3', at: 90.6, vol: 0.55 },
    { src: 'sfx/whoosh.mp3', at: 113.25, vol: 0.6 }, { src: 'sfx/pop.mp3', at: 131.51, vol: 0.55 },
    { src: 'sfx/goal.mp3', at: 138.5, vol: 0.92 }, { src: 'sfx/whoosh.mp3', at: 147.0, vol: 0.65 },
    { src: 'sfx/braam.mp3', at: 149.5, vol: 0.75 }, { src: 'sfx/goal.mp3', at: 168.5, vol: 0.9 },
    { src: 'sfx/whoosh.mp3', at: 186.0, vol: 0.6 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep70:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
