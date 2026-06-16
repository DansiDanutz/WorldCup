# Episode 19 — Saudi Arabia vs Uruguay

**Group H · real kickoff Tue 16 June 2026, 01:00** · Mystery Supporter: **Legend 019 — the Ghost of the Maracanã**
Script: `narration.json` · Predicted score (OUR PREDICTION): **Saudi Arabia 1–2 Uruguay**

> Packaging status: narration script ✅, render project ✅, upload pack ✅. Downstream
> steps (run centrally): Brian VO (`npm run voice`) → mux (`npm run mux`) → thumbnail.
> Built on the Ep15 template: React timeline → Playwright frames → ElevenLabs Brian VO → ffmpeg mux.

## The true-history hook (verified)
Uruguay — a nation of just **~3.4 million** — won the **very first World Cup ever** (1930, as
hosts, beating Argentina **4–2** in the Montevideo final). Twenty years later came the
**Maracanazo**: on **16 July 1950** at the Maracanã in Rio, Brazil needed only a draw and had
already printed victory newspapers, but Juan Schiaffino equalised and **Alcides Ghiggia**
scored the **79th-minute winner (2–1)** in front of a crowd of **~200,000 (official 173,850)** —
the largest attendance in football history. Ghiggia's line: *"Only three people have ever
silenced the Maracanã with a single gesture — Frank Sinatra, the Pope, and me."* Uruguay hold
**2 World Cups + 15 Copa Américas** (joint record).
Counter-story (the away side knows how to shock): **Saudi Arabia beat Messi's Argentina 2–1**
at the 2022 World Cup (22 Nov 2022), **Salem Al-Dawsari** scoring the winner.

### Sources
- Uruguay v Brazil (1950 WC), attendance + winner — https://en.wikipedia.org/wiki/Uruguay_v_Brazil_(1950_FIFA_World_Cup)
- FIFA — Uruguay's stunning upset of Brazil (1950) — https://www.fifa.com/en/tournaments/mens/worldcup/articles/uruguay-brazil-1950-maracanazo
- Guinness World Records — largest match attendance (1950) — https://www.guinnessworldrecords.com/news/2014/6/world-cup-rewind-world-cup-rewind-largest-attendance-at-a-match-in-the-1950-brazil-final
- Ghiggia "Frank Sinatra / the Pope / me" quote — https://www.si.com/soccer/2018/02/24/world-cup-countdown-17-weeks-go-alcides-ghiggia-man-who-silenced-maracana
- 1930 FIFA World Cup final (Uruguay 4–2 Argentina) — https://en.wikipedia.org/wiki/1930_FIFA_World_Cup_final
- Saudi Arabia 2–1 Argentina, Al-Dawsari winner — https://www.skysports.com/football/news/11095/12752965/world-cup-2022-argentina-1-2-saudi-arabia-salem-al-dawsari-scores-winner-as-lionel-messi-penalty-is-cancelled-out-by-famous-second-half-comeback

## Title
`Did You Know 3 Million People Silenced 200,000? | Saudi Arabia vs Uruguay — World Cup 2026 (Ep.19)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 19**.

## Thumbnail
1280×720. Feature face: Federico **VALVERDE** (URU, sky blue) — the story-rich side. Hook:
**THE SMALLEST<br>GIANT**. Away inset star: Salem **AL-DAWSARI** (KSA, green). Marquee: BRA.

## Mystery Supporter — Legend 019
**The Ghost of the Maracanã** — a boy who was in that 1950 crowd; he still carries the silence
that followed Ghiggia's goal, and brings it back to every Uruguay match. Collect him in-game.

## Predicted score (OUR PREDICTION)
**Saudi Arabia 1–2 Uruguay** — Al-Dawsari curls Saudi ahead; Núñez levels off a Valverde win;
Araújo heads in a de Arrascaeta free kick. (A prediction, never a real result.)

## Shorts (plan)
1. **THE MARACANAZO** — the 1950 cold-open hook (post 24h before premiere).
2. **THEY BEAT MESSI** — Al-Dawsari's Saudi-shocks-Argentina angle (post day-of).
3. **LEGEND 019: THE GHOST OF THE MARACANÃ** — the mystery reveal (post day after).

## Music
"Crossing the Chasm", "Five Armies", "Desert City", "Invariance" — Kevin MacLeod
(incompetech.com), CC BY 4.0.

## Build / render commands
```
npm install
npm run fetch-assets          # copies the 10 player PNGs + downloads the 4 music cues
npm run serve &               # range-capable static server on :8098
FPS=30 DURATION=300 OUT=frames node render.mjs   # ~9000 frames
# downstream (run centrally): npm run voice ; npm run mux  -> WorldCup26_Match19_KSA_URU.mp4
```
