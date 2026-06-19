# WorldCup26 Legends — Episode 33: Scotland vs Morocco

**Group C · Matchday 2 · real kickoff ~Sat 20 Jun 2026, 01:00** (fixtures grid the owner shared).
Clip-based, Ep6 gold standard. Brian (ElevenLabs) narration. **No subtitles.** Soccer only.
**OUR PREDICTION: 0–0** (decided by two impossible saves). Legend 033 = the Ghost of Goal Difference.

## The hook (mystery + history) — web-verified

Two proud nations bound by **glorious near-misses**:

- **Scotland, 1974 (West Germany):** came home the **only unbeaten team** in the tournament
  yet were **eliminated in the group on goal difference** — the **first nation ever knocked
  out of a World Cup finals without losing a match** (beat Zaire 2–0, drew Brazil 0–0, drew
  Yugoslavia 1–1). Perfection punished by arithmetic.
  Sources: [Celtic FC](https://www.celticfc.com/news/6052),
  [SPFL](https://spfl.co.uk/news/a-summer-of-great-frustration-remembered-40-years-on).
- **Morocco, 2022 (Qatar):** the **first African nation ever to reach a World Cup semifinal**,
  finished **fourth** — the best finish by any African or Arab nation; knocked out Spain on
  penalties and beat Portugal on the way.
  Sources: [Olympics.com](https://www.olympics.com/en/news/fifa-world-cup-2022-morocco-results-scores-and-standings),
  [ESPN](https://www.espn.com/soccer/story/_/id/37634972/morocco-receives-triumphant-homecoming-historic-fourth-place-2022-world-cup-qatar).

**Legend 033 — the Ghost of Goal Difference:** the spectral supporter who haunts every team
that did everything right and still went home. Opened in the cold open (two ghosts — a Tartan
'74 spirit and an Atlas Lion of '22), paid off at the Mystery Supporter reveal.

## Recap of the previous episode (REAL-RESULTS-ONLY rule)
Ep32 ending is **OUR PREDICTION** — "last time, we predicted the USA would edge Australia
two–one." Never stated as a real result.

## Suggested upload pack
- **Title:** `WorldCup26 Scotland vs Morocco | The Team That Never Lost… And Still Went Home — FIFA World Cup 2026 (Ep.33)`
- **Thumbnail:** mystery face (the Ghost of Goal Difference), Scotland blue vs Morocco red, ≤4 words: **"NEVER LOST. STILL OUT."**
- **Description:**
  > In 1974, Scotland went to the World Cup and never lost a game — and still came home.
  > In 2022, Morocco came within one step of immortality. Tonight the Tartan Army meets the
  > Atlas Lions, and two nations who know glorious heartbreak collide.
  > Our prediction inside. 👇
  >
  > ▶ Pick 3 of the 48 nations, free to play, just for fun — climb the leaderboard (no prizes): https://worldcup26.world
  >
  > Chapters:
  > 0:00 The two ghosts
  > 0:54 The true history — Scotland '74 & Morocco '22
  > 2:30 Scotland · the Tartan Army
  > 2:58 Morocco · the Atlas Lions
  > 3:15 The duel
  > 3:33 Our prediction
  > 4:26 Legend 033 — the Ghost of Goal Difference
  > 4:44 Play free at worldcup26.world
  >
  > Music: AI-generated original score (Higgsfield Sonilo). #WorldCup2026 #Scotland #Morocco
- **Comment bait (pinned):** "Comment SCOTLAND if the Tartan Army hold firm — or MOROCCO if the Atlas Lions break through. Our story: 0–0, two saves nobody forgets. 👁️"

## Monetization-safe checks (PREUPLOAD_CHECKLIST.md)
- [ ] Made for kids: **No, not made for kids**
- [ ] AI disclosure: **Altered or synthetic content** = Yes
- [ ] No prize wording (free to play, just for fun, no prizes)
- [ ] Cleared music (AI-generated original — no third-party claim)
- [ ] Non-affiliation line in description

## Production notes
- **Engine:** clip-based VideoSprite timeline (300s), Playwright frame render → ffmpeg mux.
- **Animations (Higgsfield Kling 3.0 Turbo, text→video):** ghosts ×2, stadium, crowds
  (Tartan Army + Atlas Lions × hopeful/anxious/jubilant), two keeper saves, history '74/'22,
  corner, full-time handshake, Legend 033. Job IDs in `fal-jobs.json`.
- **Player animations:** reused from `content/videos/{Scotland,Morocco}` (5 each).
- **VO:** Brian (`nPczCjzI2devNBz1zQrb`), `eleven_multilingual_v2`, 30 lines → `audio/line_NN.mp3`.
- **Music/SFX:** AI-generated (Higgsfield Sonilo music; ElevenLabs sound-design SFX).
- **Output:** `WorldCup26_Match33_SCO_MAR_upload.mp4`.
