# WorldCup26 Legends — Episode 7: Brazil vs Haiti

300s · 1920×1080 · 30fps · Ep6 pipeline (range server :8093, motion QA,
natural-speed narration, ChapterBar + ComingUp + speed-ramp), evolved further:

- **True-history hook (verified):** Munich 1974 — Haiti, the first Caribbean
  nation ever at a World Cup, scores through Emmanuel Sanon and ends Dino
  Zoff's 1,142-minute international clean-sheet record, still the longest in
  football history. Italy won 3-1; nobody remembers that part.
- **The human hook:** Duckens Nazon — discovered by a scout while stacking
  supermarket shelves, now leading Haiti's World Cup attack.
- **Episode innovations:**
  - **ReactionPiP** — broadcast-style live fan-reaction picture-in-picture box
    in the corner during the goal cascade ("BRAZIL ERUPTS" + red live dot).
  - **First multi-goal ScoreBug ladder** of the series: 0-0 → 1-0 → 2-0 → 3-0
    → 3-1 with minute stamps and three rapid GoalFlash hits (VINI! NEYMAR!
    RAPHINHA!) before the silence sets up Nazon.
  - **Nazon speed-ramp:** stoppage-time run at rate 0.4 for 18s, hard snap to
    1.0 on the top-corner finish, stacked heartbeats under the slow section.
  - **New music identity:** Haitian drum heartbeat ("Drums of the Deep") vs
    Brazilian samba ("Samba Isobel").
- **NEW paid library content:** 5 Haiti player animations generated and
  archived to `content/videos/Haiti/` (Nazon, Etienne Jr, Placide, Arcus,
  Alceus). Brazil clips + crowds reused from Ep5; Messi/Son/Ep6-joy reused.
- **Mystery Supporter — Legend No. 008:** Le Tambouyé de 74, the drummer whose
  rhythm has not stopped since 1974 (portrait archived to
  `content/images/Supporters/Haiti/`).
- **Motivated prediction:** BRA 4—1 HAI (Vini 23', Neymar 34' & 72', Raphinha
  41', NAZON 45+2), labeled OUR PREDICTION on every plate.
- **Comment bait:** SAMBA (Brazil win the Hexa) vs SPIRIT (Nazon's goal =
  moment of the tournament).
- **Targeted share trigger:** "send this to the friend who stopped believing
  in miracles."

Render: `npm run serve` (port 8093) → `npm run render` → `npm run voice` →
`npm run subs` → `npm run mux` → `node gen_shorts.mjs <master>`.

## YouTube metadata (suggested)

- **Title:** WorldCup26 Brazil vs Haiti | The Supermarket Worker Who Shocked Brazil — FIFA World Cup 2026 Match 7
- **Description hook:** In 1974, Haiti ended the longest unbeaten run in
  goalkeeping history. 52 years later they're back — against the five-time
  champions — and a striker who was discovered stacking supermarket shelves
  writes the next chapter. Comment SAMBA or SPIRIT. Pick your 3 teams free at
  https://worldcup26.world (underdogs pay triple — Haiti pays x3).
- **Subtitles:** upload `subtitles.srt` alongside the video.
- **Music credit (required):** "Drums of the Deep", "Samba Isobel",
  "Five Armies", "Invariance" — Kevin MacLeod (incompetech.com), CC-BY 4.0 —
  https://creativecommons.org/licenses/by/4.0/
