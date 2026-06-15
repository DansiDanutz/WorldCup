# Episode 22 — Iraq vs Norway

**Group I · real kickoff Wed 17 June 2026, 01:00** · Mystery Supporter: **Legend 022 — the Standard-Bearer**
Script: `narration.json` · Predicted score (OUR PREDICTION): **Iraq 1–1 Norway**

> Packaging status: narration script ✅, scene timeline ✅, upload pack ✅. Video render is the
> downstream step (built from the Ep15 template: React timeline → Playwright frames →
> ElevenLabs Brian VO → ffmpeg mux). IMAGE-BASED: Ken-Burns motion on player stills, no
> generated video clips. SOCCER ONLY. The 1–1 is OUR PREDICTION (REAL-RESULTS-ONLY rule).

## The true-history hook (verified)
On **29 July 2007** in Jakarta, a **war-torn Iraq won the AFC Asian Cup** for the first time —
beating Saudi Arabia **1–0** in the final. Captain **Younis Mahmoud** headed the only goal
(around the 72nd–73rd minute, from Hawar Mulla Mohammed's corner). The squad united **Sunni,
Shia and Kurdish** players in one dressing room while the country was at war; their Brazilian
coach **Jorvan Vieira** had been in charge barely two months. The joy carried a wound —
**bombings struck crowds celebrating** in Baghdad (reports of around 50 killed), yet the people
danced anyway. It remains the greatest day in Iraqi football. Handled respectfully.
Secondary "did you know": Iraq midfielder **Zidane Iqbal** (ex-Manchester United) is **named
after Zinedine Zidane**. Norway angle: back at a World Cup for the **first time since 1998**
(a 28-year absence), powered by **Erling Haaland** (their all-time top scorer, 16 goals in
2026 qualifying) and captain **Martin Ødegaard**; Ståle Solbakken's side won all eight
qualifiers, beating Italy home and away.

Sources:
- The National — https://www.thenationalnews.com/sport/football/2024/01/15/when-football-united-a-war-torn-country-recalling-iraqs-fairytale-2007-asian-cup-triumph/
- Al Jazeera — https://www.aljazeera.com/news/2007/7/29/iraq-in-historic-asian-cup-win
- Wikipedia (2007 AFC Asian Cup final) — https://en.wikipedia.org/wiki/2007_AFC_Asian_Cup_final
- The AFC — https://www.the-afc.com/en/more/news/asian_icons_younis_mahmoud_iraq.html
- Zidane Iqbal (Wikipedia + The National) — https://en.wikipedia.org/wiki/Zidane_Iqbal · https://www.thenationalnews.com/sport/football/2025/07/08/zidane-iqbal-man-united-iraq/
- Norway 2026 qualification — https://www.olympics.com/en/news/fifa-world-cup-2026-norway-all-players-full-squad-list-key-stats-and-schedule · https://www.aljazeera.com/sports/2026/5/26/norway-world-cup-2026-preview-players-to-watch-group-matches-squad-list

## Title
`The War-Torn Nation That Became Champions of Asia | Iraq vs Norway — World Cup 2026 (Ep.22)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 22**.

## Thumbnail
1280×720. Star face: Erling **Haaland** (NOR, red) opposite Aymen **Hussein** (IRQ, green).
Hook: **ONE TEAM<br>ONE FLAG**. Entry appended to `_thumbnail-kit/thumbnails.config.json` (ep 22).
Rebuild: `cd ../_thumbnail-kit && node gen-thumbnails.mjs --ep 22 --install`.

## Shorts (plan)
1. **ONE TEAM, ONE FLAG** — the 2007 war-torn-champions cold open (post 24h before premiere).
2. **HAALAND vs THE LIONS** — the goal exchange / 1–1 climax (post day-of).
3. **LEGEND 022: THE STANDARD-BEARER** — the mystery-supporter reveal (post day after).

## Build + render
1. `npm install`  (deps: playwright, ffmpeg-static — node_modules included)
2. `npm run fetch-assets`  (player stills from `content/images/`, Kevin MacLeod music cues)
3. `npm run serve &`  then  `FPS=30 DURATION=300 OUT=frames node render.mjs`  → ~9000 frames
4. VO/mux/thumbnail are downstream (other agents): `npm run voice`, `npm run mux`
   → `WorldCup26_Match22_IRQ_NOR.mp4`

## Music
"Crossing the Chasm", "Five Armies", "Desert City", "Invariance" — Kevin MacLeod (incompetech.com), CC BY 4.0.
