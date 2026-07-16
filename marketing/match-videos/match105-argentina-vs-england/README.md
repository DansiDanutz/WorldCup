# Ep.105 — Argentina vs England · THE SEMIFINAL (special episode)

**Final video:** `WorldCup26_Ep105_Argentina_England.mp4` — 1920×1080, 361s (~6:01), **83 MB** (< 95 MB), H.264/AAC.
**Thumbnail:** `thumbnail.png` (1920×1080). **Legend card:** `legend-105-portrait.png` + `legend-105-landscape.png`.

> **REVISED after the real match (2026-07-15).** An earlier cut shipped a fictional *prediction* (2–2, England win 4–3 on penalties). The match was then PLAYED, so this episode was rebuilt in place to show the **REAL result** and now presents it as fact (Rule #7).

## The real result (verified — stated as fact, the match was played)
**ARGENTINA 2–1 ENGLAND**, normal time, **NO penalty shootout** — Argentina reach the World Cup final (vs Spain).
- **England lead — Anthony Gordon, 55'.**
- **Equalizer — Enzo Fernández, 85'** — a ~20-yard thunderbolt.
- **Winner — Lautaro Martínez, 90+2'** (stoppage time) — a close-range header from a **Messi** cross.
- **Messi did NOT score — he ASSISTED BOTH goals** (the maestro/supplier) and dedicated the win to **Diego Maradona**.

Sources: **ESPN** (espn.com/soccer/match/_/gameId/760515/argentina-england) · **Al Jazeera** (2026/7/15, "Argentina stun England") · **NPR** (2026/07/15, Argentina–England semifinal).

Spine = the **ghosts of the Argentina–England rivalry**, all VERIFIED history, woven into the narration and paid off by the Legend:
- **1986 QF** — Maradona scored **both** goals vs England: the **Hand of God** and the **Goal of the Century**.
- The cold open plants the ghost of Diego; the ending pays it off — his heir, Messi, conjuring both goals and giving the night to Maradona.

**Scoreline variety (Rule #30):** a **2–1 with a stoppage-time winner from a header** (assisted, scorer not the star) — a distinct shape from recent episodes.

## Legend 105 = EL DIEZ / Diego Maradona (the immortal number 10)
The ghost of '86 — the Hand of God and the Goal of the Century — the immortal ten whose spirit carries Argentina and is now passed to Messi. **Novelty:** Argentina's prior Legend (Ep104) was Gauchito Gil; no El Diez / Maradona / "number 10 spirit" legend existed. Unique character (a mythic, semi-spectral curly-haired number 10, arms wide, golden aura), premium gold art-deco holo frame, portrait 9:16 + landscape 16:9. The reveal ties spine↔legend out loud ("El Diez, whose spirit still carries this Albiceleste").

## Structure (single continuous timeline — the ~24s mystic intro is the opening act, not a separate pre-roll)
`SceneIntro 0–24` (mist/embers, both crests rising, VS ignite, 1986 tease) → `Title 24–36` → `Stadium 36–47` → `Argentina 47–72` (Messi #10, Lautaro #22) → `England 72–98` (Kane #9, Bellingham #10) → `Riddle/Ghost-of-'86 98–116` → `Drama 116–200` (Gordon 1-0, Enzo 1-1, Lautaro 2-1) → `Aftermath 200–246` (no shootout — the maestro & the tribute to Diego) → `Tribute 246–262` (the old king and the new) → `Verdict 262–283` (premium FULL-TIME result card, ARG 2–1 ENG) → `Engage 283–295` → `Mystery/El Diez 295–324` → `App/phone-collect 324–347` → `CTA 347–361`.

Only **2 key players per team** showcased (owner brief): ARG **Messi #10**, **Lautaro #22** (the winner-scorer); ENG **Kane #9**, **Bellingham #10**.

## Production notes
- **Photoreal (Rule #22):** the new player beats — **Lautaro** (showcase, stoppage-time header, celebration), **Enzo Fernández** (85' strike) — are **image-to-video (kling3_0_turbo i2v)** from **photoreal likeness stills** (`nano_banana_pro`: recognizable Lautaro #22 / Enzo #24 in the correct Argentina home kit). Messi's assist beats reuse the prior Messi i2v clips. Frame-checked per Rule #29.
- **Nation identity (Rule #28):** England's goal (Gordon) uses England (white-kit) footage, captioned generically "ENGLAND LEAD" (no false named likeness). Every Argentina moment uses Argentina footage. No nation's identity stands in for another. Penalty-shootout clips were removed entirely.
- **No hands on ball (Rule #6):** every action/goal clip is feet/head only (Lautaro's header is head-only; Enzo strikes with the foot). Frame-checked.
- **Footage bed (Rules #25/#27):** every scene lays a contiguous clip BED (`clips.json` tiles the whole 361s on a 5s grid, coverage-checked); text beats sit over bright footage (`br` 1.2–1.5) — never a bare dark gradient.
- **No subtitles (Rule #10):** on-screen text limited to title cards, ≤4-word section labels, player name+number, the ARG–ENG score bug, and the worldcup26.world CTA. **No "OUR PREDICTION / NOT PLAYED" wording anywhere** (removed — the match was played).
- **Full-frame (Rule #19):** Letterbox is a no-op; fills 1920×1080 (verified on the final frames).
- **Narration:** Brian (ElevenLabs), 37 lines, natural pace — **no line overlaps** (every line's mp3 fits its slot; measured, all budgets positive).
- **Music (Rule #4 — cleared only):** Kevin MacLeod / incompetech, **CC-BY 4.0**: "Ghostpocalypse" (tense/haunted), "Clash Defiant" (match), "Heroic Age" (triumph/tribute). Credited in the upload description.

## QA GATES (all PASS)
- **Black-frame cap (Rule #25):** `ffmpeg blackdetect=d=1.0:pix_th=0.10` on the FINAL mux → **ZERO spans ≥1s**.
- **VO no-overlap (Rule #12):** every line's mp3 fits its slot (budgets all positive; Brian never sped up, `tempo=1`).
- **No-loop (Rule #11):** no clip `dur` exceeds its real source (all beds ≤5s on 5.04s sources).
- **No "underdog" / no "prediction/not played" / no "excalibur" / no betting** on-screen or in narration: grep = 0.
- **Likeness (Rule #29):** Lautaro #22, Enzo #24, Messi #10, Kane #9, Bellingham #10 stills + i2v frame-checked recognizable, correct numbers and kits, no hands on ball.

## Assets & credits (Higgsfield, ~1007-credit budget; ~371 available at revise time)
- **Reused free (0 credits):** the entire intro/title/stadium/England blocks, all atmospheric beds, Messi's showcase + assist clips (messi-show, messi-goal1/2, messi-golden), England goal/crowd clips (for the Gordon lead), and all prior Legend mini-cards.
- **Generated fresh for the real result:** 2 photoreal stills (Lautaro, Enzo via `nano_banana_pro`) + 4 i2v clips (`kling3_0_turbo`: lautaro-show, lautaro-header, lautaro-celeb, enzo-strike) + 2 El Diez Legend card renders (portrait + landscape). **≈ 110–130 credits** spent on the revision (well within budget).
- Penalty clips (pen-spot/pen-save/pen-winner) and the old Bellingham goal are no longer referenced.

## Build / re-render
```
export ELEVENLABS_API_KEY=...            # VO (env only, never committed)
VOICE_ID=nPczCjzI2devNBz1zQrb node gen_audio.mjs     # Brian VO -> audio/line_NN.mp3 (skips existing)
SEQ_FPS=15 node extract_frames.mjs       # clips -> assets/seq/<name>/*.jpg (+manifest)
# render (chunked, frames to /dev/shm/tmpfs; CHROMIUM_PATH = installed 1194 build):
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
1. Copy `legend-105-portrait.png` + `legend-105-landscape.png` → `public/special-cards/` (they now depict **El Diez / Maradona**, overwriting the earlier Excalibur art).
2. Append to `public/special-cards/cards.json` `cards[]` **and** the `/collection` page `CARDS` array:
```json
{
  "number": "105",
  "name": "El Diez, the Immortal Ten",
  "nation": "Argentina",
  "episode": 105,
  "match": "Argentina vs England",
  "portrait": "/special-cards/legend-105-portrait.png",
  "landscape": "/special-cards/legend-105-landscape.png"
}
```
