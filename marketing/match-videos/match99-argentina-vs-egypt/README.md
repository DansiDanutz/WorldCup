# Ep99 — Argentina vs Egypt (Play-Offs) · "THE GENIUS AND THE PHARAOH"

OUR PREDICTION (not played): **Argentina 2–1 Egypt** — Argentina strike first through Julián
Álvarez, Mohamed Salah — the Pharaoh — levels it, and late, Lionel Messi — the genius — scores the
winner. **Legend 099 = Anubis, Warden of the Scales** (Egypt).

## Fixture note
Eighth Play-Off-window fixture built in this environment, following Ep91 (Argentina–Cape Verde),
Ep92 (Colombia–Ghana), Ep93 (Canada–Morocco), Ep94 (France–Paraguay), Ep95 (Norway–Brazil), Ep96
(Mexico–England) and Ep97 (Portugal–Spain). Argentina advance.

## Nation-myth (#21, sourced)
- **ARGENTINA** — **La Albiceleste**, carried by the legend of the **Sun of May** — already carded
  as Legend 091, so referenced here only as flavor text, NOT re-carded.
- **EGYPT** — **The Pharaohs**, guarded this episode by **Anubis, Warden of the Scales** — the
  ancient jackal-headed god who stands at the gates of the afterlife weighing every heart against
  the feather of Ma'at (a real, well-documented ancient-Egyptian myth from the Book of the Dead).
  This is a **deliberately fresh angle**: Legend 090 already used Egypt's Sphinx (a monument/
  guardian-lion motif), so this episode reaches for a different, equally real Egyptian myth instead
  of repeating it. Cross-checked `public/special-cards/cards.json` — no collision with Legend 009's
  "The Falconer" (Qatar, bird motif) or Legend 011's "The Andean Condor" (also a bird motif,
  different continent) or Legend 091's Sun of May (avoided a second sun-deity image on purpose).

## Assets — likeness audit + reuse (Rule #26 / #29)

**Argentina (white/light-blue shirt):** REUSED from Ep91 (`match91-argentina-vs-cape-verde`) —
crowd, attack, the `arg-tango` nation motif, and goal-beat clips (`alvarez-goal`, `messi-goal`,
`messi-magic`). An independent frame-by-frame audit of all 5 Ep91 showcase clips found:
- Messi (10, captain), Enzo Fernández (24), Mac Allister (20), Lautaro Martínez (22) — **CORRECT
  as-is**, clean kits/numbers, no broadcast-graphic contamination, reused straight from their
  original Ep91 job URLs.
- **Julián Álvarez (9) — FAILED the audit.** A "● LIVE" broadcast-graphic hallucination was baked
  into the top-right corner of the original Ep91 clip. Regenerated fresh via `nano_banana_pro`
  (explicit no-broadcast-graphic prompt) + `kling3_0_turbo`, re-verified clean on both the isolated
  clip and the final muxed video.

**Egypt (red/black shirt):** Ep90 (`match90-australia-vs-egypt`) was the obvious reuse candidate,
but investigation found **none of Egypt's nation-specific clips are recoverable** — Ep90's
`assets/_dl_reuse.txt` only recorded the *generic* shared-library clips (pitch-walkout,
stadium-wide/aerial, crowd-tense, bg-*), never the Egypt-specific ones (showcases, crowd, attack,
goal, texture-egypt). No other manifest, no `jobs-manifest.json`, and git history shows only that
one `_dl_reuse.txt` commit. The earlier `match67-egypt-vs-iran` episode (which also features Egypt,
with an overlapping but not identical showcase list: Salah/Marmoush/Trezeguet/**Zizo**/Elneny) was
checked too — same dead end, no manifest, no local files, only the final rendered episode video is
tracked in git. **Conclusion: every Egypt-specific clip this episode is a fresh generation**,
built from the exact name/number mapping recovered from Ep90's `match-scenes.jsx` source (the code
survived even though the media didn't): Salah (10, captain), Marmoush (9), Trezeguet (7), and a
generic "Wall of Egypt" center-back (6). Each was generated via `nano_banana_pro` with an explicit
likeness + shirt-number + no-broadcast-graphic prompt, then animated via `kling3_0_turbo`.
Non-showcase Egypt clips (`egy-nile` motif, `egy-crowd`, `egy-attack`, `egy-goal-1`) are fresh for
the same reason.

**Elneny (17) was CUT** after a squad-accuracy confidence check — at 34, with a declining recent
international role relative to the AFCON-era squad list recovered from Ep90/Ep67, the confidence
bar set by the project's own precedent (Ep94's Griezmann cut, Ep96's Foden cut) was not met. Egypt
runs **4 named showcases** this episode; Argentina keeps its full **5**.

**Fresh (6 gens):** a nation-correct Argentina-vs-Egypt pitch walkout, a nation-correct captains'
handshake (generic, no named individuals — regenerated a second time after the first attempt baked
in a "KABTEN" text hallucination on the armband), the **Anubis Legend 099** card art (portrait +
landscape), the `egy-nile` Nile-river Egypt motif, and two dedicated close-up stills for the
thumbnail (Messi required two regenerations to get a strong likeness; the first two attempts were
either off-model or a weak resemblance).

**Generics (verified clean, reused 0 credits):** stadium-wide, stadium-aerial — reused from the
shared library and spot-checked frame-by-frame, no readable graphics, no kit contamination.

