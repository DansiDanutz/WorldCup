// Generate clips.json for Ep56 South Africa vs South Korea.
// REAL paid player animations (rsa-*/kor-*), UNIQUE Higgsfield crowds/stadium/
// action/mystery. Drama: GOAL (Foster ~156, RSA 1-0 52') then SAVE (Williams ~191,
// 89', RSA 1-0 holds). Mirrors the Ep55 engine layout; only sources + drama timing change.
import fs from 'node:fs';

const clip = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });

const clips = [
  // cold-open glimpses
  clip('glimpse-stad', 'stadium.mp4', 0.5, 3.5),
  clip('glimpse-bead', 'mystery-beadwork.mp4', 4.0, 4),
  clip('glimpse-son', 'kor-son.mp4', 8.5, 5),
  clip('glimpse-tau', 'rsa-tau.mp4', 13.5, 5),
  // stadium scene
  clip('stadium-ext', 'stadium.mp4', 34, 8),
  clip('stadium-aerial', 'rsa-crowd.mp4', 38, 8),
  // South Africa team scene
  clip('hist-rsa', 'rsa-crowd.mp4', 44, 9),
  clip('rsa-bg', 'rsa-crowd.mp4', 53, 8),
  clip('foster', 'rsa-foster.mp4', 55, 9),
  clip('tau', 'rsa-tau.mp4', 65.62, 8),
  clip('mokoena', 'rsa-mokoena.mp4', 78.03, 5),
  clip('makgopa', 'rsa-makgopa.mp4', 65.12, 4),
  clip('williams', 'rsa-williams.mp4', 69.33, 4),
  // South Korea team scene
  clip('hist-kor', 'kor-crowd.mp4', 83.55, 9),
  clip('kor-bg', 'kor-crowd.mp4', 90.88, 8),
  clip('son', 'kor-son.mp4', 92.15, 9),
  clip('kim', 'kor-kim.mp4', 100.55, 6),
  clip('lee', 'kor-lee.mp4', 107.3, 6),
  clip('hwangib', 'kor-hwangib.mp4', 97.55, 3),
  clip('hwanghc', 'kor-hwanghc.mp4', 94.55, 3),
  // DRAMA — live action footage tiled 132–203
  clip('drama-stad', 'stadium.mp4', 132, 10),
  clip('drama-tau', 'action-tau-cross.mp4', 140.5, 8),
  clip('drama-makgopa', 'action-makgopa-header.mp4', 147.0, 8),
  clip('drama-foster', 'action-foster-goal.mp4', 154.0, 10),
  clip('drama-celeb', 'action-rsa-celeb.mp4', 163.5, 9),
  clip('drama-fill', 'rsa-crowd.mp4', 172.0, 8),
  clip('drama-son', 'kor-son.mp4', 179.5, 8),
  clip('drama-williams', 'action-williams-save.mp4', 187.5, 9),
  clip('drama-end', 'action-rsa-celeb.mp4', 196.5, 8),
  // verdict
  clip('verdict-bg', 'stadium.mp4', 203.32, 9),
  // mystery
  clip('mystery', 'mystery-beadwork.mp4', 256, 8),
  clip('mystery-close', 'mystery-beadwork.mp4', 267, 6),
  // cta
  clip('cta-bg', 'action-rsa-celeb.mp4', 303.05, 9),
];

// Backdrop tiles bd-0..bd-66 — cover the whole 318s so the frame is never black.
// Cycle through the unique atmosphere + player clips (alternating RSA / KOR).
const bdSrcs = [
  'stadium.mp4', 'kor-crowd.mp4', 'rsa-crowd.mp4', 'action-rsa-celeb.mp4', 'mystery-beadwork.mp4',
  'kor-son.mp4', 'rsa-foster.mp4', 'kor-kim.mp4', 'rsa-tau.mp4', 'kor-lee.mp4',
  'rsa-mokoena.mp4', 'kor-hwangib.mp4', 'rsa-makgopa.mp4', 'kor-hwanghc.mp4', 'rsa-williams.mp4',
];
let at = 0.0;
for (let i = 0; i <= 66; i++) {
  clips.push(clip(`bd-${i}`, bdSrcs[i % bdSrcs.length], +at.toFixed(2), 5));
  at += 4.8;
}

