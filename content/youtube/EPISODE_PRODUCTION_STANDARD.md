# EPISODE PRODUCTION STANDARD — clip-based, NO exceptions

> Created 2026-06-16 after an audit found Ep15–Ep25 were silently **downgraded**
> to image-only (Ken-Burns on stills, `clips: []`). That violates `CLAUDE.md`
> rules #10–#11. THIS is the enforced standard. Gold reference: **Ep2 and Ep6.**

## The non-negotiable definition of "done"
An episode is NOT done — do not publish — unless ALL are true:
1. **`clips.json` `clips[]` is NON-EMPTY** with **real Higgsfield VIDEO clips** (≈25–34),
   not stills. The string "IMAGE-BASED" / "Ken-Burns" must NOT appear.
2. Clips cover: **both teams' star players** (animated), **fans / ultras**,
   **stadium**, and the **animated Mystery Supporter(s)** — the emotional core.
3. `jobs-manifest.json` present (Higgsfield job ids → re-downloadable via `fetch-assets`).
4. Cinematic technique applied (per Ep6): speed-ramp on the climax, J-cut audio
   leads, film grain on drama, coming-up flash (~40s), chapter progress bar.
5. Supporters + the true story are the SUBJECT — not a slideshow of player photos.

## The pipeline (how Ep2–14 were actually built — copy this)
```
content/images/<Team>/<Player>.png   (stills already generated for all 49 teams)
        │  Higgsfield image→video (MCP generate_video; seedance_2_0 / kling3_0)
        ▼
content/videos/<Team>/<clip>.mp4      (the PAID animation library — reuse across eps)
   + per-episode assets/ (fans, stadium, mystery-supporter clips)
        │  populate
        ▼
clips.json  (timed clips: at/dur/vol/rate, speed-ramps, J-cuts)
        │  build-episode.sh  (render ‖ Brian VO → mux)
        ▼
WorldCup26_MatchNN.mp4
```
- **Reuse the paid library first** (`content/videos/`, prior episode `assets/`,
  `jobs-manifest.json`); only generate what's missing. Ep6: "ZERO new player
  generations — every clip from the paid library."
- Generate missing clips via the **Higgsfield MCP** from `content/images/<Team>`
  (≈22.5 credits per 5s clip; ~12–14 clips per fresh episode).

## DO NOT
- ❌ Ship `clips: []` / "IMAGE-BASED (Ken-Burns on stills)". That is the downgrade.
- ❌ Reduce an episode to a photo slideshow. Supporters + story + animation = the emotion.
- ❌ "Bulk"/simplify to save time. Quality bar = Ep6, every time.

## The downgrade we will NOT repeat (record only — do not rebuild)
Ep15–Ep20 and Ep22–Ep25 shipped image-based (`clips: []`). **Decision: we do NOT
go back and rebuild them.** We move forward — **every NEW episode from here uses
this clip-based standard, full stop.** Past clip-based episodes (Ep2–14, Ep21)
are the proof it works; the next episode matches them or better, never less.
