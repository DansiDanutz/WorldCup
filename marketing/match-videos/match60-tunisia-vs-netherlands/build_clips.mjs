// Ep60 Tunisia vs Netherlands — NO-REPEAT clip timeline (CLAUDE.md rule #11).
// EVERY clip is used EXACTLY ONCE — no reuse, no dimmed backdrop tile layer, no
// looping a short clip across a long window. ~30 distinct clips tile 0–318s: 9 real
// player animations (5-6s) + 21 unique Higgsfield clips (mostly 10s). Title + App
// scenes render on gradients (no footage). OUR PREDICTION NED 1-0 TUN.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });

const clips = [
  // COLD OPEN 0-23 (4 distinct)
  C('cg-tunfan', 'cg-tun-fan.mp4', 0.0, 5.0),
  C('cg-nedfan', 'cg-ned-fan.mp4', 5.0, 5.0),
  C('cg-ball', 'cg-ball.mp4', 10.0, 5.0),
  C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  // TITLE 23-33 = gradient (no clip)
  // STADIUM 33-44
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  // TUNISIA 44-79.5 (crowd + 5 players)
  C('tun-crowd', 'tun-crowd.mp4', 44.0, 11.5),
  C('s-skhiri', 'tun-skhiri.mp4', 55.5, 5.6),
  C('s-achouri', 'tun-achouri.mp4', 61.1, 4.0),
  C('s-mejbri', 'tun-mejbri.mp4', 65.1, 3.0),
  C('s-talbi', 'tun-talbi.mp4', 68.1, 5.5),
  C('s-bronn', 'tun-bronn.mp4', 73.6, 5.9),
  // NETHERLANDS 79.5-103 (crowd + 4 players)
  C('ned-crowd', 'ned-crowd.mp4', 79.5, 11.1),
  C('s-dejong', 'ned-dejong.mp4', 90.6, 4.6),
  C('s-gakpo', 'ned-gakpo.mp4', 95.2, 3.0),
  C('s-depay', 'ned-depay.mp4', 98.2, 2.6),
  C('s-vandijk', 'ned-vandijk.mp4', 100.8, 2.4),
  // DUEL 103-132 (3 distinct)
  C('duel-tun', 'duel-tun.mp4', 103.0, 10.0),
  C('duel-mid', 'duel-mid.mp4', 113.0, 9.5),
  C('duel-ned', 'duel-ned.mp4', 122.5, 9.6),
  // DRAMA 132-203.32 (7 distinct)
  C('dr-ned-attack', 'dr-ned-attack.mp4', 132.0, 10.0),
  C('dr-goal', 'dr-gakpo-goal.mp4', 142.0, 10.0),
  C('dr-ned-celeb', 'dr-ned-celeb.mp4', 152.0, 10.0),
  C('dr-orange', 'dr-orange-react.mp4', 162.0, 10.0),
  C('dr-tun-attack', 'dr-tun-attack.mp4', 172.0, 10.0),
  C('dr-block', 'dr-vandijk-block.mp4', 182.0, 11.0),
  C('dr-defiance', 'dr-tun-defiance.mp4', 193.0, 10.4),
  // VERDICT 203.32-244 (1 clip + recap card covers the rest)
  C('vd-shirtswap', 'verdict-shirtswap.mp4', 203.32, 10.7),
  // ENGAGE 244-255
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  // MYSTERY 255-281 (1 clip + flip card covers the rest)
  C('my-mosaic', 'mystery-mosaic.mp4', 255.0, 11.0),
  // APP 281.38-303 = gradient (no clip)
  // CTA 303.05-318
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];

const out = {
  comment: 'Ep60 Tunisia vs Netherlands — NO-REPEAT (rule #11): every clip used exactly once, ~30 distinct clips, no backdrop reuse, no looping. OUR PREDICTION NED 1-0 TUN (Gakpo 35, Van Dijk blocks Achouri 88). Legend 060 The Mosaic Master (Tunisia). Title+App on gradients. vol=0.',
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
// reuse audit
const cnt = {}; clips.forEach(c => cnt[c.src] = (cnt[c.src] || 0) + 1);
const reused = Object.entries(cnt).filter(([, k]) => k > 1);
console.log('Ep60 clips.json:', clips.length, 'clips |', Object.keys(cnt).length, 'distinct | reused>1:', reused.length ? reused : 'NONE');
