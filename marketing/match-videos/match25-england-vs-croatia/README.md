# Episode 25 — England vs Croatia

**Group L · real kickoff 23:00, Wed 17 June 2026** · Mystery Supporter: **Legend 025 — the Ghost of 2018**
Script: `narration.json` · Predicted score (OUR PREDICTION): **England 2–1 Croatia**

> Packaging status: thumbnail entry ✅, narration script ✅, upload pack ✅, frames rendered ✅.
> Built from the Ep15 image-based template (React timeline → Playwright frames →
> ElevenLabs Brian VO → ffmpeg mux). Ken-Burns motion on player stills; no Higgsfield video clips.

## The true-history hook (verified)
On **11 July 2018**, at the **Luzhniki Stadium in Moscow**, England met Croatia in a **World Cup
semi-final**. **Kieran Trippier** curled in a free-kick after **5 minutes** — England 1–0, and
"It's Coming Home" rang out across the world. **Ivan Perišić** equalised on **68'**, and in
**extra time (109')**, **Mario Mandžukić** scored the winner: **Croatia 2–1 England (AET)**.
A nation of barely **four million** reached its **first ever World Cup final** (lost 4–2 to France).
Croatia captain **Luka Modrić** won the **2018 Golden Ball** as player of the tournament — the first
Croatian ever to do so. England's only World Cup win remains **1966**. Croatia's record for a tiny
nation is astonishing: **3rd in 1998** (their debut), **runners-up 2018**, **3rd again in 2022** —
the most decorated small nation in World Cup history.

- Sky Sports — Croatia 2-1 England (AET): https://www.skysports.com/football/croatia-vs-england/385230
- ESPN — Croatia 2-1 England, Jul 11 2018: https://www.espn.com/soccer/match/_/gameId/498141/england-croatia
- BBC — Mandžukić extra-time winner: https://feeds.bbci.co.uk/sport/av/football/44801900
- FIFA — Modrić wins the Golden Ball (2018): https://www.fifa.com/en/articles/100-great-world-cup-moments-qatar-2022-13-modric-croatia-2018-golden-ball
- SI — Modrić Golden Ball: https://www.si.com/soccer/2018/07/15/world-cup-golden-ball-luka-modric-croatia

## Title
`The Tiny Nation That Broke England's Dream | England vs Croatia — World Cup 2026 (Ep.25)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 25**.

## Thumbnail
Star face: **MODRIĆ** (Croatia, red). Away: **BELLINGHAM** (England). Hook: **THEY ENDED<br>THE DREAM**.
Entry in `marketing/match-videos/_thumbnail-kit/thumbnails.config.json` (ep 25).
Rebuild: `cd ../_thumbnail-kit && node gen-thumbnails.mjs --ep 25 --install`.

## Shorts (plan)
1. **THEY ENDED THE DREAM** — the 2018 Moscow semi cold open (post 24h before premiere).
2. **BELLINGHAM, LATE** — the 2-1 winner climax (post day-of).
3. **LEGEND 025: THE GHOST OF 2018** — the mystery-supporter reveal (post day after).

## Build + render
- `npm install` (playwright + ffmpeg-static), `npm run fetch-assets` (music + player stills).
- `npm run serve &` then `FPS=30 DURATION=300 OUT=frames node render.mjs` → ~9000 frames.
- VO/mux are downstream: `npm run voice` (needs ELEVENLABS_API_KEY) then `npm run mux`
  → `WorldCup26_Match25_ENG_CRO.mp4`.

## Music
"Crossing the Chasm", "Five Armies", "Desert City", "Invariance" — Kevin MacLeod (incompetech.com), CC BY 4.0.
