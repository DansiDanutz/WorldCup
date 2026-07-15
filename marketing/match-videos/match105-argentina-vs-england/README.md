# Ep.105 — Argentina vs England · THE SEMIFINAL (special episode)

**Final video:** `WorldCup26_Ep105_Argentina_England.mp4` — 1920×1080, 361s (~6:01), **83 MB** (< 95 MB), H.264/AAC.
**Thumbnail:** `thumbnail.png` (1920×1080). **Legend card:** `legend-105-portrait.png` + `legend-105-landscape.png`.

## The story (owner-briefed)
Spine = the **ghosts of the Argentina–England rivalry** (all VERIFIED history, woven into the narration):
- **1986 QF** — Maradona scored **both** goals vs England: the **Hand of God** (illegal handball, stood) and the **Goal of the Century** (greatest solo goal). Argentina 2–1.
- **1998 R16** — **2–2**, **Argentina won 4–3 on penalties**; **Beckham sent off** (48'). (Owen wonder-goal, Zanetti free-kick, Batistuta pen.)
- **England's penalty curse** — lost their first WC shootouts (1990 semi vs West Germany, 1998 vs Argentina, 2006 vs Portugal) plus the **Euro 2020 final** vs Italy.
  Sources: beIN/Yahoo/HITC on the 1998 red card; Goal.com/ESPN/FootballFanCast on the shootout record.

**OUR PREDICTION (never stated as fact — Rule #7):** the MIRROR of 1998 → **2–2 after extra time, then ENGLAND WIN 4–3 ON PENALTIES** and reach the final. **Messi scores BOTH** Argentina goals (echoing Maradona's two in '86) and takes the **Golden Boot** — but, unlike Maradona, LOSES; the ghost of the spot passes to England and the **curse is finally broken**. Kane and Bellingham score England's two.

**Scoreline variety (Rule #30):** a **2–2 draw decided on penalties** — a distinct outcome shape (not the house "late winner").

## Legend 105 = EXCALIBUR / the Once-and-Future King (King Arthur)
The sword in the stone drawn at last — destiny fulfilled, the penalty curse lifted. **Novelty proof:** checked the used-legend list (`cards.json`, 100 cards) and `SERIES_PLAYBOOK.md` — no Excalibur / Arthur / sword / Green Knight / St George legend exists; England's prior legends are only **048 "The Beefeater"** and **084 "The Three Lions"**. Unique character (regal warrior-king in silver armour, three-lions surcoat, drawing a glowing Excalibur), premium gold art-deco holo frame, portrait 9:16 + landscape 16:9. The reveal ties the spine↔legend out loud ("the sword drawn at last, the curse lifted").

## Structure (single continuous timeline — the "powerful longer intro" is the opening act, not a separate pre-roll)
`SceneIntro 0–24` (mist/embers, both crests rising, VS ignite, 1986 tease) → `Title 24–36` → `Stadium 36–47` → `Argentina 47–72` (Messi, Álvarez) → `England 72–98` (Kane, Bellingham) → `Riddle/Curse 98–116` → `Drama 116–200` (Kane 1-0, Messi 1-1, Bellingham 2-1, Messi 2-2) → `Penalty Shootout 200–246` (England win 4-3) → `Golden Boot in defeat 246–262` → `Verdict 262–283` (premium prediction card) → `Engage 283–295` → `Mystery/Excalibur 295–324` → `App/phone-collect 324–347` → `CTA 347–361`.

Only **2 key players per team** showcased (owner brief): ARG **Messi #10**, **Álvarez #9**; ENG **Kane #9**, **Bellingham #10** — fewer showcases, more story.

## Production notes
- **Photoreal (Rule #22):** player showcases + goals are **image-to-video (kling3_0_turbo i2v)** from **photoreal likeness stills** (`nano_banana_pro` image-to-image seeded on the repo's Pixar reference portraits → recognizable Messi/Álvarez/Kane/Bellingham in correct kits + numbers). Frame-checked per Rule #29.
- **Nation identity (Rule #28):** Argentina = sky-blue/white stripes; England = white. Every crowd/kit/goal/celebration matches its captioned nation. Argentina & England fans generated per nation.
- **No hands on ball (Rule #6):** every action/goal/penalty clip is feet/head only; keeper saves inside his own box (legal). Frame-checked.
- **Footage bed (Rules #25/#27):** every scene lays a contiguous clip BED (`clips.json` tiles the whole 361s on a 5s grid, coverage-checked); text beats sit over dimmed footage — never a bare dark gradient.
- **No subtitles (Rule #10):** on-screen text limited to title cards, ≤4-word section labels, player name+number, the ARG–ENG score bug, the "OUR PREDICTION" mark, and the worldcup26.world CTA.
- **Full-frame (Rule #19):** Letterbox is a no-op; fills 1920×1080.
- **Narration:** Brian (ElevenLabs), 37 lines, natural pace — **no line overlaps** (each line ends before the next starts; verified by mux budgets, all positive).
- **Music (Rule #4 — cleared only):** Kevin MacLeod / incompetech, **CC-BY 4.0**: "Ghostpocalypse" (tense/haunted), "Clash Defiant" (match/pens), "Heroic Age" (triumph). Credited in the upload description. SFX from the shared library.

## QA GATES (all PASS)
- **Black-frame cap (Rule #25):** `ffmpeg blackdetect=d=1.0:pix_th=0.10` → **ZERO spans ≥1s** (after brightening the Verdict/App fade-in windows and lifting the NightField luminance floor; re-checked clean).
- **VO no-overlap (Rule #12):** every line's mp3 fits its slot (mux budgets all positive; Brian never sped up, `tempo=1`).
- **No-loop (Rule #11):** no clip `dur` exceeds its real source (build_clips assertion).
- **No "underdog" (Rule #15):** grep = 0. **No betting/odds wording:** grep = 0. **No subtitle `line=`/`note=` sentences:** 0 (only score-bug labels).
- **Likeness (Rule #29):** Messi/Álvarez/Kane/Bellingham stills + i2v frame-checked recognizable, correct numbers (10/9/9/10) and kits.

## Assets & credits (Higgsfield, ~1000-credit budget)
- **Reused free (0 credits):** 3 England clips recovered from history (walkout-in-white, regal captain, a clinical finish → used as anonymous England atmosphere).
- **Generated fresh:** 4 photoreal player stills + 9 named player i2v clips (showcases, Messi ×2 goals + golden-boot beat, Kane goal, Bellingham goal, Álvarez showcase); ~23 generic/atmosphere/action clips (intro mist/embers, ARG/ENG crowds, attacks, the full penalty shootout — spot/save/keeper/winner/pile-on, despair, backdrops); 2 Excalibur card renders (portrait + landscape). **≈ 620–680 credits** spent (well within budget; ~1007 available at start).
- Player likeness seeded from `content/images/Argentina/{Lionel-Messi,Julian-Alvarez}.png` and `content/images/England/{Harry-Kane,Jude-Bellingham}.png`.

## Build / re-render
```
export ELEVENLABS_API_KEY=...            # VO (env only, never committed)
node gen_audio.mjs                       # Brian VO -> audio/line_NN.mp3
node build_clips.mjs                     # clips.json (coverage + no-loop checked)
SEQ_FPS=15 node extract_frames.mjs       # clips -> assets/seq/<name>/*.jpg (+manifest)
# render (chunked, frames to /dev/shm; CHROMIUM_PATH points to the installed 1194 build):
OUT=/dev/shm/ep105fr DURATION=361 FPS=30 START=0 END=10830 \
  CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node render_local.mjs
# encode body (single-pass ABR keeps final < 95 MB) + mux audio:
ffmpeg -framerate 30 -i /dev/shm/ep105fr/f_%05d.jpg -vf "crop=1920:1080:0:0,fps=30,eq=contrast=1.06:saturation=1.07:gamma=0.98,vignette=angle=PI/6,format=yuv420p" \
  -c:v libx264 -b:v 1750k -maxrate 2600k -bufsize 5200k -preset veryfast -an -movflags +faststart body_video.mp4
DURATION=361 BODY_IN=body_video.mp4 OUTFILE=WorldCup26_Ep105_Argentina_England.mp4 node mux2.mjs
```
Note: the pipeline is a **single continuous render** (SceneIntro is scene 1 of `match.html`); there is no separate intro concat. `intro-scenes.jsx` defines `SceneIntro`, loaded by `match.html`.

## For MAIN — collection integration (app branch)
Add the Legend to the collection (this build branch has no `public/special-cards/` or `/collection` page):
1. Copy `legend-105-portrait.png` + `legend-105-landscape.png` → `public/special-cards/`.
2. Append to `public/special-cards/cards.json` `cards[]` **and** the `/collection` page `CARDS` array:
```json
{
  "number": "105",
  "name": "Excalibur, the Once-and-Future King",
  "nation": "England",
  "episode": 105,
  "match": "Argentina vs England",
  "portrait": "/special-cards/legend-105-portrait.png",
  "landscape": "/special-cards/legend-105-landscape.png"
}
```
