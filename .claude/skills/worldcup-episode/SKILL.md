---
name: worldcup-episode
description: >-
  Produce or fix a WorldCup26 Legends match episode to the Ep71 PHOTOREAL GOLD
  STANDARD. Use whenever asked to build, render, re-render, or fix the next
  WorldCup26 Legends episode. Covers: nation-unique researched mystic story,
  PHOTOREAL action (real-look AI, never cartoon), photoreal stills→image-to-video,
  NO-REPEAT/NO-LOOP clips, scenes, Brian VO with name↔image SYNC, premium
  prediction card, an animated Legend reveal with a REAL collection strip + an
  animated phone "collect in the app" footer, render, QA, deliver, collection.
  Gold reference: marketing/match-videos/match71-colombia-vs-portugal.
---

# WorldCup26 Legends — Episode Production (Ep71 PHOTOREAL gold standard)

**Ep71 (Colombia–Portugal, "El Dorado") is the reference.** It is photoreal (real
broadcast look, not cartoon), no-loop, with a researched nation-myth story and a
premium Legend reveal. Build Ep72+ at this bar or better. Read `CLAUDE.md` rules
1–24 first — they are all in force. Highlights that matter most here:

- **#22 PHOTOREAL action, never cartoon** — every match/action/crowd/stadium clip
  looks like real football. Still 100% AI (no real footage; rule #5 absolute).
- **#11 NO-REPEAT + NO-LOOP** — every clip used once; every clip window ≤ its real
  source length (ffprobe-checked). Long card/title/verdict scenes are CSS
  motion-graphics with NO video behind, so nothing ever loops.
- **#21 nation-unique researched mystic story** — web-research + cite sources.
- **#23 player name↔image SYNC** and **#24 Legend footer (real mini-cards + animated
  phone collect)** — the two NEW upgrades; details below.
- Brian narrates; SOCCER only; scorelines are OUR PREDICTION; short on-screen LABELS
  only (no sentence subtitles, rule #10); full-frame (#19); 15s mystic intro (#20).

## 0. Setup
- Work in the active worktree (e.g. `/tmp/ep38git`, branch `claude/episode38-tunisia-japan`).
  Next Ep number = highest Ep across `content/youtube/PRODUCTION_LOG.md` + all branches
  + `match-videos/`, +1. Check collision on other branches first.
- Read canon `content/Stories/<A>-vs-<B>.md` for the SPINE / score (predicted).

## 1. Research the nation-myth (rule #21) — BEFORE writing
Spawn a research agent (WebSearch/WebFetch): find ONE verified, vivid, nation-unique
mystic/history hook per nation (mythology, folklore, a world-first, a sacred symbol),
cite a source URL for every claim, flag legend-vs-fact. Pick the Legend NNN character
from it. Write the findings + sources into the episode `README.md`. (Ep71: Colombia =
El Dorado / the Muisca gilded king; Portugal = Sebastianism / O Encoberto.)

## 2. Scaffold from Ep71 (don't hand-build)
```
cp -r marketing/match-videos/match71-colombia-vs-portugal marketing/match-videos/matchNN-a-vs-b
cd …/matchNN-a-vs-b
rm -rf frames frames_intro assets/* audio/*.mp3 audio_master.m4a WorldCup26_*.mp4 thumbnail* smoke* clips.json
ln -sf ../<a-recent-ep>/node_modules node_modules   # reuse node_modules
```
Keep: *.mjs, *.html, match-kit.jsx, animations.jsx, intro-scenes.jsx, music/, sfx/, vendor/.
Then rewrite match-scenes.jsx (colors/flags/players/theme), build_clips.mjs, narration.json.

## 3. PHOTOREAL assets (rule #22) — Higgsfield (fal often exhausted)
Check `mcp__Higgsfield__balance` first. Pipeline:
1. **Photoreal player STILLS** — `generate_image` model `nano_banana_pro`, 16:9. Prompt:
   "ultra-photorealistic cinematic sports photograph, real human footballer, 85mm,
   floodlit night stadium, NOT cartoon, NOT 3d/pixar; <player> resembling … in the
   <correct kit + number>; soccer, round-neck, no helmet". One per showcased player
   (5–6/side). Real-celebrity names sometimes fail moderation → retry / reword age +
   features. Submit with small spacing or you'll get throttled (returns no id).
2. **Animate each still → i2v** — `generate_video` model `kling3_0_turbo`, duration 5,
   16:9, `medias:[{value:<still job_id>, role:"start_image"}]`, photoreal motion prompt
   (~7.5 credits/clip). This keeps likeness sharp and on-model.
3. **Non-player photoreal clips** (t2v, no still): crowds (each nation), stadium aerial
   + wide, duels, the goal/near-miss sequence, the mystic atmosphere (the nation myth),
   verdict B-roll (handshake/applaud/stadium — 3 DISTINCT), CTA celebration. If a prompt
   trips the "IN THE DARK" preset, resend with
   `declined_preset_id:"24bae836-2c4a-48e0-89b6-49fcc0b21612"`.
4. Aim for ~37 clips so the long match section has enough ≤5s footage (no looping).
5. Poll `show_generations(type:video,size:50)`, download each rawUrl by id→name.
   **REVIEW every clip**: correct sport, real likeness, clean kit, photoreal not cartoon.
   Build a contact-sheet montage and gut-check before rendering.
6. **Legend NNN card art**: `nano_banana_pro` ornate collectible (portrait 3:4 +
   landscape 16:9), "No text". Save to `public/special-cards/legend-NNN-*.png` AND copy
   into the episode `assets/` (the reveal uses the portrait as a still).

## 4. Narration (`narration.json`) — Brian, ~28 lines, ~318s body
Poetic, motivational, curiosity-driven. Mystic hook in the cold open → paid off at the
Legend reveal. Team intros, the duel/spine, predicted goals (OUR PREDICTION), the
mystery underlined, engagement (Comment X / Comment Y), Legend reveal, app CTA, outro.
Generate with `gen_audio.mjs` (`ELEVENLABS_API_KEY=… VOICE_NAME=Brian`). **Check every
line's duration ≤ its window** (ffmpeg -i); trim + re-record overruns (delete that mp3,
re-run). Keep the player-intro lines' `at` times — the showcase SYNC (step 5) keys off them.

