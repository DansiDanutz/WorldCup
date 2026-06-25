// Ep61 Paraguay vs Australia — NO-REPEAT clip timeline (rule #11): every clip used
// EXACTLY ONCE. 30 distinct clips tile 0-318s (9 players + 21 unique Higgsfield).
// Title+App on gradients. OUR PREDICTION PAR 1-0 AUS (Enciso 40', Aus post 67').
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-parfan', 'cg-par-fan.mp4', 0.0, 5.0), C('cg-ausfan', 'cg-aus-fan.mp4', 5.0, 5.0),
  C('cg-ball', 'cg-ball.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('par-crowd', 'par-crowd.mp4', 44.0, 11.5),
  C('s-almiron', 'par-almiron.mp4', 55.5, 5.6), C('s-enciso', 'par-enciso.mp4', 61.1, 4.0),
  C('s-dgomez', 'par-dgomez.mp4', 65.1, 3.0), C('s-ggomez', 'par-ggomez.mp4', 68.1, 5.5),
  C('s-alderete', 'par-alderete.mp4', 73.6, 5.9),
  C('aus-crowd', 'aus-crowd.mp4', 79.5, 11.1),
  C('s-irvine', 'aus-irvine.mp4', 90.6, 4.6), C('s-volpato', 'aus-volpato.mp4', 95.2, 3.0),
  C('s-souttar', 'aus-souttar.mp4', 98.2, 2.6), C('s-irankunda', 'aus-irankunda.mp4', 100.8, 2.4),
  C('duel-par', 'duel-par.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-aus', 'duel-aus.mp4', 122.5, 9.6),
  C('dr-par-attack', 'dr-par-attack.mp4', 132.0, 10.0), C('dr-goal', 'dr-par-goal.mp4', 142.0, 10.0),
  C('dr-par-celeb', 'dr-par-celeb.mp4', 152.0, 10.0), C('dr-par-react', 'dr-par-react.mp4', 162.0, 10.0),
  C('dr-aus-attack', 'dr-aus-attack.mp4', 172.0, 10.0), C('dr-post', 'dr-aus-post.mp4', 182.0, 11.0),
  C('dr-defiance', 'dr-aus-defiance.mp4', 193.0, 10.4),
  C('vd-celeb', 'verdict-celeb.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-harp', 'mystery-harp.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep61 Paraguay vs Australia — NO-REPEAT (rule #11): every clip once, ~30 distinct, no looping. OUR PREDICTION PAR 1-0 AUS (Enciso 40, Aus post 67). Legend 061 The Harpist (Paraguay). Real app card artwork shown in reveal. Title+App gradients. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 158.5, vol: 0.7 }, { src: 'sfx/braam.mp3', at: 159.5, vol: 0.85 },
    { src: 'sfx/goal.mp3', at: 161.0, vol: 0.95 }, { src: 'sfx/whoosh.mp3', at: 189.5, vol: 0.7 },
    { src: 'sfx/braam.mp3', at: 191.2, vol: 0.9 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep61:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
