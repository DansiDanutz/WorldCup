// Ep68 Belgium vs New Zealand — NO-REPEAT (rule #11): every clip used EXACTLY ONCE.
// 30 distinct clips. OUR PREDICTION BEL 2-1 NZL (canon Belgium-vs-New-Zealand.md
// 'The Last Stand of the Golden Generation': Belgium lead 2-1, NZ throw everyone
// forward, 85' Chris Wood header rises above two defenders, Courtois fingertip,
// crashes off the CROSSBAR; the thread holds). Rule #16 Carillon tease+payoff
// (the bells that ring for every Belgian triumph and farewell). Rule #17 holo
// collectible reveal + #18 premium prediction card. Rule #15 clean.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-belfan', 'cg-bel-fan.mp4', 0.0, 5.0), C('cg-nzfan', 'cg-nz-fan.mp4', 5.0, 5.0),
  C('cg-tease', 'cg-mystery-tease.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('bel-crowd', 'bel-crowd.mp4', 44.0, 11.5),
  C('s-debruyne', 'bel-debruyne.mp4', 55.5, 5.6), C('s-lukaku', 'bel-lukaku.mp4', 61.1, 4.0),
  C('s-doku', 'bel-doku.mp4', 65.1, 3.0), C('s-tielemans', 'bel-tielemans.mp4', 68.1, 5.5),
  C('s-courtois', 'bel-courtois.mp4', 73.6, 5.9),
  C('nz-crowd', 'nz-crowd.mp4', 79.5, 11.1),
  C('s-wood', 'nz-wood.mp4', 90.6, 4.6), C('s-stamenic', 'nz-stamenic.mp4', 95.2, 3.0),
  C('s-cacace', 'nz-cacace.mp4', 98.2, 2.6), C('s-just', 'nz-just.mp4', 100.8, 2.4),
  C('duel-bel', 'duel-bel.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-nz', 'duel-nz.mp4', 122.5, 9.6),
  C('dr-bel-goal', 'dr-bel-goal.mp4', 132.0, 10.0), C('dr-nz-equalize', 'dr-nz-equalize.mp4', 142.0, 10.0),
  C('dr-bel-winner', 'dr-bel-winner.mp4', 152.0, 10.0), C('dr-nz-throw', 'dr-nz-throw.mp4', 162.0, 10.0),
  C('dr-wood-header', 'dr-wood-header.mp4', 172.0, 11.0), C('dr-crossbar', 'dr-crossbar.mp4', 183.0, 10.0),
  C('dr-bel-relief', 'dr-bel-relief.mp4', 193.0, 10.4),
  C('vd-respect', 'verdict-respect.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-carillon', 'my-carillon.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep68 Belgium vs New Zealand — NO-REPEAT (rule #11): every clip once, 30 distinct. OUR PREDICTION BEL 2-1 NZL (Lukaku ~25, Wood equalizes ~55, Belgium winner ~70; 85 Wood header off the CROSSBAR, Courtois fingertip; thread holds). Legend 068 The Carillonneur. Rule #16 tease+payoff, #17 holo collectible reveal, #18 premium prediction card. Title+App gradients. vol=0.',
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
    { src: 'sfx/goal.mp3', at: 138.5, vol: 0.9 }, { src: 'sfx/goal.mp3', at: 148.5, vol: 0.9 },
    { src: 'sfx/goal.mp3', at: 158.5, vol: 0.92 }, { src: 'sfx/whoosh.mp3', at: 178.5, vol: 0.7 },
    { src: 'sfx/braam.mp3', at: 180.0, vol: 0.9 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep68:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