## 5. Scenes (`match-scenes.jsx`) + `build_clips.mjs`
- **build_clips.mjs**: place the ~37 clips, each window ≤ 5.0s. It MUST ffprobe every
  clip and FAIL on `dur > source` or any repeat (the no-loop guard). Graphic scenes
  (title, prediction card, verdict panel, Legend, app, CTA) get NO clip.
- **Photoreal grade** on clips: subtle (`saturate(1.06) contrast(1.04)`), never the
  cartoon brighten.
- **⭐ RULE #23 — PLAYER NAME↔IMAGE SYNC:** each player's showcase clip + name label
  must appear EXACTLY when Brian says that name, or it reads as a bug (owner flagged).
  Don't guess windows — open the player-intro VO line, find the offset of each surname
  inside the line (estimate by word position, or split the line into per-player phrases
  and sum their mp3 durations), and set each `PlayerShowcase start/end` to that moment.
  Verify on a spot-render: the name on screen matches the name being spoken.
- **Verdict (#11 fix):** 3 DISTINCT short clips then a CSS stat panel on a gold gradient
  — never one held/looped clip.
- **Legend reveal (#17):** show the REAL `legend-NNN-portrait.png` card big + holo sheen
  sweep + "Nº NNN · ULTRA RARE" badge + title, on a BRIGHT warm-gold backdrop (not near
  black, owner flagged the dark dead-air). Card up fast (~2s), no long empty tease.
- **⭐ RULE #24 — LEGEND FOOTER (the conversion engine):**
  1. **Real collection strip, never empty boxes.** Render the previous 5 legends' actual
     art (`legend-(NNN-5..NNN-1)-portrait.png`, copied into `assets/`) as 5 mini-cards in
     a row with the NEW card highlighted — a real, filling collection, not placeholder
     squares. (Ep71 shipped empty boxes — do NOT repeat that.)
  2. **Animated phone "collect in the app".** In the app/CTA footer, animate a CSS phone
     mockup: the Legend card flies/scales into the phone screen and snaps into a
     collection grid (a satisfying "collected!" beat), with the worldcup26.world CTA.
     This shows viewers how collecting works and drives app installs. Keep it ~6–10s,
     premium, full-frame.
- match.html SCENES array: update component names + time ranges to match the narration.

## 6. Render — ALWAYS spot-test first
- `extract_frames.mjs` (FPS=30) → `assets/seq/`.
- **SPOT-TEST** 8–10 key frames (cold open, title, each player at their SYNC moment, the
  goal, verdict panel, Legend card, the phone-collect footer) via `render.mjs SHOTS=…`.
  Montage + eyeball: name-sync correct? card present? footer phone animating? No JSX
  errors? Fix before the full render.
- **Full body render**: 3 parallel `serve.mjs` (ports 8091/2/3) + 3 `render.mjs` workers
  splitting the frame range into one `frames/` dir. Verify 9542/9542, MISSING=0 (no gaps).
  Watch disk — free delivered episodes' `seq`/`frames` if it drops under ~600MB.

## 7. Finish + QA
- `mux.mjs` (body_raw) → libx264 2-pass `-b:v 1850k` → body.mp4; rm seq+frames to free space.
- Render the 15s intro (`intro.html`, 450 frames) + intro audio mix → intro.mp4.
- `ffmpeg concat` intro + body → final (≈333s). Verify decode-clean, <100 MiB, duration 5:33.
- Pull QA frames from the FINAL file (+15s offset for the intro): confirm photoreal,
  name-sync, the Legend card, the real mini-cards, and the phone-collect footer.

## 8. Deliver + collection
- Add Legend NNN to `public/special-cards/cards.json` (after the prior number).
- Make the "EL DORADO"-style thumbnail (`nano_banana_pro`, the two stars, clean EP NN badge).
- Commit code + docs + cards.json + legend art; **force-add the mp4 + thumbnail**
  (`git add -f …upload.mp4 thumbnail.png` — they're gitignored). Push with retries.
- Verify the raw GitHub link returns HTTP 200, <100 MiB. Deliver: link + title +
  description + tags + thumbnail. Upload reminders: made-for-kids = No, AI-disclosure = Yes.
- Update `PRODUCTION_LOG.md` / `PREMIERE_CALENDAR.md` and log learnings in `SERIES_PLAYBOOK.md`.

## Gotchas (learned on Ep70–71)
- fal.ai balance exhausts fast → pivot to Higgsfield (separate credits). A new fal *key*
  doesn't add balance; the account must be topped up.
- `gitignore` ignores `*.mp4`/root `*.png` → `git add -f` the upload mp4 + thumbnail.
- `finish.sh` deletes `frames`/`seq`; re-extract before any re-render.
- A clip's display `dur` > its source length = a visible loop = rejected (rule #11).
- The Legend reveal card image must NOT reference a match CLIP (its window is elsewhere
  in the timeline → renders blank); use the legend-NNN still.
