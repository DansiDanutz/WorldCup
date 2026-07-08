# WorldCup26 Legends — Ep104: Argentina vs Switzerland (Play-Offs)

**Final:** `WorldCup26_Ep104_Argentina_Switzerland.mp4` (1920×1080, H.264/AAC, ~5:56 body + 15s mystic intro = ~6:11 total)
**Prediction (OUR STORY — NOT played):** **Argentina 3–2 Switzerland** — a five-goal, end-to-end classic decided at the death.
**Legend 104:** **Gauchito Gil, the Gaucho Saint** (Argentina / folk-legend) — *The Last-Breath Miracle.*

## The story (3–2 — decided in the last breath)
A night with everything. Argentina come flying out and strike first through **Álvarez** (1–0). Switzerland
do not flinch — **Embolo** levels it in a heartbeat (1–1). Argentina surge again and **Lautaro** edges them
back in front (2–1). But the red wall won't break: **Vargas** answers once more (2–2). End to end, blow for
blow — until, in the very last breath, the captain settles it: **Messi** wins it, **3–2**. Switzerland twice
stayed in it; Argentina found a hero at the death. (Rule #30 scoreline variety: a five-goal thriller after
Ep101 3-1, Ep102 1-0, Ep103 1-1 draw — a distinct 3-2 shape.)

## Legend 104 — Gauchito Gil, the Gaucho Saint (novelty checked)
Antonio Mamerto Gil Núñez — a genuine 19th-century Argentine gaucho folk-hero and folk-saint, venerated at
the red roadside shrines seen all across Argentina, prayed to for protection and last-moment miracles. A
perfect mirror of a game decided in the final breath. **Novelty:** Argentina was previously carded as
**Legend 091 (the Sun of May)** — this reaches for a *different*, distinctly Argentine figure; "Gauchito
Gil / Gaucho Saint" appears in no prior episode (checked: no gauchito/gil/familiar/kóoch/nahuel collision).

## Squads (nation-correct #28, likeness #29)
- **Argentina (REUSED 0-credit from `match99-argentina-vs-egypt`, Rule #26, frame-verified this session):**
  Messi (10, captain), Álvarez (9), Lautaro Martínez (22), Enzo Fernández (24), Mac Allister (20) —
  light-blue-and-white home kit. Three distinct goal/celebration clips reused (Álvarez, Messi ×2) for the
  three Argentina goals.
- **Switzerland (generated FRESH this episode — no committed manifest existed for match100's Switzerland
  clips):** Xhaka (10, captain ©), Embolo (7), Akanji (5), Vargas (17), Sommer (1, GK) — red home kit / teal
  GK kit. nano_banana_pro stills → kling3_0_turbo i2v, frame-verified (identity + number stable, no warping).
  No squad-accuracy omission was needed.
- **Fresh story clips:** Argentina-vs-Switzerland pitch-walkout, captains' handshake, Switzerland
  crowd/attack + two goal clips (Embolo 1-1, Vargas 2-2), `texture-switzerland`, and the Gauchito Gil
  Legend 104 card art (portrait + landscape). Thumbnail full-body action stills (Messi, Xhaka) reused
  0-credit and frame-verified from Ep99 / Ep100 (Rule #26).

## Pipeline
React/Babel 355.73s timeline → Playwright frame render (image-sequence via `extract_frames.mjs`, seq routed
to tmpfs) → chunked disk-safe encode (`render_body_chunk.sh`, CRF26 preset medium + grade filter) →
`mux2.mjs` audio master (Brian VO + music + SFX, sidechain-ducked) → mux onto body → 15s intro → concat →
`WorldCup26_Ep104_Argentina_Switzerland.mp4`. Thumbnail via `thumb_render.mjs` (dynamic diagonal-split
action style: Messi vs Xhaka, EP 104 badge, "THE LAST BREATH").

## Reproduce
```
export ELEVENLABS_API_KEY=...   # Brian VO (never commit the key)
node gen_audio.mjs              # VO
node extract_frames.mjs         # build assets/seq image sequences (symlink to tmpfs)
for n in 0..13: bash render_body_chunk.sh <start> <end> <n>   # chunked body render
# concat chunks -> body_video.mp4 ; DURATION=355.73 BODY_IN=body_video.mp4 OUTFILE=body_s.mp4 node mux2.mjs
bash finish_ep104.sh           # intro + concat -> final
node thumb_render.mjs          # thumbnail.png
```
Generated clips are re-fetchable (Higgsfield); frames/seq are re-buildable.

## Titles / description / tags
See `UPLOAD_PACK.md`. **Timing:** post as a scheduled Premiere ≥48h before the real kickoff (04:00).
