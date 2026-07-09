# Ep96 — Mexico vs England (Play-Offs) · "THE FEATHERED SERPENT AND THE THREE LIONS"

OUR PREDICTION (not played): **England 2–1 Mexico** — Mexico strike first in a raucous home-crowd
moment, Harry Kane equalises, and late, Jude Bellingham — the Big-Game King — scores the winner.
**Legend 096 = Quetzalcoatl, the Feathered Serpent** (Mexico).

## Fixture note
Sixth fixture on the owner's Play-Off grid, following Ep91 (Argentina–Cape Verde), Ep92
(Colombia–Ghana), Ep93 (Canada–Morocco), Ep94 (France–Paraguay) and Ep95 (Norway–Brazil). England
advance.

## Nation-myth (#21, sourced)
- **MEXICO** — **El Tri**, carried by **Quetzalcoatl**, the feathered serpent god of wind and
  wisdom the Aztec and Maya once bowed to (cold-open motif + Legend 096). Fast, fearless, and
  never louder than at home.
- **ENGLAND** — the **Three Lions**, composed and ruthless, chasing a trophy that has eluded them
  since 1966. Carries the deadliest finisher in the tournament plus a generational midfield talent.

## Assets (Rule #26 REUSE — both nations built in prior episodes)
- **Mexico (green shirt, white shorts):** REUSED from Ep83 (Rule #26) — crowd, attack, goal, and
  the Quetzalcoatl motif clip. Showcase clips Lozano (22), Álvarez (captain, 4), Montes (3) and
  Vega (10) were re-generated this episode with explicit shirt-number prompts (see "Correction
  log"). Giménez (9) is a brand-new animation this episode, built from a corrected still via
  `kling3_0_turbo`.
- **England (white shirt, navy trim):** REUSED from Ep84 (Rule #26) — crowd, attack, surge, goal,
  and the Three Lions motif clip. Kane (captain, 9), Bellingham (10), Rice (4) reused as-is
  (audited and found correct). Saka (7) was re-generated this episode with an explicit
  shirt-number and likeness prompt (see "Correction log"). **Only 4 named England showcases** —
  Foden was removed for a squad-accuracy reason, see "Correction log" #3.
- **Fresh (4 gens):** a nation-correct Mexico-vs-England pitch walkout (neither prior episode had
  this pairing — the shared-library walkout clip was rejected on QA, see "Correction log"), a
  nation-correct captains' handshake, the **Quetzalcoatl Legend 096** card art (portrait +
  landscape), and two dedicated close-up stills for the thumbnail.
- **Generics (correct kits, verified clean):** stadium-wide, stadium-aerial — both spot-checked
  frame-by-frame, no readable graphics, no kit contamination.

## Player-likeness QA log (Rule #29 — checked at render, frame-by-frame on the FINAL muxed video)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| mx-gimenez | Santiago Giménez · 9 | Fresh animation from a corrected still, clean #9 on shirt, no broadcast graphic | PASSED |
| mx-lozano | Hirving Lozano · 22 | Green kit, #22 clearly visible | PASSED |
| mx-alvarez | Édson Álvarez · 4, captain | Green kit, #4 clearly visible | PASSED |
| mx-vega | Alexis Vega · 10 | Green kit, #10 clearly visible (an earlier generation had shown #18 — rejected, regenerated) | PASSED |
| mx-montes | César Montes · 3 | Green kit, #3 clearly visible, heading duel | PASSED |
| eng-kane | Harry Kane · 9, captain | White kit, #9 + captain's armband, reused as-is from Ep84 | PASSED (reuse) |
| eng-bellingham | Jude Bellingham · 10 | White kit, #10 clearly visible, reused as-is from Ep84 | PASSED (reuse) |
| eng-saka | Bukayo Saka · 7 | White kit, #7 clearly visible | PASSED |
| eng-rice | Declan Rice · 4 | White kit, #4 clearly visible, reused as-is from Ep84 | PASSED (reuse) |

Phil Foden's showcase was built and likeness-QA-passed (white kit, #11 clearly visible, correct
build), but was REMOVED after render began for a squad-accuracy reason unrelated to likeness — see
"Correction log" #3. This is a real-world roster fact (he is no longer in the England squad), not a
rendering bug, so it isn't something a likeness re-check can resolve — the showcase was pulled
entirely rather than shipped.

## Real statable facts (the 2026 result is PREDICTION only)
Mexico = El Tri, built around Giménez and Álvarez. England = the Three Lions, built around Kane
and Bellingham, still chasing a trophy since 1966. Feature MEX Giménez, Lozano, Álvarez (captain),
Vega, Montes; ENG Kane (captain), Bellingham, Saka, Rice — only 4 named England showcases (Foden
removed, see "Correction log" #3).

## Pipeline
Ep95 template + FIXED ending (full 318.05s body — the CTA "LIKE · SUBSCRIBE" is not clipped).
25 distinct clips, NO-REPEAT + NO-LOOP, names SYNCED, footer mini-cards 091–095 + phone collect,
footage-backed beat cards (#27) where a verified-clean clip exists, plain-graded text-only beats
where one is not (see below). 15s intro → 318.05s body. Brian VO.

## Correction log (asset-integrity fixes made THIS episode)
1. **mx-vega showed the wrong shirt number.** An early generation displayed **#18** instead of
   #10 — the exact class of bug this project has zero tolerance for. Regenerated with an explicit,
   double-emphasised "#10 only" prompt; the final clip was re-verified frame-by-frame and shows a
   clean, consistent #10 throughout.
2. **Three "generic library" clips were nation-contaminated.** `duel-mid`, `crowd-tense` and
   `cta-celebrate` (all reused across many prior episodes from a shared library), plus the
   shared-library `pitch-walkout`, were inspected frame-by-frame and found to visibly show
   Ecuador's actual yellow/blue kit, badges, flags and a broadcast scoreboard overlay (or, for
   `pitch-walkout`, mismatched generic navy/red kits and a baked-in score bug) — all leftovers from
   Ep83's real opponent, Ecuador, or from unrelated stock footage. None were safe to reuse for a
   Mexico-vs-England episode. `pitch-walkout` was replaced with a freshly generated, nation-correct,
   broadcast-graphic-free walkout; the other three were dropped entirely rather than replaced — the
   Engage and CTA beats use a plain graded backdrop + particles/confetti instead, and the Riddle
   section uses the already-verified-clean `stadium-aerial` and `texture-england` instead. This
   keeps the distinct-clip count matched to what was actually generated/reused — no unverified
   filler.
3. **Phil Foden was removed for a squad-accuracy reason, not a likeness bug.** His showcase clip
   had already been built and passed the frame-by-frame likeness/number QA (white kit, #11
   clearly visible) — but partway through the build the human owner flagged, via the coordinating
   session, that Foden is no longer in the England squad in real life (same class of correction as
   Ep94's Griezmann removal). He was pulled entirely rather than guessing at a replacement
   name/number: Declan Rice's showcase moved up into Foden's old slot (104.04–108.52) and the
   following slot (108.52–113) became a generic, unnamed "THE THREE LIONS STAND FIRM" beat with no
   player name or number attached. England now runs with 4 named showcases instead of 5. The one
   narration line naming Foden was rewritten (now about Rice) and a second line rewritten to a
   generic closing line; both VO lines were regenerated; the affected render chunk was rebuilt
   after the fix.
4. **eng-saka's first generation showed an incorrect likeness.** Regenerated with an explicit
   likeness prompt and re-verified frame-by-frame — final clip shows a clean #7 with a plausible
   likeness.
