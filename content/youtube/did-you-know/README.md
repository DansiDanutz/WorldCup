# "Did You Know?" — WorldCup26 Legends Shorts

Finished, ship-ready vertical Shorts. Each is a complete **DRAMA → IDOL** mini-film
(~50s, portrait 9:16, Brian VO, designed HyperFrames cards, dark cinematic Pixar visuals)
that advertises **worldcup26.world** legendary cards — never the channel.

Story bank + spec: [`../DID_YOU_KNOW_SHORTS.md`](../DID_YOU_KNOW_SHORTS.md)
Shorts standard (DRAMA→IDOL, the 1-minute WOW): see project `CLAUDE.md`.

## Catalogue

| # | Short | Player | Hook | Length | Status |
|---|-------|--------|------|--------|--------|
| 01 | [The Vanished Hero](01-gaetjens-the-vanished-hero/) | Joe Gaetjens | Beat England, then vanished forever (1950 / 1964) | ~52s | ✅ Done |
| 02 | [The Joy of the People](02-garrincha-the-joy-of-the-people/) | Garrincha | Won the World Cup on broken legs (1962) | ~50s | ✅ Done |
| 03 | [The Eternal Keeper](03-carbajal-the-eternal-keeper/) | Antonio Carbajal | Became a keeper to hide from his father · first to 5 World Cups | ~50s | ✅ Done |
| 04 | [The Doctor](04-socrates-the-doctor/) | Sócrates | Doctor-philosopher captain who foretold the exact day he'd die (1982 / 2011) | ~50s | ✅ Done |
| 05 | [The Dancing Lion](05-milla-the-dancing-lion/) | Roger Milla | A president's decree dragged a 38-yo retiree to Italia '90 · oldest WC scorer | ~50s | ✅ Done |
| 06 | [The First Goal](06-laurent-the-first-goal/) | Lucien Laurent | Scored the first-ever World Cup goal (1930) · a Peugeot factory worker · lived to 97 to see France '98 | ~50s | ✅ Done |
| 07 | [The Gentleman](07-escobar-the-gentleman/) | Andrés Escobar | Killed after an own goal at USA '94 · "El Caballero del Fútbol" (reverent tribute) | ~50s | ✅ Done |
| 08 | [The Black Spider](08-yashin-the-black-spider/) | Lev Yashin | Only goalkeeper ever to win the Ballon d'Or (1963) · almost became an ice-hockey star | ~50s | ✅ Done |
| 09 | [Two Nations](09-monti-two-nations/) | Luis Monti | The only man to play World Cup finals for TWO different nations (Argentina '30, Italy '34) | ~50s | ✅ Done |
| 10 | [Eyes of a Champion](10-tostao-eyes-of-a-champion/) | Tostão | Nearly went blind before 1970 · won the WC with the greatest team · gave his medal to his eye doctor · became a doctor | ~50s | ✅ Done |

## Per-Short folder layout
```
NN-player-slug/
├── dyk_<player>_wc26.mp4     # final, ship-ready video
├── script.md                # title, Brian VO, on-screen labels, sources, monetization, rebuild
└── assets/
    ├── images/              # source stills (hero + beats + card)
    ├── audio/               # VO, BGM, narration master (+ vo_script.txt)
    ├── clips/               # image→video animation clips
    └── composition/         # HyperFrames index.html + bg.mp4 + card.png + brand-mark
```

## Hard rules (every Short)
- **DRAMA → IDOL** arc; real, **verified** "Did you know?" hook with cited sources (rule #9).
- **NO on-screen sentence text** — designed HyperFrames cards + labels only (rule #10).
- **100% AI Pixar visuals, soccer-only, no logos/real footage** (rules #5/#11); character-locked.
- **Brian VO** carries the story; cleared/original music only (rule #4).
- **Advertise worldcup26.world** (legendary cards), not "@DansLab".
- Monetization-safe: made-for-kids = NO, AI disclosure = YES, no betting/odds (rule #0).

## Pipeline (current best — "same style, better quality")
imagine.art `nano-banana-pro` (character-locked images) → `seedance-2.0` 1080p (image→video) →
ffmpeg slow-mo beat assembly → ElevenLabs Brian (`eleven_multilingual_v2`) +
imagine.art original score (sidechain-ducked, −16 LUFS) → HyperFrames designed cards → mux.

## Next up (from the bank, in order)
06 — Lucien Laurent (first WC goal, a factory worker who took unpaid leave to sail to Uruguay) ·
07+ — Lev Yashin, Mordechai Spiegler, Carlos Caszely, Matthias Sindelar… (runway in the bank).
