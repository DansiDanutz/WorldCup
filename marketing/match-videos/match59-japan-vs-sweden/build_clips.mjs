// Ep59 Japan vs Sweden — ANIMATION-FIRST. OUR PREDICTION JPN 1-0 SWE
// (Ueda finishes Mitoma's cutback ~60'; keeper denies Gyokeres 85'). Real player
// animations full-screen + looping. Legend 059 The Origami Master.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-stad', 'stadium.mp4', 0.0, 6.2),
  C('cg-gyokeres', 'swe-gyokeres.mp4', 6.0, 6.2),
  C('cg-mitoma', 'jpn-mitoma.mp4', 12.0, 6.4),
  C('cg-crowd', 'jpn-crowd.mp4', 18.0, 5.2),
  C('title-bg', 'swe-crowd.mp4', 23.0, 10.2),
  C('stad-a', 'stadium.mp4', 33.0, 6.0),
  C('stad-b', 'jpn-crowd.mp4', 39.0, 5.2),
  // JAPAN 44-79.5
  C('jpn-crowd-bg', 'jpn-crowd.mp4', 44.0, 11.6),
  C('s-mitoma', 'jpn-mitoma.mp4', 55.5, 5.6),
  C('s-kubo', 'jpn-kubo.mp4', 61.0, 4.1),
  C('s-minamino', 'jpn-minamino.mp4', 65.0, 3.1),
  C('s-ueda', 'jpn-ueda.mp4', 68.0, 5.6),
  C('s-endo', 'jpn-endo.mp4', 73.5, 6.1),
  // SWEDEN 79.5-103
  C('swe-crowd-bg', 'swe-crowd.mp4', 79.5, 11.2),
  C('s-gyokeres', 'swe-gyokeres.mp4', 90.6, 4.5),
  C('s-isak', 'swe-isak.mp4', 95.1, 3.0),
  C('s-elanga', 'swe-elanga.mp4', 98.1, 2.6),
  C('s-lindelof', 'swe-lindelof.mp4', 100.7, 2.4),
  // DUEL 103-132
  C('duel-mitoma', 'jpn-mitoma.mp4', 103.0, 14.6),
  C('duel-gyokeres', 'swe-gyokeres.mp4', 117.6, 14.5),
  // DRAMA 132-203
  C('dr-stad', 'stadium.mp4', 132.0, 8.6),
  C('dr-mitoma', 'action-mitoma-dribble.mp4', 140.5, 9.6),
  C('dr-goal', 'action-japan-goal.mp4', 150.0, 12.1),
  C('dr-blue', 'jpn-crowd.mp4', 162.0, 9.6),
  C('dr-gyokeres', 'swe-gyokeres.mp4', 178.0, 8.1),
  C('dr-save', 'action-keeper-save.mp4', 186.0, 11.6),
  C('dr-celeb', 'action-celeb.mp4', 197.5, 6.9),
  C('vd-celeb', 'action-celeb.mp4', 203.32, 10.0),
  C('vd-crowd', 'jpn-crowd.mp4', 213.0, 31.0),
  C('en-crowd', 'swe-crowd.mp4', 244.0, 11.2),
  C('my-origami', 'mystery-origami.mp4', 255.0, 26.5),
  C('app-crowd', 'jpn-crowd.mp4', 281.38, 21.8),
  C('cta-celeb', 'action-celeb.mp4', 303.05, 15.2),
];
const bdSrcs = ['stadium.mp4', 'jpn-crowd.mp4', 'swe-crowd.mp4', 'action-celeb.mp4'];
let at = 0.0;
for (let i = 0; i <= 66; i++) { clips.push(C(`bd-${i}`, bdSrcs[i % bdSrcs.length], +at.toFixed(2), 5.2)); at += 4.8; }
const out = {
  comment: 'Ep59 Japan vs Sweden — ANIMATION-FIRST. OUR PREDICTION JPN 1-0 SWE (Ueda 60 off Mitoma cutback; keeper denies Gyokeres 85). Real player animations full-screen. Unique Higgsfield crowds (jpn blue taiko / swe yellow viking), stadium, action (japan-goal/mitoma-dribble/keeper-save/celeb), mystery-origami. Legend 059 The Origami Master. vol=0.',
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
console.log('clips.json (Ep59):', clips.length, 'clips');
