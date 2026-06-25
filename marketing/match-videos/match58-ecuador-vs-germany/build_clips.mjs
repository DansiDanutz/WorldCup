// Ep58 Ecuador vs Germany — ANIMATION-FIRST. OUR PREDICTION ECU 1-0 GER
// (Caicedo wins it off Musiala 55', Valencia finishes the counter 57'; keeper
// denies Germany 80'). Real player animations full-screen + looping. Legend 058 Weaver.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-stad', 'stadium.mp4', 0.0, 6.2),
  C('cg-musiala', 'ger-musiala.mp4', 6.0, 6.2),
  C('cg-caicedo', 'ecu-caicedo.mp4', 12.0, 6.4),
  C('cg-crowd', 'ecu-crowd.mp4', 18.0, 5.2),
  C('title-bg', 'ger-crowd.mp4', 23.0, 10.2),
  C('stad-a', 'stadium.mp4', 33.0, 6.0),
  C('stad-b', 'ecu-crowd.mp4', 39.0, 5.2),
  // ECUADOR 44-79.5
  C('ecu-crowd-bg', 'ecu-crowd.mp4', 44.0, 11.6),
  C('s-caicedo', 'ecu-caicedo.mp4', 55.5, 5.6),
  C('s-valencia', 'ecu-valencia.mp4', 61.0, 4.1),
  C('s-plata', 'ecu-plata.mp4', 65.0, 3.1),
  C('s-hincapie', 'ecu-hincapie.mp4', 68.0, 5.6),
  C('s-pacho', 'ecu-pacho.mp4', 73.5, 6.1),
  // GERMANY 79.5-103
  C('ger-crowd-bg', 'ger-crowd.mp4', 79.5, 11.2),
  C('s-musiala', 'ger-musiala.mp4', 90.6, 4.5),
  C('s-wirtz', 'ger-wirtz.mp4', 95.1, 3.0),
  C('s-havertz', 'ger-havertz.mp4', 98.1, 2.6),
  C('s-kimmich', 'ger-kimmich.mp4', 100.7, 2.4),
  // DUEL 103-132
  C('duel-musiala', 'ger-musiala.mp4', 103.0, 14.6),
  C('duel-caicedo', 'ecu-caicedo.mp4', 117.6, 14.5),
  // DRAMA 132-203
  C('dr-stad', 'stadium.mp4', 132.0, 8.6),
  C('dr-musiala', 'ger-musiala.mp4', 140.5, 9.6),
  C('dr-tackle', 'action-caicedo-tackle.mp4', 150.0, 6.6),
  C('dr-valgoal', 'action-valencia-goal.mp4', 156.5, 11.1),
  C('dr-yellow', 'ecu-crowd.mp4', 167.5, 10.6),
  C('dr-havertz', 'ger-havertz.mp4', 178.0, 8.1),
  C('dr-save', 'action-keeper-save.mp4', 186.0, 11.6),
  C('dr-celeb', 'action-celeb.mp4', 197.5, 6.9),
  C('vd-celeb', 'action-celeb.mp4', 203.32, 10.0),
  C('vd-crowd', 'ecu-crowd.mp4', 213.0, 31.0),
  C('en-crowd', 'ger-crowd.mp4', 244.0, 11.2),
  C('my-weaver', 'mystery-weaver.mp4', 255.0, 26.5),
  C('app-crowd', 'ecu-crowd.mp4', 281.38, 21.8),
  C('cta-celeb', 'action-celeb.mp4', 303.05, 15.2),
];
const bdSrcs = ['stadium.mp4', 'ecu-crowd.mp4', 'ger-crowd.mp4', 'action-celeb.mp4'];
let at = 0.0;
for (let i = 0; i <= 66; i++) { clips.push(C(`bd-${i}`, bdSrcs[i % bdSrcs.length], +at.toFixed(2), 5.2)); at += 4.8; }
const out = {
  comment: 'Ep58 Ecuador vs Germany — ANIMATION-FIRST. OUR PREDICTION ECU 1-0 GER (Valencia 57 off Caicedo counter; keeper denies Germany 80). Real player animations full-screen. Unique Higgsfield crowds (ecu yellow / ger white), Andean stadium, action (valencia-goal/caicedo-tackle/keeper-save/celeb), mystery-weaver. Legend 058 The Weaver. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 159.5, vol: 0.7 }, { src: 'sfx/braam.mp3', at: 160.5, vol: 0.85 },
    { src: 'sfx/goal.mp3', at: 162.0, vol: 0.95 }, { src: 'sfx/whoosh.mp3', at: 189.5, vol: 0.7 },
    { src: 'sfx/braam.mp3', at: 191.2, vol: 0.9 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
console.log('clips.json (Ep58):', clips.length, 'clips');
