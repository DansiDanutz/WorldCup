# WorldCup26 Legends — Episode 4: USA vs Paraguay

300s · 1920×1080 · 30fps · Ep3 pipeline (range server, motion QA, natural-speed
narration), evolved further:

- **True-history hook (verified):** they met at the FIRST World Cup, 1930 — USA
  won 3-0 and Bert Patenaude (age 20) scored the first hat-trick in World Cup
  history… miscredited to an Argentine for 76 years until FIFA fixed it in 2006.
- **Episode innovation — the cliffhanger:** the canon story stops at 78' with
  Enciso 40 yards out. So does the episode: freeze-frame, "WHAT HAPPENS NEXT?",
  and a comment-bait card (COMMENT 1 = stays 1-1 / COMMENT 2 = Enciso scores).
- **Motivated prediction card**: 1-1, with the reasoning rows on screen.
- **Targeted share trigger**: "send this to the friend who doubts American soccer."
- **gen_srt.mjs**: auto-generated YouTube subtitles (`npm run subs` → subtitles.srt).
- Mystery cold open / Legend No. 004: **The Liberty Fan** (torch since 1990).
- All 10 USA/Paraguay character images animated; library reuse: Messi, Davies,
  Ep3 crowd (recap + app cards).

Render: `npm run serve` (port 8096) → `npm run render` → `npm run voice` →
`npm run subs` → `npm run mux`.

## YouTube metadata (suggested)

- **Title:** WorldCup26 USA vs Paraguay | The 1930 Secret America Forgot — FIFA World Cup 2026 Match 4
- **Description hook:** They met at the very first World Cup — and an American
  made history that the record books hid for 76 years. Tonight, the rematch…
  and YOU decide the ending (comment 1 or 2). Pick your 3 teams free at
  https://worldcup26.world
- **Subtitles:** upload `subtitles.srt` alongside the video.
- **Music credit (required):** "Achilles", "Five Armies", "Invariance" — Kevin
  MacLeod (incompetech.com), CC-BY 4.0 — https://creativecommons.org/licenses/by/4.0/
