# WorldCup26 Bonus — Erling Haaland: "The Viking Returns"

A 300-second (5-min) Viking-saga motivational film. The red army of the north sails
to conquer England; Haaland vs Kane at "the new Stamford Bridge"; a seer's prophecy,
a father's prayer, and the Ro! Ro! Ro! rowing chant. Brian (cloned narrator voice)
carries the story — NO subtitles, clip-based only, soccer only.

**Output:** `WorldCup26_Bonus_Erling_Haaland.mp4` (1920×1080, 30fps, H.264/AAC)

## The verified history (the hook — rule #9, AUTORESEARCHED)

- **1066 — the Battle of Stamford Bridge.** King Harald Hardrada of Norway ("the last
  great Viking") sailed ~300 ships to conquer England and was killed at Stamford
  Bridge on 25 Sep 1066; the losses were so severe that only **24 ships** of the
  fleet were needed to carry the survivors home. Sources:
  - https://en.wikipedia.org/wiki/Battle_of_Stamford_Bridge
  - https://www.britannica.com/event/Battle-of-Stamford-Bridge
  - https://www.history.co.uk/articles/harald-hardrada-the-last-viking
- **Erling Haaland was born IN England — Leeds, 21 July 2000** — while his father
  **Alf-Inge "Alfie" Haaland** played there. Alfie spent a decade in the Premier
  League (Nottingham Forest, Leeds United, Manchester City); his career was ended
  early by injury (framed respectfully, no names, no blame). Sources:
  - https://en.wikipedia.org/wiki/Erling_Haaland
  - https://en.wikipedia.org/wiki/Alf-Inge_Haaland
- **Norway's first World Cup since 1998** (WC26 qualification).
- "Ro" = Norwegian for "row" — the rowing shout of a longship crew.

## The fiction (labeled OUR STORY / OUR PREDICTION)

The seer/witch, the prophecy, the red-sail voyage, the Wembley "battle of the new
Stamford Bridge", Kane 1–0, Haaland 2–1 — all OUR STORY, said in the VO
("hear our story", "in our story", "our prediction") and watermarked on screen.
The "battle" is FOOTBALL ONLY: ships, rowing, banners and goals — no weapons
combat, no gore. Monetization-safe: free to play, just for fun, no prizes.

## Music (CC-BY 4.0, credit in upload description)

Kevin MacLeod (incompetech.com) — Licensed under Creative Commons: By Attribution 4.0:
- "Ritual" (cue-mystic, cold open / prophecy)
- "Achaidh Cheide" (cue-saga, origins / father)
- "Five Armies" (cue-battle, voyage & battle)
- "Master of the Feast" (cue-feast, victory / close)

## Clips (31+ unique, NO-REPEAT — rule #11)

- 14 reused from the paid library `content/videos/{Norway,England}/` (r01–r14:
  Haaland ×3, Ødegaard ×2, Sørloth, Nusa, Berge, Kane ×2, Bellingham, Rice,
  Foden, Saka).
- 23 generated via Higgsfield MCP (v01–v23): seer/aurora, longship fleet, 1066
  shore, the 24 ships, Leeds birth, father's Premier League battle, unfinished
  dream, Bryne, snow training, prophecy vision, red-army harbor, team rowing
  (Ro! Ro!), father's candle prayer, fortress stadium, kickoff tifo, rain-dread
  face, red wall chanting, net explosion, Viking roar, flag planted, father's
  tears, kids at sunrise, longship into the aurora (outro bookend).
  Job IDs in `higgsfield-jobs.json`.

## Build

```bash
npm install                     # playwright + ffmpeg-static (binary fetched manually)
node gen_audio_higgsfield.mjs   # Brian VO via Higgsfield MCP (see file header)
PORT=8098 node serve.mjs &      # crash-proof static server
FPS=30 DURATION=300 OUT=frames node render.mjs   # 9000 frames via Playwright
OUTFILE=WorldCup26_Bonus_Erling_Haaland.mp4 node mux.mjs
```

## Pre-upload (PREUPLOAD_CHECKLIST.md)

Made for kids = **No** · AI/altered content = **Yes** · music credited ·
no odds/prize wording · prediction labeled · soccer only · no subtitles.
