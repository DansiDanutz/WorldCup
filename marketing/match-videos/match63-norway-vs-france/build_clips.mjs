// Ep63 Norway vs France — NO-REPEAT clip timeline (rule #11): every clip used
// EXACTLY ONCE. 30 distinct clips tile 0-318s (all Higgsfield). Title+App on
// gradients. OUR PREDICTION NOR 2-1 FRA (Mbappe ~40', Haaland equalizes, Haaland
// 72' screamer wins it). Rule #16: cold-open Boatbuilder TEASE (cg-mystery-tease),
// payoff in the mystery scene (my-boatbuilder). No 'underdog'.
import fs from 'node:fs';
const C = (id, src, at, dur, vol = 0) => ({ id, src: `assets/${src}`, at, dur, vol });
const clips = [
  C('cg-norfan', 'cg-nor-fan.mp4', 0.0, 5.0), C('cg-frafan', 'cg-fra-fan.mp4', 5.0, 5.0),
  C('cg-tease', 'cg-mystery-tease.mp4', 10.0, 5.0), C('cg-stadaerial', 'stadium-aerial.mp4', 15.0, 8.0),
  C('stad-wide', 'stadium-wide.mp4', 33.0, 11.0),
  C('nor-crowd', 'nor-crowd.mp4', 44.0, 11.5),
  C('s-haaland', 'nor-haaland.mp4', 55.5, 5.6), C('s-odegaard', 'nor-odegaard.mp4', 61.1, 4.0),
  C('s-sorloth', 'nor-sorloth.mp4', 65.1, 3.0), C('s-berge', 'nor-berge.mp4', 68.1, 5.5),
  C('s-ryerson', 'nor-ryerson.mp4', 73.6, 5.9),
  C('fra-crowd', 'fra-crowd.mp4', 79.5, 11.1),
  C('s-mbappe', 'fra-mbappe.mp4', 90.6, 4.6), C('s-saliba', 'fra-saliba.mp4', 95.2, 3.0),
  C('s-tchouameni', 'fra-tchouameni.mp4', 98.2, 2.6), C('s-dembele', 'fra-dembele.mp4', 100.8, 2.4),
  C('duel-nor', 'duel-nor.mp4', 103.0, 10.0), C('duel-mid', 'duel-mid.mp4', 113.0, 9.5), C('duel-fra', 'duel-fra.mp4', 122.5, 9.6),
  C('dr-fra-attack', 'dr-fra-attack.mp4', 132.0, 10.0), C('dr-mbappe-goal', 'dr-mbappe-goal.mp4', 142.0, 10.0),
  C('dr-nor-equalize', 'dr-nor-equalize.mp4', 152.0, 10.0), C('dr-endtoend', 'dr-endtoend.mp4', 162.0, 10.0),
  C('dr-haaland-run', 'dr-haaland-run.mp4', 172.0, 10.0), C('dr-haaland-goal', 'dr-haaland-goal.mp4', 182.0, 11.0),
  C('dr-eruption', 'dr-eruption.mp4', 193.0, 10.4),
  C('vd-respect', 'verdict-respect.mp4', 203.32, 10.7),
  C('en-crowd', 'engage-crowd.mp4', 244.0, 11.0),
  C('my-boat', 'my-boatbuilder.mp4', 255.0, 11.0),
  C('cta-celeb', 'cta-celeb.mp4', 303.05, 11.0),
];
const out = {
  comment: 'Ep63 Norway vs France — NO-REPEAT (rule #11): every clip once, 30 distinct. OUR PREDICTION NOR 2-1 FRA (Mbappe 40, Haaland equalizes, Haaland 72 winner). Legend 063 The Boatbuilder (Norway) teased cold-open + paid off. Real app card artwork in reveal. Title+App gradients. vol=0.',
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
    { src: 'sfx/goal.mp3', at: 148.5, vol: 0.9 }, { src: 'sfx/goal.mp3', at: 159.5, vol: 0.9 },
    { src: 'sfx/whoosh.mp3', at: 188.5, vol: 0.7 }, { src: 'sfx/goal.mp3', at: 191.3, vol: 0.96 },
    { src: 'sfx/braam.mp3', at: 192.0, vol: 0.85 }, { src: 'sfx/mystic.mp3', at: 256, vol: 0.85 },
    { src: 'sfx/pop.mp3', at: 271, vol: 0.7 }, { src: 'sfx/whoosh.mp3', at: 304, vol: 0.6 },
  ]},
};
fs.writeFileSync('clips.json', JSON.stringify(out, null, 2));
const cnt={}; clips.forEach(c=>cnt[c.src]=(cnt[c.src]||0)+1);
console.log('Ep63:', clips.length, 'clips,', Object.keys(cnt).length, 'distinct, reused>1:', Object.entries(cnt).filter(([,k])=>k>1).length);
