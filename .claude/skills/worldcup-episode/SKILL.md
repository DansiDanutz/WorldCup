---
name: worldcup-episode
description: >-
  Produce or rebuild a WorldCup26 Legends match episode (or a "WorldCup26 Bonus -
  <Player>" player drama film) to the Ep6 GOLD STANDARD. Use whenever building,
  rendering, re-rendering, or fixing any episode/player film. Covers the clip-based
  Higgsfield/fal animation pipeline, Brian VO, the NO-SUBTITLES rule, the cinematic
  technique set, and the crash-proof managed-task render that actually completes in
  this sandbox. Gold reference: marketing/match-videos/match06-argentina-vs-algeria.
---

# WorldCup26 episode production (Ep6 gold standard)

Reverse-engineered from **Ep6 — Argentina vs Algeria** (`match06-argentina-vs-algeria/`),
the highest-quality episode. Read `CLAUDE.md` rules #6–#11 and
`content/youtube/EPISODE_PRODUCTION_STANDARD.md` first; this skill is the HOW.

## 0. Non-negotiables (reject the render if any fail)
- **CLIP-BASED ONLY** — `clips.json` `clips[]` is non-empty (~25–34) of real VIDEO
  clips. NEVER Ken-Burns stills / `clips: []` / a photo slideshow.
- **NO SUBTITLES / NO sentence text on screen** (rule #10). Strip every `line=` on
  LowerThird, `note=` on HistoryPlate, and any narration paragraph `<div>`. Only
  allowed furniture: title card, ≤4-word section labels, player NAME labels, the
  score bug, the "OUR PREDICTION" watermark, the worldcup26.world CTA.
- **Brian VO** (ElevenLabs voice id `nPczCjzI2devNBz1zQrb`, model `eleven_multilingual_v2`).
- **Soccer only** (round-neck shirts, pitch with goals; NO helmet/pads/gridiron).
- **Real-results-only**: scorelines are OUR PREDICTION, never stated as fact.
- Player drama films are named **`WorldCup26 Bonus - <Player Name>`** (title card,
  outro VO, output filename).

## 1. The Ep6 quality bar — what makes it "perfection"
1. **Mystery-FIRST cold open** — open on the animated Mystery Supporter(s) in the
   first ~30s (Ep6 used TWO ghosts). Hook = mystery + verified history.
2. **Both teams' star players ANIMATED** (image→video), plus **fan crowds in
   distinct emotional states** (hopeful / anxious / jubilant), **stadium**, and the
   **animated Mystery Supporter** — supporters & story are the SUBJECT.
3. **ChapterBar** progress pill with chapter labels (open loop, holds retention).
4. **"Coming up" flash (~37s)** — a 2–3s flash of the climax (the mid-roll promise).
5. **Speed-ramp climax** — slow-mo dread (rate ~0.35) then a hard snap to rate 1.0.
6. **FilmGrain** overlay on the drama act; Vignette + Letterbox throughout.
7. **Motivated OUR PREDICTION card**, comment bait, a named share trigger.
8. Reuse the paid clip library first — Ep6 did ZERO new player generations.

## 2. Assets — reuse first, then generate
- **Reuse:** `content/videos/<Team>/`, prior-episode `assets/`, and the per-episode
  `jobs-manifest.json` (re-fetch with `npm run fetch-assets`).
- **Generate what's missing.** Higgsfield MCP is the canonical tool, BUT it
  IP-blocks this sandbox ("IP detected") — so use **fal.ai** (needs `FAL_KEY`):
  - Player shots = **image→video** from `content/images/<Team>/<Player>.png`. Feed
    the **public GitHub raw URL** (`https://raw.githubusercontent.com/DansiDanutz/WorldCup/main/content/images/<Team>/<file>.png`)
    as `image_url` to `fal-ai/kling-video/v1.6/standard/image-to-video`.
  - Crowds / stadium / mystery-supporter = **text→video** Pixar-style via
    `fal-ai/kling-video/v1.6/standard/text-to-video`.
  - POST to `https://queue.fal.run/<model>` (`Authorization: Key $FAL_KEY`,
    `{prompt, image_url?, duration:"5", aspect_ratio:"16:9"}`) → poll
    `…/requests/<id>/status` → GET `…/requests/<id>` → download `video.url`.
  - Save into the episode `assets/<name>.mp4` and write a `fal-jobs.json` manifest.
- Engine: `VideoSprite`/`ClipSprite` in `match-kit.jsx` plays clips frame-exact
  (the renderer waits on `window.__videosSettled`). Copy match-kit/animations/
  match.html/render.mjs/serve.mjs/mux.mjs from a clip-based episode for new projects.

## 3. Script + VO
- Script = `narration.json` (~30 short lines, `at` timings, spelled-out numbers for
  TTS). Use the LOCKED prompt in `PRODUCTION_ACCELERATION.md` fix #4 (≤7s hook,
  mystery+history, prediction labeled, CTA "free to play, no prizes").
- VO: per-line `audio/line_NN.mp3` via ElevenLabs (`gen_audio.mjs` or a fetch loop).
  Set the key as an ENV var (`ELEVENLABS_API_KEY=… node …`), not an arg.

## 4. clips.json + scenes (clip-based)
- `clips.json`: `clips[]` (id/src/at/dur/vol/rate placements — reuse one source mp4
  across many windows like Ep6), plus `music.cues` (Kevin MacLeod CC-BY, credit it)
  and `sfx.hits`.
- `match-scenes.jsx`: use `VideoSprite`/`ClipSprite`, NOT `<img>`/`KenBurns`. Verify
  with: `grep -c 'KenBurns src=\"assets/player' scene` → must be 0; `grep ' line=\"'`
  and `' note=\"'` → must be 0.

## 5. RENDER — the part that bites (lessons learned the hard way)
- **Server crashes on aborted video range requests** → use the crash-proof
  `serve.mjs` (guards stream/socket errors + `uncaughtException`). Already fixed in
  the episode folders; copy it to any new project.
- **Run the render as a HARNESS-MANAGED background task** (`run_in_background: true`).
  **Do NOT `nohup`-detach** — this sandbox reaps detached processes between turns,
  which silently kills long renders mid-way. The managed task survives (it ran the
  first 9000-frame Ep22 render to completion; the nohup ones all died ~frame 6k).
- Pipeline per project dir:
  `PORT=<p> node serve.mjs &` → wait for `curl localhost:<p>` →
  `FPS=30 DURATION=300 OUT=frames node render.mjs` (1920×1080, 9000 frames, ~70 min
  solo) → `node mux.mjs` (places VO at `at` times + music ducked → MP4).
  For a player film: `OUTFILE=WorldCup26_Bonus_<Player>.mp4 node mux.mjs`.
- **Resume, don't restart:** render.mjs honors `START=<frame>` — if interrupted,
  resume from the last good frame instead of re-rendering 0.
- Render two in parallel only on a 4-core box (serve on distinct ports 8098/8101);
  for speed, prefer SOLO (each ~70 min vs ~2×90 min shared).
- Validate cheaply first: a SEQUENTIAL smoke (`FPS=2 DURATION=50`) — confirm frames
  are non-black. (A `SHOTS=` jump-around smoke shows false black because videos
  don't preload — not a real failure.)
- **VO↔SCENE ALIGNMENT GATE (mandatory before EVERY mux — the Ep33 lesson):** the
  narration `at` times MUST line up with the scene windows in `match.html`, or the
  words describe things the viewer hasn't reached yet (Ep33 v1 named the squad players
  at t≈124s while the 1974/2022 history montage was still on screen — squad scene
  doesn't start until 150s). Run `node scripts/check-vo-alignment.mjs <epDir>` — it
  FAILS on any VO line that overruns the next line or runs past 300s, and prints the
  scene each line lands in so you can confirm squad lines are in *Squad, save lines in
  Drama, recap in Title, etc. When you write/borrow narration, set each `at` from the
  TARGET scene window (history fills its whole long window; squads start exactly when
  the squad scene does), not from the previous episode's pacing. Fixing this needs only
  a re-time + re-mux — NOT a re-render (the frames are correct).

## 6. Definition of done
Final MP4 exists & fresh; clips animate (file is tens of MB, not a tiny black-frame
file); zero on-screen sentences; soccer-only; prediction labeled; music credited;
"No, not made for kids" + "Altered/synthetic content" set at upload
(`PREUPLOAD_CHECKLIST.md`). Deliver via file-send + a public link.

## 7. After
Log results + retention% in `SERIES_PLAYBOOK.md`; tick `PREMIERE_CALENDAR.md`;
update this skill if a better technique is found (self-improving).
