# WorldCup26 Legends — Ep103: Norway vs England (Play-Offs)

**Final:** `WorldCup26_Ep103_Norway_England.mp4` (1920×1080, H.264/AAC, ~5:56 body + 15s mystic intro = ~6:11 total)
**Prediction (OUR STORY — NOT played):** **Norway 1–1 England** — the run's first DRAW.
**Legend 103:** **Jörmungandr, the World Serpent** (Norway / Norse myth) — *The Coil That Never Yields.*

## The story (1–1 draw — honours even)
England start on top and strike first through **Kane** in the first half (1–0). Norway rise, and
**Haaland** answers with one flash of power to level it (1–1). From there it is a two-way deadlock —
England surge for the winner, Norway hit straight back, blow for blow — and neither side can break the
other. Level to the final whistle. **Honours even.** (Rule #30 scoreline variety: the first DRAW after
Ep99 2-1, Ep100 2-1, Ep101 3-1, Ep102 1-0.)

## Legend 103 — Jörmungandr, the World Serpent (novelty checked)
The Midgard Serpent of Norse myth (Prose Edda / Poetic Edda): he grew so vast he encircled all of
Midgard and grasped his own tail — an unbroken circle nothing can break; at Ragnarök he and Thor face
each other and slay one another, neither yielding — the ultimate stalemate. A perfect mirror of a 1–1
draw. **Novelty:** Norway was previously carded as **Legend 081 & 095 (Fenrir, the Unbound Wolf)** — this
reaches for a *different* Norse figure (the World Serpent, not the wolf); "Jörmungandr / World Serpent"
appears in no prior episode. England's Three Lions are already **Legend 084**, referenced here only as
flavour, NOT re-carded.

## Squads (nation-correct #28, likeness #29)
- **Norway (REUSED 0-credit from `match95-norway-vs-brazil`, Rule #26, frame-verified this session):**
  Haaland (9), Ødegaard (10, captain), Sørloth (11), Nusa (20), Berge (6) — red home kit, all PASSED.
- **England (generated FRESH this episode — no England clip sequences survived on disk in any sibling;
  all England folders had `assets/*.mp4` gitignored):** Kane (9, captain), Bellingham (10), Rice (4),
  Saka (7) + the Three Lions collective. nano_banana_pro stills → kling3_0_turbo i2v, frame-verified
  (identity + number stable, no warping). **Foden OMITTED** for squad-accuracy (removed from the England
  squad in Ep96 — kept out).
- **Fresh story clips:** Norway-vs-England pitch-walkout, captains' handshake, Haaland equaliser
  (`nor-goal`), England lead (`eng-goal`), `eng-crowd`/`eng-attack`, `texture-england`, and the
  Jörmungandr Legend 103 card art (portrait + landscape).

## Pipeline
React/Babel 355.73s timeline → Playwright frame render (image-sequence via `extract_frames.mjs`) →
chunked disk-safe encode (`render_body_chunk.sh`, CRF26 preset medium + grade filter) →
`mux2.mjs` audio master (Brian VO + music + SFX, sidechain-ducked) → mux onto body → 15s intro →
concat → `WorldCup26_Ep103_Norway_England.mp4`. Thumbnail via `thumb_render.mjs` (dynamic diagonal-split
action style: Haaland vs Kane, EP 103 badge, "NEITHER WILL YIELD").

## Reproduce
```
export ELEVENLABS_API_KEY=...   # Brian VO (never commit the key)
node gen_audio.mjs              # VO
node extract_frames.mjs         # build assets/seq image sequences
for c in 0..6: bash render_body_chunk.sh <start> <end> <n>   # chunked body render
# concat chunks -> body_video.mp4 ; DURATION=355.73 BODY_IN=body_video.mp4 OUTFILE=body_s.mp4 node mux2.mjs
bash finish_ep103.sh           # intro + concat -> final
node thumb_render.mjs          # thumbnail.png
```
Generated clips are re-fetchable (Higgsfield); frames/seq are re-buildable.

## Titles / description / tags
See `UPLOAD_PACK.md`. **Timing:** post as a scheduled Premiere ≥48h before the real kickoff (00:00).
