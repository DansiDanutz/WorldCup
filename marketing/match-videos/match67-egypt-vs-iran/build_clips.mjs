// Ep67 Egypt vs Iran — NO-REPEAT (rule #11): every clip used EXACTLY ONCE.
// 30 distinct clips. OUR PREDICTION EGY 1-0 IRN (canon Egypt-vs-Iran.md: The
// Desert Derby; Iran press & Taremi goes close, but Salah cuts inside on 71'
// and curls his left foot inside the far post). Rule #16 Ney tease+payoff (the
// breath/soul of the Nile). Rule #17 holo collectible reveal + #18 premium
// prediction card. Rule #15 clean (no banned wording).
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-egyfan', 'cg-egy-fan.mp4', 0.0, 5.0), C('cg-irnfan', 'cg-irn-fan.mp4', 5.0, 5.0),
  C('cg-tease', 'cg-mystery-tease.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('egy-crowd', 'egy-crowd.mp4', 44.0, 11.5),
  C('s-salah', 'egy-salah.mp4', 55.5, 5.6), C('s-marmoush', 'egy-marmoush.mp4', 61.1, 4.0),
  C('s-trezeguet', 'egy-trezeguet.mp4', 65.1, 3.0), C('s-zizo', 'egy-zizo.mp4', 68.1, 5.5),
  C('s-elneny', 'egy-elneny.mp4', 73.6, 5.9),
  C('irn-crowd', 'irn-crowd.mp4', 79.5, 11.1),
  C('s-taremi', 'irn-taremi.mp4', 90.6, 4.6), C('s-azmoun', 'irn-azmoun.mp4', 95.2, 3.0),
  C('s-jahanbakhsh', 'irn-jahanbakhsh.mp4', 98.2, 2.6), C('s-gholizadeh', 'irn-gholizadeh.mp4', 100.8, 2.4),
  C('duel-egy', 'duel-egy.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-irn', 'duel-irn.mp4', 122.5, 9.6),
  C('dr-irn-attack', 'dr-irn-attack.mp4', 132.0, 10.0), C('dr-irn-chance', 'dr-irn-chance.mp4', 142.0, 10.0),
  C('dr-egy-buildup', 'dr-egy-buildup.mp4', 152.0, 10.0), C('dr-salah-cutin', 'dr-salah-cutin.mp4', 162.0, 10.0),
  C('dr-salah-goal', 'dr-salah-goal.mp4', 172.0, 11.0), C('dr-egy-celeb', 'dr-egy-celeb.mp4', 183.0, 10.0),
  C('dr-taremi-stand', 'dr-taremi-stand.mp4', 193.0, 10.4),
  C('vd-respect', 'verdict-respect.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-ney', 'my-ney.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep67 Egypt vs Iran — NO-REPEAT (rule #11): every clip once, 30 distinct. OUR PREDICTION EGY 1-0 IRN (Iran press, Taremi goes close ~40, Salah cuts inside & curls his left foot inside the far post 71). Legend 067 The Ney Player. Rule #16 tease+payoff, #17 holo collectible reveal, #18 premium prediction card. Title+App gradients. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 146.5, vol: 0.6 }, { src: 'sfx/braam.mp3', at: 162.0, vol: 0.55 },
    { src: 'sfx/whoosh.mp3', at: 177.0, vol: 0.7 }, { src: 'sfx/goal.mp3', at: 179.0, vol: 0.96 },
    { src: 'sfx/braam.mp3', at: 180.0, vol: 0.85 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep67:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
