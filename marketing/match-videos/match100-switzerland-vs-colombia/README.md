# Ep100 — Switzerland vs Colombia (Play-Offs) · "THE MARKSMAN AND THE GOLDEN CITY" — MILESTONE 100TH EPISODE

OUR PREDICTION (not played): **Switzerland 2–1 Colombia** — Colombia strike first through Luis
Díaz's pace, Breel Embolo levels it for Switzerland, and late, **Granit Xhaka** — the captain who
never misses — scores the winner. **Legend 100 = Wilhelm Tell, the Marksman** (Switzerland).

## Fixture note
100th episode milestone. Play-Offs grid, following Ep91 (Argentina–Cape Verde) through Ep99
(Argentina–Egypt). Switzerland advance.

## Nation-myth (#21, sourced)
- **SWITZERLAND** — carried by the legend of **Wilhelm Tell**, the master crossbowman forced by a
  tyrannical bailiff to shoot an apple off his own son's head — and who never once considered
  missing. This is a real, centuries-documented Swiss founding folk legend (first recorded in the
  *Weisses Buch von Sarnen*, 1470s), the enduring national symbol of Swiss precision and resistance.
  This is a **deliberately fresh angle**: Legend 029 already used Switzerland's "Alpine Guide" motif,
  Legend 052 used "The Watchmaker", and Legend 089 used "The Mountain, Guardian of the Alps" — so
  this episode reaches for the *other* great Swiss national legend instead of repeating any of them.
- **COLOMBIA** — El Dorado, the Golden City — already carded as Legend 092 (and 050/071/BONUS-1), so
  it is referenced here only as flavor text/description, NOT re-carded.

## MANDATORY independent likeness audit (performed BEFORE any new code was written)
Per project rule, prior "PASSED" claims in Ep89's (`match89-switzerland-vs-algeria`) and Ep92's
(`match92-colombia-vs-ghana`) READMEs were treated as unverified until independently checked.
- **Colombia**: `match92-colombia-vs-ghana/assets/_dl_fresh.txt` had surviving CloudFront job URLs for
  all 5 Colombia showcases (James Rodríguez, Luis Díaz, Jhon Durán, Richard Ríos, Dávinson Sánchez).
  Each was downloaded, a frame extracted at ~1.5s, and checked against the shirt number and role
  labeled in `match92-colombia-vs-ghana/match-scenes.jsx`. **All 5 PASSED** — correct number, correct
  likely likeness/gender/ethnicity, no scoreboard or broadcast-graphic contamination. Reused as-is,
  0 fresh credits spent on these five.
