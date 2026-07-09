// Generate clips.json for Ep56 — ANIMATION-FIRST rebuild.
// Every hero clip gets a FULL-LENGTH window so VideoSprite loops the source for
// the whole segment (no freezing on a static frame). Player animations play
// FULL-SCREEN when each player is named. Action clips full-screen at the beats.
// REAL paid player animations (rsa-*/kor-*) + unique Higgsfield action/crowd/stadium.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });

const clips = [
  // COLD OPEN 0-23 — full-screen bright glimpses, each looping
  C('cg-stad', 'stadium.mp4', 0.0, 6.2),
  C('cg-son', 'kor-son.mp4', 6.0, 6.2),
  C('cg-tau', 'rsa-tau.mp4', 12.0, 6.4),
  C('cg-crowd', 'rsa-crowd.mp4', 18.0, 5.2),
  // TITLE 23-33 — motion behind the flags
  C('title-bg', 'kor-crowd.mp4', 23.0, 10.2),
  // STADIUM 33-44 — full-screen establishing motion
  C('stad-a', 'stadium.mp4', 33.0, 6.0),
  C('stad-b', 'rsa-crowd.mp4', 39.0, 5.2),
  // SOUTH AFRICA 44-79.5 — crowd intro then FULL-SCREEN player animations
  C('sa-crowd', 'rsa-crowd.mp4', 44.0, 11.6),
  C('sa-tau', 'rsa-tau.mp4', 55.5, 5.6),
  C('sa-foster', 'rsa-foster.mp4', 61.0, 4.1),
  C('sa-mokoena', 'rsa-mokoena.mp4', 65.0, 3.1),
  C('sa-makgopa', 'rsa-makgopa.mp4', 68.0, 5.6),
  C('sa-williams', 'rsa-williams.mp4', 73.5, 6.1),
  // SOUTH KOREA 79.5-103 — crowd intro then FULL-SCREEN player animations
  C('kr-crowd', 'kor-crowd.mp4', 79.5, 11.2),
  C('kr-son', 'kor-son.mp4', 90.6, 4.5),
  C('kr-kim', 'kor-kim.mp4', 95.1, 3.0),
  C('kr-lee', 'kor-lee.mp4', 98.1, 2.6),
  C('kr-hwangib', 'kor-hwangib.mp4', 100.7, 2.4),
  // DUEL 103-132 — full-screen animations, Son then Williams
  C('duel-son', 'kor-son.mp4', 103.0, 14.6),
  C('duel-williams', 'rsa-williams.mp4', 117.6, 14.5),
  // DRAMA 132-203 — FULL-SCREEN action footage at every beat
  C('dr-stad', 'stadium.mp4', 132.0, 8.6),
  C('dr-tau', 'action-tau-cross.mp4', 140.5, 7.1),
  C('dr-makgopa', 'action-makgopa-header.mp4', 147.5, 6.1),
  C('dr-foster', 'action-foster-goal.mp4', 153.5, 10.6),
  C('dr-celeb', 'action-rsa-celeb.mp4', 164.0, 9.1),
  C('dr-son', 'kor-son.mp4', 173.0, 7.0),
  C('dr-williams', 'action-williams-save.mp4', 180.0, 16.0),
  C('dr-celeb2', 'action-rsa-celeb.mp4', 196.0, 7.4),
  // VERDICT 203-244 — bright celebration / crowd behind cards
  C('vd-celeb', 'action-rsa-celeb.mp4', 203.32, 10.0),
  C('vd-crowd', 'rsa-crowd.mp4', 213.0, 31.0),
  // ENGAGE 244-255
  C('en-crowd', 'kor-crowd.mp4', 244.0, 11.2),
  // MYSTERY 255-281 — beadwork motion behind the legend card
  C('my-bead', 'mystery-beadwork.mp4', 255.0, 26.5),
  // APP 281-303 — light crowd motion behind promo
  C('app-crowd', 'rsa-crowd.mp4', 281.38, 21.8),
  // CTA 303-318
  C('cta-celeb', 'action-rsa-celeb.mp4', 303.05, 15.2),
];

// Light continuous backdrop so the frame is NEVER black behind a transition.
// Hero clips render at full opacity ON TOP; this is just a safety floor.
const bdSrcs = ['stadium.mp4', 'rsa-crowd.mp4', 'kor-crowd.mp4', 'action-rsa-celeb.mp4'];
let at = 0.0;
for (let i = 0; i <= 66; i++) { clips.push(C(`bd-${i}`, bdSrcs[i % bdSrcs.length], +at.toFixed(2), 5.2)); at += 4.8; }

const out = {
  comment: 'Ep56 SOUTH AFRICA vs SOUTH KOREA — ANIMATION-FIRST rebuild. Real paid player animations play FULL-SCREEN and LOOP for the whole segment they are named (no static images, no freezing). Action clips full-screen at the beats. OUR PREDICTION RSA 1-0 KOR (Foster 52, Williams saves Son 89). Legend 056 The Beadworker. vol=0 (audio = VO+music+sfx).',
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
    { src: 'sfx/whoosh.mp3', at: 153.0, vol: 0.7 }, { src: 'sfx/braam.mp3', at: 154.5, vol: 0.85 },
    { src: 'sfx/goal.mp3', at: 156.5, vol: 0.95 }, { src: 'sfx/whoosh.mp3', at: 189.5, vol: 0.7 },
    { src: 'sfx/braam.mp3', at: 191.2, vol: 0.9 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
console.log('clips.json (animation-first):', clips.length, 'clips');
