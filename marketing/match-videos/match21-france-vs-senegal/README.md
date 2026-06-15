# Episode 21 — France vs Senegal

**Group I · real kickoff Tue 16 June 2026, 22:00** · Mystery Supporter: **Legend 021 — the Dancing Lion**
Canon: `content/Stories/France-vs-Senegal.md` · Script: `narration.json` · Predicted score (OUR PREDICTION): **France 2–1 Senegal**

> Packaging status: narration script ✅, render project ✅, thumbnail/upload pack tracked separately.
> Video render is built from the Ep2/Ep15 template (React timeline → Playwright frames →
> ElevenLabs Brian VO → ffmpeg mux). This episode is IMAGE-BASED: Ken-Burns motion on the
> player stills in `content/images/` (no generated video clips).

## The true-history hook (verified)
On **31 May 2002**, in the **opening match of the World Cup** at Seoul, debutants **Senegal beat the
reigning world champions France 1–0** — one of the greatest upsets in the tournament's history.
**Papa Bouba Diop** scrambled the only goal home around the half-hour after a low cross from El Hadji
Diouf and a panic in the French defence, then laid his shirt on the corner flag while the whole team
danced around it — an iconic World Cup celebration. Senegal went on to reach the **quarter-finals**;
France, the holders, **crashed out in the group stage without scoring a single goal** — the only
defending champions ever to fail to score while defending the title. Papa Bouba Diop **died on
29 November 2020, aged 42, of ALS** (motor neurone disease). Secondary hook: Senegal won their
**first-ever AFCON in 2022**, beating Egypt on penalties — Sadio Mané scored the winning spot-kick.
The episode honours Bouba Diop and the spirit of 2002 respectfully.

- FIFA — https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-upsets-france-senegal
- FIFA (the dance) — https://www.fifa.com/en/articles/papa-bouba-diop-celebration-senegal-2002
- ESPN (final score) — https://www.espn.com/soccer/match/_/gameId/46457/senegal-france
- beIN SPORTS (France scored 0 goals as holders) — https://www.beinsports.com/en-us/soccer/fifa-world-cup-2026/articles/france-s-failure-in-2002-the-world-champion-that-arrived-as-the-favorite-was-eliminated-in-the-group-stage-and-became-the-only-defending-champion-unable-to-score-a-single-goal-2026-06-04
- CNN (Bouba Diop death) — https://www.cnn.com/2020/11/30/football/papa-bouba-diop-senegal-world-cup-death-spt-intl/index.html
- CBS Sports (2022 AFCON, Mané winning penalty) — https://www.cbssports.com/soccer/news/afcon-2022-schedule-scores-standings-live-stream-results-nigeria-cruise-mohamed-salah-rescues-egypt

## Title
`The Debutants Who Knocked Out the Champions | France vs Senegal — World Cup 2026 (Ep.21)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 21**.

## Thumbnail
Star face: Sadio **Mané** (SEN, green). Away star: Kylian **Mbappé** (FRA). Hook: **THEY STUNNED<br>FRANCE**.
Rebuild: `cd ../_thumbnail-kit && node gen-thumbnails.mjs --ep 21 --install`.

## Shorts (plan)
1. **THEY STUNNED THE CHAMPIONS** — the 2002 Seoul cold open / Bouba Diop dance (post 24h before premiere).
2. **MBAPPÉ — LATE WINNER** — the 2-1 climax (post day-of).
3. **LEGEND 021: THE DANCING LION** — the mystery-supporter reveal (post day after).

## Build + render
1. `npm install`
2. `npm run serve &` then `FPS=30 DURATION=300 OUT=frames node render.mjs` → ~9000 frames
3. `npm run voice` (ElevenLabs Brian) then `npm run mux` → `WorldCup26_Match21_FRA_SEN.mp4`
4. Media restore: `npm run fetch-assets` (music cues + player stills from `content/images/`)

## Music
"Crossing the Chasm", "Desert City", "Five Armies", "Invariance" — Kevin MacLeod (incompetech.com), CC BY 4.0.