- **Switzerland**: `match89-switzerland-vs-algeria/assets/_dl.txt` only logged the reused Algeria
  clips and generic library clips (pitch-walkout, stadium-wide/aerial, bg-*) — it never recorded the
  CloudFront URLs for the Switzerland-specific fresh generations (`sui-*`), and no local
  `assets/clips/` files survived (already cleaned up as build scratch before that episode was
  committed, per the pipeline's own step 16). `git log --all` on that path showed only the single
  original commit — no earlier, fuller manifest exists to recover. Per the audit fallback plan, ALL
  5 Switzerland showcases (and the Switzerland-only generic/atmosphere clips) were **regenerated from
  scratch this episode** with explicit likeness + shirt-number prompts, since the originals could not
  be independently verified at all. This is the safer choice — it guarantees correctness rather than
  trusting an unverifiable prior claim.
  - First Sommer attempt: number came out as "7" instead of "1". Second attempt (still emphasizing
    "not 7/11/17"): still came out as "7". Third attempt, simplified to a tight chest-up crop with the
    number described as "a single straight vertical bar, like a lowercase capital I": produced a clean,
    correct "1". Used that corrected still for the final animation.
  - Handshake: first generation read ambiguous/vintage-photo-styled with no visible Colombia crest;
    regenerated with an explicit modern-photo, crest-visible prompt and it came out clean.
- **Squad-accuracy sanity check**: Xhaka, Embolo, Akanji, Vargas, Sommer (Switzerland) and James
  Rodríguez, Luis Díaz, Jhon Durán, Richard Ríos, Dávinson Sánchez (Colombia) were all reviewed for
  plausibility as current internationals — none raised the kind of red flag that led to cutting
  Griezmann (Ep94) or Foden (Ep96), so all 10 named showcases were kept, 5 per side.

## Player-likeness QA log (Rule #29 — checked frame-by-frame on the FINAL muxed video)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| sui-xhaka | Granit Xhaka · 10, captain | Red kit, clean #10 + captain's armband, fresh generation (no recoverable original) | PASSED |
| sui-embolo | Breel Embolo · 7 | Red kit, clean #7 clearly visible, fresh generation | PASSED |
| sui-akanji | Manuel Akanji · 5 | Red kit, clean #5 clearly visible, fresh generation | PASSED |
| sui-vargas | Ruben Vargas · 17 | Red kit, correct likeness/kit; #17 visible on the source still, close-up animated crop in this beat doesn't show the digit but no wrong number/overlay present | PASSED |
| sui-sommer | Yann Sommer · 1 | Green/yellow GK kit, clean #1 (after 2 corrections), no overlay | PASSED |
| co-james | James Rodríguez · 10, captain | Yellow kit, clean #10 + captain's armband, reused as-is from Ep92 | PASSED (reuse) |
| co-diaz | Luis Díaz · 7 | Yellow kit, clean #7 clearly visible, reused as-is from Ep92 | PASSED (reuse) |
| co-duran | Jhon Durán · 9 | Yellow kit, clean #9 clearly visible, reused as-is from Ep92 | PASSED (reuse) |
| co-rios | Richard Ríos · 8 | Yellow kit, clean #8 clearly visible, reused as-is from Ep92 | PASSED (reuse) |
| co-davinson | Dávinson Sánchez · 23 | Yellow kit, clean #23 clearly visible, reused as-is from Ep92 | PASSED (reuse) |

All ten showcases were checked BEFORE assembly (both the freshly-generated ones and the
reused-and-confirmed ones) and re-verified after the final mux — no drift during the pipeline. No
scoreboard/broadcast-graphic contamination on any showcase clip.

## Assets
- **Colombia (yellow shirt):** REUSED from Ep92 (`match92-colombia-vs-ghana`, Rule #26) — crowd,
  attack, goal-1 clips, `texture-colombia` motif, and all 5 showcase clips (audited and found correct
  as-is, see above).
- **Switzerland (red shirt):** ALL FRESH this episode — crowd, attack, goal-1, surge, goal-2,
  `texture-switzerland` (Alps motif) clips, and all 5 showcase clips — no recoverable manifest existed
  for Ep89's originals (see audit section above).
- **Fresh (3 gens):** a nation-correct Switzerland-vs-Colombia pitch walkout (neither prior episode
  had this exact pairing), a nation-correct captains' handshake (generic, no named individuals; one
  regeneration needed), and the **Wilhelm Tell Legend 100** card art (portrait + a landscape crop for
  the cold-open Ken-Burns background).
- **Generics (verified clean, reused 0 credits):** stadium-wide, stadium-aerial.
- **Squad accuracy:** both sides run their full planned line-up of 5 named showcases each — no
  squad-accuracy omission needed this episode.

## Real statable facts (the 2026 result is PREDICTION only)
Switzerland built around Xhaka (captain), Embolo, Akanji, Vargas, Sommer. Colombia built around
James Rodríguez (captain), Díaz, Durán, Ríos, Dávinson Sánchez. 5 named showcases each side.

## Pipeline
Ep97 template + fixed 318.05s body ending (the CTA "LIKE · SUBSCRIBE" is not clipped). 24 distinct
clips, NO-REPEAT + NO-LOOP, names SYNCED, footer mini-cards 095–099 + phone collect, footage-backed
beat cards (#27) where a verified-clean clip exists. 15s intro → 318.05s body. Brian VO.

Rendered in disk-safe chunks (render → encode → discard immediately) — chunk size was adapted live
between 1200/800/600/400/300/242 frames as a **concurrent parallel session building Ep98/Ep99 in the
same shared working tree/disk** repeatedly pushed free disk under the 200MB floor (down to as low as
~180MB at points); every chunk boundary re-checked `df -m /` and paused to clean up before continuing.
Two render attempts also hit transient Playwright/Chromium GPU-process crashes under that same shared
load and were simply retried from the same chunk boundary.

## Correction log (asset-integrity fixes made THIS episode)
1. **No recoverable manifest existed for any of Ep89's fresh Switzerland-specific generations**
   (showcases AND generic/atmosphere clips). Rather than trust the unverifiable "PASSED" claim already
   written in that episode's README, every Switzerland-specific clip needed this episode was
   regenerated from scratch with explicit likeness/kit/number prompts.
2. **Yann Sommer's shirt number came out wrong twice before landing correct.** Attempts 1 and 2 both
   baked in a "7" despite the prompt explicitly requesting "1" (with negatives against 7/11/17).
   Attempt 3 simplified the ask to a tight chest crop describing the digit as "a single straight
   vertical bar" and produced a clean, correct "1" — used for the final animation.
3. **The first captains'-handshake generation was stylistically inconsistent** (vintage/archival photo
   look, no visible Colombian crest, ambiguous kit reading) — regenerated with an explicit
   modern-photo, crest-visible prompt; the second attempt is clean and used in the final cut.
4. **No fixture-specific "generic library" clips were reused across the wrong opponent.** A fresh
   nation-correct walkout and handshake were generated from scratch for this exact Switzerland-vs-
   Colombia pairing rather than reusing Ep89's Algeria-paired or Ep92's Ghana-paired walkout/handshake
   clips.
5. **Squad-accuracy check** on all 10 named showcases found no reason to cut anyone this episode
   (unlike Ep94's Griezmann or Ep96's Foden) — both sides ship their full planned 5-showcase line-up.
