---
name: worldcup-episode
description: >-
  Produce or fix a WorldCup26 Legends animated match episode to the Ep44 GOLD
  STANDARD. Use whenever asked to build, render, re-render, or fix the next
  WorldCup26 Legends episode. Covers scaffold, narration, Higgsfield assets,
  scenes with a continuous B-roll backdrop (never black), animated squad cards
  (player clips) + animated Legend card, Brian VO, preflight, a mandatory
  SPOT-TEST before the full render, render, QA, deliver, and adding the Legend
  card to the collection. Gold reference: marketing/match-videos/match44-france-vs-iraq.
---

# WorldCup26 Legends — Episode Production (Ep44 gold standard)

Ep44 (France–Iraq) is the reference. Always-on `CLAUDE.md` rules: no
gambling/odds/underdog/prize wording; short on-screen LABELS only, never sentence
props (`line=`/`note=`); Brian narrates; SOCCER only (NO helmet/pads/gridiron);
scorelines are OUR PREDICTION, never stated as real; NEVER speed up the VO (extend
duration instead); render ONE episode at a time; a finished video is NOT done until
its Legend card is in the collection. The **message** matters as much as the visuals.

## 0. Setup
- Work in the active worktree (e.g. `/tmp/ep38git`). Determine the next Ep number from
  highest Ep across `content/youtube/PRODUCTION_LOG.md` + all branches + `match-videos/`,
  +1. Check collision: `git ls-tree -d --name-only HEAD marketing/match-videos/ | grep matchNN`.
- Read canon `content/Stories/<A>-vs-<B>.md` for the SPINE / message / a score.

## 1. Scaffold from the latest gold episode (do NOT hand-build)
```
cp -r marketing/match-videos/match44-france-vs-iraq marketing/match-videos/matchNN-a-vs-b
cd marketing/match-videos/matchNN-a-vs-b
rm -rf frames audio/*.mp3 audio_master.m4a WorldCup26_*.mp4 assets/*.mp4 assets/squad/*.png thumbnail.jpg UPLOAD_PACK.md
```
- Copy 5 player clips/side from `content/videos/<Team>/<Player>.mp4` → `assets/<abbr>-<surname>.mp4`.
- Reuse `stadium.mp4` + `celebration.mp4` from a prior episode's `assets/`.

