# Ep98 — USA vs Belgium (Play-Offs) · "THE RED DEVIL AND THE TALISMAN"

OUR PREDICTION (not played): **USA 2–1 Belgium** — USA strike first through their young attack,
Kevin De Bruyne — the Maestro — levels it, and late, captain Christian Pulisic — the Talisman —
scores the winner. **Legend 098 = The Red Devil, Belgium's Diables Rouges** (Belgium).

## Fixture note
Eighth fixture on the owner's Play-Off grid, following Ep91 (Argentina–Cape Verde), Ep92
(Colombia–Ghana), Ep93 (Canada–Morocco), Ep94 (France–Paraguay), Ep95 (Norway–Brazil), Ep96
(Mexico–England) and Ep97 (Portugal–Spain). USA advance.

## Nation-myth (#21, sourced)
- **BELGIUM** — **the Red Devils** (Dutch: *Rode Duivels*, French: *Diables Rouges*) — a real,
  documented football nickname first given to the Belgian national team by the Belgian sporting
  press in 1906, for their all-red kit and the fiery intensity of their play. This is a
  **deliberately fresh angle**: Legend 068 already carded Belgium as "The Carillonneur" (the
  country's bell-tower/carillon musical heritage), so this episode reaches for Belgium's football
  nickname instead of repeating that motif.
- **USA** — **the Stars and Stripes**, carried by the American Eagle — already carded as Legend
  086, so it is referenced here only as flavor text/description, NOT re-carded. USA carry a golden
  generation hitting its prime.

## Assets (Rule #26 REUSE — both nations built in prior episodes)
- **USA (white shirt):** REUSED from Ep86 (`match86-usa-vs-bosnia`) — crowd, attack, surge, both
  goal clips, and the `texture-usa` American Eagle motif. Showcase clip Balogun (9) was audited and
  found CORRECT as-is, reused straight from its original Ep86 job URL. Pulisic (captain, 10), Weah
  (21), McKennie (8) and Adams (4) were re-generated this episode with explicit shirt-number
  prompts after the audit found wrong numbers baked into the Ep86 originals — and, for Adams, the
  wrong gender entirely (see "Correction log").
- **Belgium (red shirt):** REUSED from Ep85 (`match85-belgium-vs-senegal`) — crowd, attack, both
  goal-buildup clips, plus the `be-devil` Red Devils motif. De Bruyne (captain, 7), Lukaku (9), Doku
  (11) and Tielemans (8) were audited and found CORRECT as-is, reused straight from their original
  Ep85 job URLs. Onana (4) was re-generated this episode with an explicit shirt-number prompt after
  the audit found a wrong number baked into the Ep85 original (see "Correction log").
- **Fresh (7 gens):** a nation-correct USA-vs-Belgium pitch walkout (neither prior episode had this
  exact pairing), a nation-correct captains' handshake (generic, no named individuals), the
  **Red Devil Legend 098** card art (portrait + landscape), and two dedicated close-up stills for
  the thumbnail.
- **Generics (correct, verified clean, 0 credits):** stadium-wide, stadium-aerial — both reused
  from the shared library and spot-checked frame-by-frame, no readable graphics, no kit
  contamination.
- **Squad accuracy:** both sides run their FULL planned line-up of 5 named showcases each this
  episode (USA: Pulisic/Weah/Balogun/McKennie/Adams; Belgium: De Bruyne/Lukaku/Doku/Tielemans/
  Onana) — no squad-accuracy omission was needed, unlike Ep94 (Griezmann cut) or Ep96 (Foden cut).
  All ten names were checked against current national-team involvement before inclusion.

## Player-likeness QA log (Rule #29 — checked at render, frame-by-frame on the FINAL muxed video)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| us-pulisic | Christian Pulisic · 10, captain | White kit, clean #10 on shirt + shorts, fresh corrected generation | PASSED |
| us-weah | Timothy Weah · 21 | White kit, clean #21 clearly visible, fresh corrected generation | PASSED |
| us-balogun | Folarin Balogun · 9 | White kit, clean #9 clearly visible, reused as-is from Ep86 | PASSED (reuse) |
| us-mckennie | Weston McKennie · 8 | White kit, clean #8 clearly visible, fresh corrected generation | PASSED |
| us-adams | Tyler Adams · 4 | White kit, clean #4, correct male athlete, fresh corrected generation (fixes a wrong-gender bug in the Ep86 original) | PASSED |
| be-debruyne | Kevin De Bruyne · 7, captain | Red kit, clean #7 + captain's armband, reused as-is from Ep85 | PASSED (reuse) |
| be-lukaku | Romelu Lukaku · 9 | Red kit, clean #9 clearly visible, reused as-is from Ep85 | PASSED (reuse) |
| be-doku | Jérémy Doku · 11 | Red kit, clean #11 clearly visible, reused as-is from Ep85 | PASSED (reuse) |
| be-tielemans | Youri Tielemans · 8 | Red kit, clean #8 clearly visible, reused as-is from Ep85 | PASSED (reuse) |
| be-onana | Amadou Onana · 4 | Red kit, clean #4 clearly visible, fresh corrected generation | PASSED |

All ten showcases were spot-checked frame-by-frame on their standalone stills BEFORE assembly, and
re-verified by extracting frames from the FINAL muxed video (body time + 15s intro offset) to
confirm nothing shifted, dropped, or regressed during the chunked render/mux pipeline. No
scoreboard/broadcast-graphic contamination on any showcase clip.

## Real statable facts (the 2026 result is PREDICTION only)
USA = the Stars and Stripes, built around Pulisic (captain) and a wave of pace up front (Weah,
Balogun, McKennie, Adams). Belgium = the Red Devils, still built around De Bruyne (captain) and a
golden generation (Lukaku, Doku, Tielemans, Onana). Feature USA Pulisic (captain), Weah, Balogun,
McKennie, Adams; Belgium De Bruyne (captain), Lukaku, Doku, Tielemans, Onana — 5 named showcases
each side.

## Pipeline
Ep97 template + fixed 318.05s ending (the CTA "LIKE · SUBSCRIBE" is not clipped). 24 distinct
clips, NO-REPEAT + NO-LOOP, names SYNCED, footer mini-cards 094–097 + phone collect, footage-backed
beat cards (#27) where a verified-clean clip exists, plain-graded text-only beats where one is not.
15s intro → 318.05s body. Brian VO. Rendered in disk-safe 1200-frame chunks (render → encode →
discard) at CRF 26 (60.5MB final) — all heavy scratch (raw clips, extracted frame sequences, render
frames, encode chunks, the pre-mux body video/audio) was routed to `/dev/shm` (tmpfs) rather than
the very constrained project disk, since deleting other episodes' existing scratch was correctly
out of scope for this build.

## Correction log (asset-integrity fixes made THIS episode)
1. **Four USA showcases had wrong shirt numbers (and one wrong gender) baked into the Ep86
   originals.** Pulisic, Weah, McKennie and Adams were all regenerated with an explicit shirt-number
   prompt via `nano_banana_pro`/`kling3_0_turbo`; each final clip was re-verified frame-by-frame and
   shows a clean, consistent number throughout (10/21/8/4 respectively). Adams's original clip had
   shown a #4 shirt on a woman — the corrected generation is a male athlete, matching the real
   player. Balogun (9) was audited and found correct as-is — reused unchanged.
2. **One Belgium showcase had the same class of bug.** Onana was regenerated the same way and now
   shows a clean, consistent #4. De Bruyne (captain, 7), Lukaku (9), Doku (11) and Tielemans (8)
   were audited and found correct as-is — reused unchanged from their original Ep85 job URLs.
3. **Neither Ep85 nor Ep86 had a USA-vs-Belgium pairing**, so the pitch walkout and the captains'
   handshake were both generated fresh rather than reused from either library (which would have
   shown the wrong opponent's kit/flag in the background) — verified nation-correct and free of
   broadcast-graphic contamination.
4. **Belgium's Legend card avoids duplicating Legend 068.** Belgium was already carded once
   ("The Carillonneur", Legend 068, a bell-tower/musical motif) — this episode's Legend 098 reaches
   for the distinct, real "Red Devils" football nickname instead, so the two cards read as clearly
   different characters/motifs for the same nation.
5. **Squad-accuracy check on all ten named players.** Given the project's zero-tolerance history
   with outdated squad members (Ep94's Griezmann, Ep96's Foden), each of Pulisic/Weah/Balogun/
   McKennie/Adams/De Bruyne/Lukaku/Doku/Tielemans/Onana was specifically re-checked for current
   national-team involvement before inclusion rather than assumed. All ten are retained.
6. **Disk-space handling.** The build environment had well under 1GB of free disk for most of this
   build. Rather than delete any other episode's existing local scratch (out of scope for this
   task), every heavy transient artifact (downloaded clips, per-clip frame sequences, render
   frames, encode chunks, the pre-mux body video and audio master) was routed to `/dev/shm`
   (available RAM-backed tmpfs), keeping the actual project disk footprint to the committed
   source files, the final ~60MB video, and the thumbnail/card art.
