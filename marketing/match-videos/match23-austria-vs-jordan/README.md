# Episode 23 — Austria vs Jordan

**Group J · real kickoff 07:00, Wed 17 June 2026** · Mystery Supporter: **Legend 023 — the Keeper of the Dream**
Script: `narration.json` · Predicted score (OUR PREDICTION): **Austria 2–1 Jordan**

> Packaging status: narration script ✅, scenes ✅, render ✅ (9,000 frames). VO/mux/thumbnail
> are the downstream steps (built from the Ep2 template: React timeline → Playwright frames →
> ElevenLabs Brian VO → ffmpeg mux). Player stills copied from `content/images` via `npm run fetch-assets`.

## The true-history hook (verified)
The spine is **Jordan's debut fairytale** set against **Austria's never-crowned golden age**:
- **JORDAN (Al-Nashama, "The Brave Ones") are at their FIRST-EVER World Cup in 2026** — 40 years
  after their first qualifying campaign and nine failed attempts. Qualification was confirmed after a
  **3–0 win over Oman** (Ali Olwan hat-trick).
- At the **2023 AFC Asian Cup**, Jordan **stunned South Korea 2–0 in the semifinal** (6 Feb 2024 —
  **Al-Naimat 53', Al-Tamari 66'**) to reach their **first-ever continental final**, then **lost the
  final to Qatar 3–1** (10 Feb 2024; Akram Afif hat-trick of penalties, Al-Naimat scored Jordan's goal).
  Korea were ranked ~60 places above Jordan. Stars: **Musa Al-Tamari & Yazan Al-Naimat**.
- **AUSTRIA** had the legendary 1930s **"Wunderteam"** under coach Hugo Meisl, led by **Matthias
  Sindelar — "the Mozart of Football."** They humbled Europe (6–0 over Germany, 8–1 over Switzerland)
  and reached the **1934 World Cup semifinal**, but **Austria have never won a World Cup.** Today led by
  **David Alaba.**

Sources:
- FIFA — History-making Jordan qualify for first World Cup: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/jordan-qualify
- The-AFC — Jordan stun Korea Republic to reach AFC Asian Cup final: https://www.the-afc.com/en/national/afc_asian_cup/news/super_jordan_stun_korea_republic_to_reach_historical_final_1.html
- ESPN — Jordan 2-0 South Korea (Feb 6, 2024): https://www.espn.com/soccer/match/_/gameId/698417/south-korea-jordan
- Al Jazeera — Qatar keep Asian Cup with 3-1 win over Jordan (Feb 10, 2024): https://www.aljazeera.com/sports/2024/2/11/qatar-keep-afc-asian-cup-trophy-at-home-with-3-1-win-over-jordan
- FIFA — Austria's Wunderteam & Matthias Sindelar (1934 World Cup): https://www.fifa.com/en/tournaments/mens/worldcup/articles/austria-wunderteam-matthias-sindelar-1934
- Wikipedia — Matthias Sindelar: https://en.wikipedia.org/wiki/Matthias_Sindelar

## Title
`The Tiny Kingdom at Its First World Cup | Austria vs Jordan — World Cup 2026 (Ep.23)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 23**.

## Thumbnail
1280×720. Star face: Musa **AL-TAMARI** (JOR, red/white). Hook: **40 YEARS<br>ONE NIGHT**.
Away star: David **ALABA** (AUT). Config entry in `marketing/match-videos/_thumbnail-kit/thumbnails.config.json` (ep 23).
Rebuild: `cd ../_thumbnail-kit && node gen-thumbnails.mjs --ep 23 --install`.

## Shorts (plan)
1. **THEIR FIRST WORLD CUP** — the 40-years / 9-campaigns cold open (post 24h before premiere).
2. **JORDAN 2–0 KOREA** — the 2023 Asian Cup stunner beat (post day-of).
3. **LEGEND 023: THE KEEPER OF THE DREAM** — the mystery-supporter reveal (post day after).

## Predicted scoreline (OUR PREDICTION — never stated as a real result)
**Austria 2–1 Jordan.** Baumgartner opens (Sabitzer assist), Al-Naimat equalises (Al-Tamari assist),
Alaba heads the winner from a corner. Jordan walk off to an ovation.

## Music
"Crossing the Chasm", "Five Armies", "Desert City", "Invariance" — Kevin MacLeod (incompetech.com), CC BY 4.0.

## Build commands
```
npm install
npm run fetch-assets
PORT=8123 node serve.mjs &
URL=http://127.0.0.1:8123/match.html FPS=30 DURATION=300 OUT=frames node render.mjs   # ~9000 frames
# downstream (not run here): npm run voice ; npm run mux  -> WorldCup26_Match23_AUT_JOR.mp4
```
