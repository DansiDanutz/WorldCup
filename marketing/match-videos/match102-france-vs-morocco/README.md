# Ep102 — France vs Morocco (Play-Offs) · "THE HORN THAT NEVER YIELDS"

OUR PREDICTION (not played): **France 1–0 Morocco** — a tense, tight one-goal knockout decided by a
single moment. **Mbappé** strikes once in the first half (34'), then the **Atlas Lions** lay siege for
the rest of the match — **En-Nesyri** heads one off the line, **Hakimi** whips in cross after cross,
**Ounahi** curls one at goal — and France hold the line to the final whistle. One goal, one moment,
France survive. **Legend 102 = Roland, the Paladin of Roncevaux (The Horn That Never Yields)** (France).

## Fixture note
Play-Offs grid, real fixture (kickoff 23:00). France advance. Next free episode after Ep101
(Spain–Belgium, commit ffe0144c).

## Rule #30 — PREDICTION SCORELINE VARIETY (owner-mandated, hard)
Recent episodes overused **2–1** and Ep101 was **3–1**. This episode is deliberately **France 1–0** —
a single-goal knockout, one scorer (Mbappé), the drama built as a first-half strike followed by a
sustained Moroccan siege that France repel. The scoreline was fixed FIRST, then the beats were written
to fit a 1–0.

## Nation-myth (#21, sourced)
- **FRANCE** — carried by the legend of **Roland**, the Frankish paladin of Charlemagne's rear-guard.
  Ambushed and vastly outnumbered in the pass of **Roncevaux** (778 AD), Roland held the line and
  refused to sound his great ivory war-horn **Olifant** to call the army back to save him until his
  very last breath — hero of the **Chanson de Roland** (c.1100), the oldest major work of French
  literature. A real, centuries-documented French national legend. **Deliberately fresh angle:** France
  was already carded as **Legend 082 (the Gallic Rooster)** and **Legend 094 (Vercingetorix, the Gaul
  King)**, so this reaches for a medieval paladin / a single unyielding stand → **Legend 102 = Roland**.
- **MOROCCO** — **the Atlas Lions**, the pride of a continent. Already carded as **Legend 093 (the Atlas
  Lion)**, so Morocco is referenced here only as flavour text, **NOT re-carded.**

## Assets (Rule #26 — REUSE France 0-credit, generate Morocco fresh)
- **FRANCE (navy home kit):** 12 clips **REUSED 0-credit** from `match94-france-vs-paraguay`
  (`assets/clips`), independently frame-checked this episode. 4 named showcases — **Mbappé (10,
  captain), Dembélé (11), Tchouaméni (8), Saliba (17)** — plus **`fr-collective`** used as the 5th
  non-named "Les Bleus / the French collective" slot, plus `fr-crowd`, `fr-attack`, `fr-goal-1`
  (Mbappé's goal celebration), `texture-france`, `stadium-wide`, `stadium-aerial`. All PASSED (correct
  likeness, correct numbers, clean navy kit, photoreal). **Griezmann was NOT reused** — he was removed
  from the France squad in Ep94 (no longer capped) and is neither named nor shown here.
- **MOROCCO (red home kit, green trim):** 5 showcases — **Hakimi (2, captain), En-Nesyri (19),
  Amrabat (4), Ounahi (8), Brahim Díaz (7)** — plus `mor-crowd`, `mor-attack`, `texture-morocco`
  generated **FRESH** this episode. No Morocco clip sequence survived on disk in any sibling episode
  (`match93/05/33/54/80` all cleaned as build scratch), so per Rule #26's fallback fresh generation was
  the verifiable choice. Pipeline: `nano_banana_pro` photoreal stills (explicit likeness + shirt-number
  prompts) → `kling3_0_turbo` image-to-video (5s each). **Ziyech OMITTED** for squad-accuracy (uncertain
  current national-team status — omitted rather than guessed, precedent Griezmann/Ep94, Foden/Ep96).
- **Fresh story-unique clips:** nation-correct France-vs-Morocco **pitch-walkout** and captains'
  **handshake** (generic, no named individuals) — neither prior episode had this exact pairing.
- **Legend 102 card art** (Roland, portrait + landscape) generated fresh (`nano_banana_pro`, painterly
  trading-card style: knight in chainmail raising the horn Olifant in a Pyrenean pass). Footer
  mini-cards 098–101 copied from prior episodes.
- **Credit note:** France reuse saved ~150 credits; only Morocco + story clips + card + 2 thumbnail
  stills were newly generated (~14 image gens, 2 retried after transient fails; 10 i2v jobs).

## Player-likeness QA log (Rule #29 — verified on the FINAL muxed video, +15s intro offset)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| fr-mbappe | Kylian Mbappé · 10, captain | Navy France kit, clean #10, reused from Ep94 | PASSED (reuse) |
| fr-dembele | Ousmane Dembélé · 11 | Navy kit, clean #11, reused from Ep94 | PASSED (reuse) |
| fr-tchouameni | Aurélien Tchouaméni · 8 | Navy kit, clean #8, reused from Ep94 | PASSED (reuse) |
| fr-saliba | William Saliba · 17 | Navy kit, clean #17, reused from Ep94 | PASSED (reuse) |
| fr-collective | Les Bleus (non-named) | France navy collective, no single named face | PASSED |
| mor-hakimi | Achraf Hakimi · 2, captain | Red Morocco kit, clean #2, fresh gen | PASSED |
| mor-ennesyri | Youssef En-Nesyri · 19 | Red kit, clean #19, aerial header, fresh gen | PASSED |
| mor-amrabat | Sofyan Amrabat · 4 | Red kit, clean #4, fresh gen | PASSED |
| mor-ounahi | Azzedine Ounahi · 8 | Red kit, clean #8, fresh gen | PASSED |
| mor-brahim | Brahim Díaz · 7 | Red kit, clean #7, fresh gen | PASSED |

All showcases verified frame-by-frame on the FINAL muxed video (body time + 15s intro offset). No
scoreboard/broadcast-graphic contamination. Prediction card confirmed **FRA 1 — 0 MAR · MBAPPÉ 34'**.

## Real statable facts (the 2026 result is PREDICTION only)
France = Les Bleus, world champions, led by captain Mbappé (Dembélé, Tchouaméni, Saliba). Morocco = the
Atlas Lions, the 2022 semi-finalists, led by captain Hakimi with En-Nesyri, Amrabat, Ounahi and Brahim
Díaz. Both squads reviewed for current national-team plausibility before inclusion — Ziyech omitted.

## Pipeline
Ep101 template. **355.73s body** (Rule #12), 28 clip placements (20 distinct sources + 8 dimmed
beat-backdrop re-entries per Rule #27), NO-REPEAT + NO-LOOP, names SYNCED (#23). 15s mystic intro (#20)
→ 355.73s body → final **370.76s (6:10.76)**. Brian VO (ElevenLabs, `eleven_multilingual_v2`). Rendered
in 8 disk-safe /dev/shm frame chunks at CRF 26 (**60 MB** final master). All heavy scratch (raw clips,
frame sequences, render frames, encode chunks, pre-mux body/audio) routed to `/dev/shm` (tmpfs); no
other episode's files touched.

## Files
- **Upload master:** `WorldCup26_Ep102_France_Morocco.mp4` (force-added; 60 MB, 1920×1080)
- **Thumbnail:** `thumbnail.png` (1920×1080; "THE LINE HELD" / "CAN THE LIONS BREAK THROUGH?", EP 102;
  dynamic diagonal-split action — Mbappé #10 celebration vs Hakimi #2 celebration)
- **Legend card art:** `assets/legend-102-portrait.png`, `assets/legend-102-landscape.png`
- Title/description/tags: `UPLOAD_PACK.md`