## Player-likeness QA log (Rule #29 — checked pre-assembly AND re-verified frame-by-frame on the FINAL muxed video)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| arg-messi | Lionel Messi · 10, captain | White/blue kit, clean #10 + captain's armband, reused as-is from Ep91 | PASSED (reuse) |
| arg-alvarez | Julián Álvarez · 9 | White/blue kit, clean #9, **regenerated** after a "LIVE" broadcast-graphic hallucination was found in the Ep91 original | PASSED (corrected) |
| arg-enzo | Enzo Fernández · 24 | White/blue kit, clean #24, reused as-is from Ep91 | PASSED (reuse) |
| arg-macallister | Mac Allister · 20 | White/blue kit, clean #20, reused as-is from Ep91 | PASSED (reuse) |
| arg-lautaro | Lautaro Martínez · 22 | White/blue kit, clean #22, reused as-is from Ep91 | PASSED (reuse) |
| egy-salah | Mohamed Salah · 10, captain | Red/black kit, clean #10 + captain's armband, fresh generation | PASSED |
| egy-marmoush | Omar Marmoush · 9 | Red/black kit, clean #9, fresh generation | PASSED |
| egy-trezeguet | Trezeguet · 7 | Red/black kit, clean #7, fresh generation | PASSED |
| egy-cb | "The Wall of Egypt" (generic, no named individual) · 6 | Red/black kit, clean #6, fresh generation | PASSED |

All nine showcases were spot-checked frame-by-frame on the isolated clip BEFORE assembly, and
re-verified a second time on the FINAL muxed video after mux. No scoreboard/broadcast-graphic
contamination on any showcase clip in the delivered video.

## Real statable facts (the 2026 result is PREDICTION only)
Argentina = La Albiceleste, built around Messi (captain) and a squad stacked with Álvarez, Enzo
Fernández, Mac Allister and Lautaro Martínez. Egypt = The Pharaohs, built around Salah (captain)
with Marmoush and Trezeguet as the main attacking support. Feature ARG Messi (captain), Álvarez,
Enzo Fernández, Mac Allister, Lautaro Martínez (5 named showcases); EGY Salah (captain), Marmoush,
Trezeguet, "The Wall of Egypt" (4 named showcases — Elneny cut on squad-accuracy grounds).

## Pipeline
Ep97 template + fixed 318.05s ending. 23 distinct clips, NO-REPEAT + NO-LOOP (verified via
`build_clips.mjs`), names SYNCED, footer mini-cards 094–097 + phone collect. 15s mystic intro →
318.05s body. Brian VO (34 lines).

**Chunked render note:** the shared build environment ran critically low on disk mid-session
(concurrent Ep98/Ep100 builds in the same environment) — the body was rendered/encoded in 12
sequential ~800-frame chunks (`chunk_00`–`chunk_11`, via `render_local.mjs` + a per-chunk
`ffmpeg` grade-and-encode pass) rather than one continuous frame set, with raw frames deleted after
each chunk's encode to keep disk headroom. The 12 chunks were concatenated (stream copy, matching
codec params) into `body_video.mp4`, then `mux2.mjs` (a chunked-pipeline variant of `mux.mjs` — same
audio-graph logic, different stage-2 video step) combined it with the Brian VO/music/SFX audio
master into `body_s.mp4`. This has no effect on the delivered episode's content or duration — only
on how the render was produced under disk pressure.

## Correction log (asset-integrity fixes made THIS episode)
1. **Julián Álvarez's Ep91 showcase had a baked-in broadcast-graphic hallucination** (a "● LIVE"
   badge, top-right corner). Regenerated fresh via `nano_banana_pro`/`kling3_0_turbo` with an
   explicit no-broadcast-graphic prompt; re-verified clean frame-by-frame on both the isolated clip
   and the final muxed video.
2. **Egypt's entire clip set (showcases + b-roll) turned out to be unrecoverable**, contrary to the
   initial assumption that Ep90/Ep67 would yield reusable job URLs. Both episodes were checked
   exhaustively (`_dl_reuse.txt`, `clips.json`, `build_clips.mjs`, git history, local `assets/`
   directories) before concluding a full fresh-generation was the only option — this was NOT a
   shortcut, it was the last resort after confirming no real reuse path existed.
2b. **Egypt's captains' handshake was regenerated a second time.** The first generation baked a
   "KABTEN" text hallucination onto the Egyptian captain's armband — regenerated with an explicit
   "no text, no letters, no numbers, no logos, no crests" prompt; the second attempt is clean.
3. **Elneny (17) cut on a squad-accuracy confidence check.** At 34, with a declining recent
   international role, the confidence bar set by Ep94's Griezmann cut and Ep96's Foden cut was not
   met — Egypt runs 4 named showcases this episode instead of the original 5-player Ep90 line-up.
4. **Legend 099 mythology cross-check.** Before generating the Anubis card art, `cards.json` was
   searched for existing bird/sun/guardian motifs to avoid a thematic collision — confirmed distinct
   from Legend 009 (Falconer), Legend 011 (Andean Condor) and Legend 091 (Sun of May).
5. **Two of the Messi thumbnail-still generations were rejected before a strong likeness was
   achieved.** The first close-up looked like a generic older player, not recognizably Messi; the
   second attempt improved but was still not confident; the third (with explicit facial-feature
   description: round face, slightly hooked nose, stubble) passed.
6. **Disk-critical mid-session recovery.** The shared build environment dropped as low as ~12 MiB
   free during frame-sequence extraction (concurrent Ep98/Ep100 builds sharing the same disk) — 6 of
   23 clips' frame sequences were truncated mid-extraction. Recovered by deleting this episode's own
   already-processed raw `.mp4` clips (their sequences were already safely extracted) to free space,
   then re-extracting only the 6 truncated sequences. No other episode's files were touched at any
   point.