## 2. Narration (`narration.json`)
~30 Brian lines, ~308s: punchy cold-open hook + a mid-roll retention hook
("stay with me, because…"); team intros; the duel; predicted goals (clearly OUR
PREDICTION); group recap; engagement (Comment X / Comment Y); the Legend reveal;
compliant app CTA ("pick three of the 48 nations, every goal scores for you; free,
just for fun, no prizes"); outro + tease the next Ep. Legend 0NN = a UNIQUE character
tied to the match's emotional core.

## 3. Higgsfield assets (`mcp__Higgsfield__*` — it WORKS now; nano_banana_pro / kling3_0_turbo)
- **Thumbnail** 16:9: curiosity-gap hook text + "EP NN" gold seal, SOCCER (NO helmet/pads).
  If it returns `status:"nsfw"` (false positive), reword (drop flag-color descriptions) and retry.
- **Legend card**: portrait 9:16 + landscape 16:9, premium gold art-deco collectible.
- **2 story clips** (5s): the nation's fans + the **mystery/Legend** shot (also used in the cold open).
- Download via `curl` from the rawUrl. Reuse stadium/celebration to save credits.

## 4. Squad stills (fallback posters)
`ffmpeg -ss 1.2 -i assets/<clip>.mp4 -frames:v 1 -q:v 3 assets/squad/<abbr>-<name>.png` for each player.

## 5. Scenes + clips.json — the THREE things that make it gold (already in the match44 template)
1. **Backdrop (never black):** a `Backdrop()` component renders ~65 tiled `bd-*` clips
   (dur 5.0, step 4.8, cycling all srcs, `dim≈0.34`, brightness≈0.66) covering the full
   0–DUR timeline, rendered FIRST in `match.html` (`<Backdrop/>` before the SCENES map).
   EVERY scene-root background must be semi-transparent (`rgba(...,0.46)`), never opaque
   `#000`, so footage shows through clip gaps. (Letterbox bars stay `#000`.)
2. **Animated squad cards:** each `SquadGrid` player has a `vid:` clip id; the card image
   box is `position:relative` with the player `ClipSprite` over the photo poster. Add
   `sqX-<name>` clips to `clips.json` at the grid window, dur 5.
3. **Animated Legend card:** continuous float (`Math.sin(lt*…)`) + a REPEATING holo shine
   sweep over the mystery clip — never static.
- Keep scene windows aligned to narration `at` times (SCENES table in match.html). May be
  delegated to a subagent using match44 as the EXACT template, but the three items above
  are mandatory and verified by the spot-test (step 8).

## 6. VO
`ELEVENLABS_API_KEY=<key> node gen_audio.mjs` — key supplied by the user; pass inline,
NEVER write it to disk or commit it. One mp3/line, none zero-byte.

## 7. Sync + preflight + VO↔scene alignment
- `DURATION.txt` must equal match.html `const DURATION`.
- `node scripts/preflight-episode.mjs <dir> NN` → `PREFLIGHT PASS` (also enforces no VO
  overlap / no speed-up). Each VO line must land in the scene that talks about it — set
  each `at` from the TARGET scene window, not the previous episode's pacing.

## 8. SPOT-TEST BEFORE THE FULL RENDER (non-negotiable — never ship unseen; this caught Ep44's black gaps)
Serve + Playwright-screenshot the risky timestamps, then measure brightness AND VIEW a few.
Browser MUST use render.mjs's flags (`--ignore-certificate-errors`, `ignoreHTTPSErrors:true`,
viewport 1920×1124) or the React/Babel CDN fails and `window.__seek` never appears.
```
PORT=8099 node serve.mjs &        # kill by PID — NEVER pkill -f 'serve.mjs' (self-kill, exit 144)
node spotcheck.mjs                # seek [10,66,89,120,145,170,205,238,265,300], screenshot each
```
Every sampled frame's avg luminance must be > 0 (no pure black); VIEW the stadium/squad/legend
frames. Tune Backdrop brightness if gaps are too dark. Delete spotcheck.mjs before committing.

## 9. Render (one at a time)
```
WT=/tmp/ep38git nohup bash /tmp/render_ep.sh <abs epDir> NN WorldCup26_MatchNN_AAA_BBB_upload.mp4 <port> > /tmp/qNN.log 2>&1 &
```
Arm a Monitor on `/tmp/qNN.log` for `[epNN] DONE` / `EXIT [1-9]` (re-arm if it times out —
persistent monitors can expire ~30 min). render_ep.sh re-encodes if >96 MiB, commits, pushes,
frees frames. If `/tmp` gets tight, `rm -rf` finished sibling worktrees (commits persist in shared `.git`).

## 10. QA the FINAL master (graded → darker than the raw spot-test)
- mp4 `Duration` == `audio_master.m4a` `Duration` (no speed-up).
- Extract + VIEW frames at the goal + Legend timestamps: real imagery not black, correct
  teams, "OUR PREDICTION" stamp. Judge moody graded shots by VIEWING, not the lum number.

## 11. Deliver + finish (a video isn't done until ALL of this is done)
- SendUserFile the mp4 + a prediction frame; give the GitHub raw link:
  `https://github.com/DansiDanutz/WorldCup/raw/<branch>/marketing/match-videos/matchNN-.../WorldCup26_MatchNN_AAA_BBB_upload.mp4`
- Write `UPLOAD_PACK.md` (title / description / tags) and present it in chat.
- **Add the Legend card to the collection (same pass):** download both orientations to
  `public/special-cards/legend-0NN-*.png`; add the entry to `public/special-cards/cards.json`
  AND the CARDS array in `src/app/collection/page.tsx`; commit + push.
- Improve every episode over the last — update this skill when a better technique is found.
