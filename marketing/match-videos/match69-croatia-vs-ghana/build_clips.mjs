// Ep69 Croatia vs Ghana — NO-REPEAT (rule #11): every clip used EXACTLY ONCE.
// 30 distinct clips. OUR PREDICTION CRO 0-0 GHA (canon Croatia-vs-Ghana.md 'The
// Warriors and the Black Stars': a goalless war of will — Modrić's 75' pass slides
// Kramarić through, the shot flashes WIDE; Livaković a wall; neither will bends an
// inch). Rule #16 Stonemason tease+payoff (the white-stone walls that never fell).
// Rule #17 holo collectible reveal + #18 premium prediction card. Rule #15 clean.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-crofan', 'cg-cro-fan.mp4', 0.0, 5.0), C('cg-ghafan', 'cg-gha-fan.mp4', 5.0, 5.0),
  C('cg-tease', 'cg-mystery-tease.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('cro-crowd', 'cro-crowd.mp4', 44.0, 11.5),
  C('s-modric', 'cro-modric.mp4', 55.5, 5.6), C('s-kovacic', 'cro-kovacic.mp4', 61.1, 4.0),
  C('s-gvardiol', 'cro-gvardiol.mp4', 65.1, 3.0), C('s-kramaric', 'cro-kramaric.mp4', 68.1, 5.5),
  C('s-livakovic', 'cro-livakovic.mp4', 73.6, 5.9),
  C('gha-crowd', 'gha-crowd.mp4', 79.5, 11.1),
  C('s-partey', 'gha-partey.mp4', 90.6, 4.6), C('s-williams', 'gha-williams.mp4', 95.2, 3.0),
  C('s-issahaku', 'gha-issahaku.mp4', 98.2, 2.6), C('s-kudus', 'gha-kudus.mp4', 100.8, 2.4),
  C('duel-cro', 'duel-cro.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-gha', 'duel-gha.mp4', 122.5, 9.6),
  C('dr-cro-attack', 'dr-cro-attack.mp4', 132.0, 10.0), C('dr-gha-williams', 'dr-gha-williams.mp4', 142.0, 10.0),
  C('dr-livakovic-save', 'dr-livakovic-save.mp4', 152.0, 10.0), C('dr-modric-turn', 'dr-modric-turn.mp4', 162.0, 10.0),
  C('dr-kramaric-wide', 'dr-kramaric-wide.mp4', 172.0, 11.0), C('dr-gha-chance', 'dr-gha-chance.mp4', 183.0, 10.0),
  C('dr-end-level', 'dr-end-level.mp4', 193.0, 10.4),
  C('vd-respect', 'verdict-respect.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-stonemason', 'my-stonemason.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep69 Croatia vs Ghana — NO-REPEAT (rule #11): every clip once, 30 distinct. OUR PREDICTION CRO 0-0 GHA (a goalless war of will: Livaković saves, Williams denied, Modrić 75 turn+pass, Kramarić shot flashes WIDE; neither will bends). Legend 069 The Stonemason. Rule #16 tease+payoff, #17 holo collectible reveal, #18 premium prediction card. Title+App gradients. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 156.0, vol: 0.65 }, { src: 'sfx/braam.mp3', at: 158.0, vol: 0.7 },
    { src: 'sfx/whoosh.mp3', at: 177.0, vol: 0.7 }, { src: 'sfx/braam.mp3', at: 179.5, vol: 0.85 },
    { src: 'sfx/whoosh.mp3', at: 186.0, vol: 0.6 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep69:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
