// Ep57 Curaçao vs Ivory Coast — ANIMATION-FIRST clip timeline. Hero clips get
// FULL-LENGTH windows so VideoSprite loops the image-sequence for the whole
// segment. Players play FULL-SCREEN when named. OUR PREDICTION CUR 1-1 CIV
// (Amad Diallo opens for Ivory Coast, Leandro Bacuna equalises 63'). Legend 057 Drummaker.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });

const clips = [
  C('cg-stad', 'stadium.mp4', 0.0, 6.2),
  C('cg-amad', 'civ-amad.mp4', 6.0, 6.2),
  C('cg-juninho', 'cur-juninho.mp4', 12.0, 6.4),
  C('cg-crowd', 'civ-crowd.mp4', 18.0, 5.2),
  C('title-bg', 'cur-crowd.mp4', 23.0, 10.2),
  C('stad-a', 'stadium.mp4', 33.0, 6.0),
  C('stad-b', 'civ-crowd.mp4', 39.0, 5.2),
  // CURAÇAO 44-79.5
  C('cur-crowd-bg', 'cur-crowd.mp4', 44.0, 11.6),
  C('s-juninho', 'cur-juninho.mp4', 55.5, 5.6),
  C('s-leandro', 'cur-leandro.mp4', 61.0, 4.1),
  C('s-zeefuik', 'cur-zeefuik.mp4', 65.0, 3.1),
  C('s-janga', 'cur-janga.mp4', 68.0, 5.6),
  C('s-locadia', 'cur-locadia.mp4', 73.5, 6.1),
  // IVORY COAST 79.5-103
  C('civ-crowd-bg', 'civ-crowd.mp4', 79.5, 11.2),
  C('s-amad', 'civ-amad.mp4', 90.6, 4.5),
  C('s-kessie', 'civ-kessie.mp4', 95.1, 3.0),
  C('s-odiomande', 'civ-odiomande.mp4', 98.1, 2.6),
  C('s-adingra', 'civ-adingra.mp4', 100.7, 2.4),
  // DUEL 103-132
  C('duel-amad', 'civ-amad.mp4', 103.0, 14.6),
  C('duel-zeefuik', 'cur-zeefuik.mp4', 117.6, 14.5),
  // DRAMA 132-203
  C('dr-stad', 'stadium.mp4', 132.0, 8.6),
  C('dr-amaddrib', 'civ-amad.mp4', 140.5, 9.6),
  C('dr-amadgoal', 'action-amad-goal.mp4', 150.0, 12.1),
  C('dr-elephants', 'civ-crowd.mp4', 162.0, 9.6),
  C('dr-juninho', 'action-juninho-pass.mp4', 171.6, 7.1),
  C('dr-leandro', 'action-leandro-goal.mp4', 178.7, 18.3),
  C('dr-celeb', 'action-celeb.mp4', 197.0, 7.4),
  C('vd-celeb', 'action-celeb.mp4', 203.32, 10.0),
  C('vd-crowd', 'cur-crowd.mp4', 213.0, 31.0),
  C('en-crowd', 'civ-crowd.mp4', 244.0, 11.2),
  C('my-drum', 'mystery-drummaker.mp4', 255.0, 26.5),
  C('app-crowd', 'civ-crowd.mp4', 281.38, 21.8),
  C('cta-celeb', 'action-celeb.mp4', 303.05, 15.2),
];
const bdSrcs = ['stadium.mp4', 'cur-crowd.mp4', 'civ-crowd.mp4', 'action-celeb.mp4'];
let at = 0.0;
for (let i = 0; i <= 66; i++) { clips.push(C(`bd-${i}`, bdSrcs[i % bdSrcs.length], +at.toFixed(2), 5.2)); at += 4.8; }

const out = {
  comment: 'Ep57 Curaçao vs Ivory Coast — ANIMATION-FIRST full-motion. OUR PREDICTION CUR 1-1 CIV (Amad Diallo 31, Leandro Bacuna 63 off Juninho reverse pass). Real player animations full-screen + looping. Unique Higgsfield crowds (cur-crowd blue tambú / civ-crowd orange djembe), stadium, action, mystery-drummaker. Legend 057 The Drummaker. vol=0.',
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
    { src: 'sfx/whoosh.mp3', at: 151.5, vol: 0.7 }, { src: 'sfx/braam.mp3', at: 152.5, vol: 0.85 },
    { src: 'sfx/goal.mp3', at: 154.0, vol: 0.95 }, { src: 'sfx/whoosh.mp3', at: 188.5, vol: 0.7 },
    { src: 'sfx/goal.mp3', at: 190.2, vol: 0.95 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
console.log('clips.json (Ep57 animation-first):', clips.length, 'clips');