// Squad-grid videos (RSA grid ~65.12, KOR grid ~93.38)
for (const [k, src] of [['foster', 'rsa-foster'], ['tau', 'rsa-tau'], ['mokoena', 'rsa-mokoena'], ['makgopa', 'rsa-makgopa'], ['williams', 'rsa-williams']])
  clips.push(clip(`sqx-${k}`, `${src}.mp4`, 65.12, 5));
for (const [k, src] of [['son', 'kor-son'], ['kim', 'kor-kim'], ['hwangib', 'kor-hwangib'], ['lee', 'kor-lee'], ['hwanghc', 'kor-hwanghc']])
  clips.push(clip(`sqz-${k}`, `${src}.mp4`, 93.38, 5));

const out = {
  comment: 'Ep56 South Africa vs South Korea (Group A, 25/06). OUR PREDICTION RSA 1-0 KOR: 52\' Makgopa header parried, Lyle Foster pounces (GOAL, VAR-checked, stands); 89\' Son curls, Ronwen Williams SAVES (no goal, 1-0 holds). ONE goal (Foster) + one heroic SAVE (Williams). REAL paid player animations (rsa-*/kor-*). UNIQUE Higgsfield crowds (rsa-crowd green+gold vuvuzela / kor-crowd red), stadium, action (foster-goal/williams-save/makgopa-header/tau-cross/rsa-celeb), mystery-beadwork — none reused from prior episodes (hash-verified). Legend 056 = The Beadworker (Ndebele). vol=0 on every clip (silent; audio = VO + music + sfx). Brian VO, voice-synced.',
  clips,
  music: {
    cues: [
      { src: 'music/cue-tense.mp3', at: 0, dur: 30, vol: 0.5, fadeIn: 0.5, fadeOut: 3, loop: false },
      { src: 'music/cue-epic.mp3', at: 31.56, dur: 288, vol: 0.4, fadeIn: 2.5, fadeOut: 4, loop: true },
      { src: 'music/cue-heroic.mp3', at: 272, dur: 34, vol: 0.48, fadeIn: 2.5, fadeOut: 3, loop: false },
    ],
  },
  sfx: {
    hits: [
      { src: 'sfx/heartbeat.mp3', at: 0.3, vol: 0.95 },
      { src: 'sfx/heartbeat.mp3', at: 6, vol: 0.8 },
      { src: 'sfx/braam.mp3', at: 11.5, vol: 0.85 },
      { src: 'sfx/whoosh.mp3', at: 22.06, vol: 0.6 },
      { src: 'sfx/stamp.mp3', at: 22.38, vol: 0.6 },
      { src: 'sfx/whoosh.mp3', at: 26.17, vol: 0.55 },
      { src: 'sfx/braam.mp3', at: 44, vol: 0.6 },
      { src: 'sfx/pop.mp3', at: 55, vol: 0.55 },
      { src: 'sfx/whoosh.mp3', at: 79.55, vol: 0.55 },
      { src: 'sfx/pop.mp3', at: 92.15, vol: 0.55 },
      { src: 'sfx/whoosh.mp3', at: 113.25, vol: 0.6 },
      { src: 'sfx/pop.mp3', at: 131.51, vol: 0.55 },
      { src: 'sfx/whoosh.mp3', at: 153.0, vol: 0.7 },
      { src: 'sfx/braam.mp3', at: 154.5, vol: 0.85 },
      { src: 'sfx/goal.mp3', at: 156.5, vol: 0.95 },
      { src: 'sfx/whoosh.mp3', at: 189.5, vol: 0.7 },
      { src: 'sfx/braam.mp3', at: 191.2, vol: 0.9 },
      { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
      { src: 'sfx/pop.mp3', at: 271, vol: 0.7 },
      { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
    ],
  },
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
console.log('clips.json written:', clips.length, 'clips');
