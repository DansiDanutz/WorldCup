// Ep62 Turkey vs USA — NO-REPEAT clip timeline (rule #11): every clip used
// EXACTLY ONCE. 30 distinct clips tile 0-318s (all Higgsfield — no pre-made
// player animations exist for these nations). Title+App on gradients.
// OUR PREDICTION TUR 2-2 USA (trade blows; Tyler Adams blocks Yildiz header 90+1).
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-turfan', 'cg-tur-fan.mp4', 0.0, 5.0), C('cg-usafan', 'cg-usa-fan.mp4', 5.0, 5.0),
  C('cg-ball', 'cg-ball.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('tur-crowd', 'tur-crowd.mp4', 44.0, 11.5),
  C('s-guler', 'tur-guler.mp4', 55.5, 5.6), C('s-calhanoglu', 'tur-calhanoglu.mp4', 61.1, 4.0),
  C('s-yildiz', 'tur-yildiz.mp4', 65.1, 3.0), C('s-kokcu', 'tur-kokcu.mp4', 68.1, 5.5),
  C('s-demiral', 'tur-demiral.mp4', 73.6, 5.9),
  C('usa-crowd', 'usa-crowd.mp4', 79.5, 11.1),
  C('s-pulisic', 'usa-pulisic.mp4', 90.6, 4.6), C('s-adams', 'usa-adams.mp4', 95.2, 3.0),
  C('s-mckennie', 'usa-mckennie.mp4', 98.2, 2.6), C('s-weah', 'usa-weah.mp4', 100.8, 2.4),
  C('duel-tur', 'duel-tur.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-usa', 'duel-usa.mp4', 122.5, 9.6),
  C('dr-usa-attack', 'dr-usa-attack.mp4', 132.0, 10.0), C('dr-usa-goal', 'dr-usa-goal.mp4', 142.0, 10.0),
  C('dr-tur-goal', 'dr-tur-goal.mp4', 152.0, 10.0), C('dr-endtoend', 'dr-endtoend.mp4', 162.0, 10.0),
  C('dr-tur-corner', 'dr-tur-corner.mp4', 172.0, 10.0), C('dr-block', 'dr-adams-block.mp4', 182.0, 11.0),
  C('dr-defiance', 'dr-defiance.mp4', 193.0, 10.4),
  C('vd-respect', 'verdict-respect.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-ebru', 'mystery-ebru.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep62 Turkey vs USA — NO-REPEAT (rule #11): every clip once, 30 distinct, no looping. OUR PREDICTION TUR 2-2 USA (trade blows; Adams blocks Yildiz header 90+1). Legend 062 The Ebru Master (Turkey). Real app card artwork in reveal. Title+App gradients. vol=0.',
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
    { src: 'sfx/goal.mp3', at: 148.5, vol: 0.9 }, { src: 'sfx/goal.mp3', at: 159.5, vol: 0.92 },
    { src: 'sfx/whoosh.mp3', at: 185.5, vol: 0.7 }, { src: 'sfx/braam.mp3', at: 191.2, vol: 0.9 },
    { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep62:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
