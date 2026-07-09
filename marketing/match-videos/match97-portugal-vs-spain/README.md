# Ep97 — Portugal vs Spain (Play-Offs) · "THE HIDDEN KING AND THE RAGING BULL"

OUR PREDICTION (not played): **Spain 2–1 Portugal** — Spain strike first through their young attack,
Cristiano Ronaldo — ageless — levels it, and late, Lamine Yamal — the wizard — scores the winner.
**Legend 097 = Dom Sebastião, the Hidden King** (Portugal).

## Fixture note
Seventh fixture on the owner's Play-Off grid, following Ep91 (Argentina–Cape Verde), Ep92
(Colombia–Ghana), Ep93 (Canada–Morocco), Ep94 (France–Paraguay), Ep95 (Norway–Brazil) and Ep96
(Mexico–England). Spain advance.

## Nation-myth (#21, sourced)
- **PORTUGAL** — **A Seleção**, carried by the legend of **Dom Sebastião**, the young king who rode
  into the mist at the Battle of Alcácer-Quibir in 1578 and was never seen again. The Portuguese
  never accepted his death — "Sebastianismo" is a real, centuries-documented Portuguese folk myth
  (echoed in Fernando Pessoa's poem cycle *Mensagem*) that one grey, foggy dawn the Hidden King —
  "O Encoberto" — will return to save Portugal. This is a **deliberately fresh angle**: Legend 088
  already used Portugal's seafaring "Navigator" motif, so this episode reaches for the *other* great
  Portuguese national myth instead of repeating it.
- **SPAIN** — **La Roja**, the **Raging Bull** (El Toro) — already carded as Legend 087, so it is
  referenced here only as flavor text/description, NOT re-carded. Spain carries the best young
  attacking talent in the tournament.

## Assets (Rule #26 REUSE — both nations built in prior episodes)
- **Portugal (dark red/green shirt):** REUSED from Ep71 (`match71-colombia-vs-portugal`, also reused
  in Ep88) — crowd, attack, surge, goal clips, and the `portugal-fog` nation motif. Showcase clips
  Ronaldo (captain, 7) and Bruno Fernandes (8) were audited and found CORRECT as-is, reused straight
  from their original Ep71 job URLs. Leão (11), Dias (4) and Bernardo Silva (10) were re-generated
  this episode with explicit shirt-number prompts after the audit found wrong numbers baked into the
  Ep71/88 originals (see "Correction log").
- **Spain (red shirt):** REUSED from Ep87 (`match87-spain-vs-austria`) — crowd, attack, surge, and
  both goal clips, plus the `texture-spain` El Toro motif. Morata (captain, 7) was audited and found
  CORRECT as-is, reused straight from its original Ep87 job URL. Yamal (19), Pedri (8), Rodri (16)
  and Nico Williams (17) were re-generated this episode with explicit shirt-number prompts after the
  audit found wrong numbers baked into the Ep87 originals (see "Correction log").
- **Fresh (5 gens):** a nation-correct Portugal-vs-Spain pitch walkout (neither prior episode had
  this exact pairing), a nation-correct captains' handshake (generic, no named individuals), the
  **Dom Sebastião Legend 097** card art (portrait + landscape), and two dedicated close-up stills for
  the thumbnail.
- **Generics (correct kits, verified clean, 0 credits):** stadium-wide, stadium-aerial — both reused
  from the shared library and spot-checked frame-by-frame, no readable graphics, no kit
  contamination.
- **Squad accuracy:** both sides run their FULL planned line-up of 5 named showcases each this
  episode (Portugal: Ronaldo/Bruno Fernandes/Leão/Dias/Bernardo Silva; Spain: Morata/Yamal/Pedri/
  Rodri/Nico Williams) — no squad-accuracy omission was needed, unlike Ep94 (Griezmann cut) or Ep96
  (Foden cut). Cristiano Ronaldo was double-checked against the real-world squad-accuracy rule before
  inclusion — he remains part of the current Portugal squad and is featured with high confidence.

## Player-likeness QA log (Rule #29 — checked at render, frame-by-frame on the FINAL muxed video)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| por-ronaldo | Cristiano Ronaldo · 7, captain | Dark red kit, clean #7 + captain's armband, reused as-is from Ep71 | PASSED (reuse) |
| por-bruno | Bruno Fernandes · 8 | Dark red kit, #8 clearly visible, reused as-is from Ep71 | PASSED (reuse) |
| por-leao | Rafael Leão · 11 | Dark red/green kit, clean #11 clearly visible, fresh corrected generation | PASSED |
| por-dias | Rúben Dias · 4 | Dark red kit, clean #4 clearly visible, fresh corrected generation | PASSED |
| por-bernardo | Bernardo Silva · 10 | Dark red kit, clean #10 clearly visible, fresh corrected generation | PASSED |
| spa-morata | Álvaro Morata · 7, captain | Red kit, clean #7 + captain's armband ("C"), reused as-is from Ep87 | PASSED (reuse) |
| spa-yamal | Lamine Yamal · 19 | Red kit, clean #19 clearly visible, fresh corrected generation | PASSED |
| spa-pedri | Pedri · 8 | Red kit, clean #8 clearly visible, fresh corrected generation | PASSED |
| spa-rodri | Rodri · 16 | Red kit, clean #16 clearly visible, fresh corrected generation | PASSED |
| spa-nicowilliams | Nico Williams · 17 | Red kit, clean #17 clearly visible, fresh corrected generation | PASSED |

All ten showcases were spot-checked frame-by-frame BEFORE assembly (both the reused-and-confirmed
ones and the freshly-corrected ones) and re-verified after the final mux to confirm nothing shifted
during the pipeline. No scoreboard/broadcast-graphic contamination on any showcase clip.

## Real statable facts (the 2026 result is PREDICTION only)
Portugal = A Seleção, built around Ronaldo (captain) and Bruno Fernandes. Spain = La Roja, built
around Morata (captain) and a wave of young talent (Yamal, Pedri, Rodri, Nico Williams). Feature POR
Ronaldo (captain), Bruno Fernandes, Leão, Dias, Bernardo Silva; SPA Morata (captain), Yamal, Pedri,
Rodri, Nico Williams — 5 named showcases each side.

## Pipeline
Ep96 template + fixed 318.05s ending (the CTA "LIKE · SUBSCRIBE" is not clipped). 24 distinct clips,
NO-REPEAT + NO-LOOP, names SYNCED, footer mini-cards 093–096 + phone collect, footage-backed beat
cards (#27) where a verified-clean clip exists, plain-graded text-only beats where one is not (see
below). 15s intro → 318.05s body. Brian VO.

## Correction log (asset-integrity fixes made THIS episode)
1. **Four Spain showcases had wrong shirt numbers baked into the Ep87 originals.** Yamal, Pedri,
   Rodri and Nico Williams were all regenerated with an explicit, double-emphasised shirt-number
   prompt via `nano_banana_pro`/`kling3_0_turbo`; each final clip was re-verified frame-by-frame and
   shows a clean, consistent number throughout (19/8/16/17 respectively). Morata (captain, 7) was
   audited and found correct as-is — reused unchanged.
2. **Three Portugal showcases had the same class of bug.** Leão, Dias and Bernardo Silva were all
   regenerated the same way; each shows a clean, consistent number (11/4/10). Ronaldo (captain, 7)
   and Bruno Fernandes (8) were audited and found correct as-is — reused unchanged from their
   original Ep71 job URLs.
3. **Leão's video generation was missing a motion pass.** The job ID handed off for `por-leao` in
   this episode's brief pointed to the corrected STILL image only (a `nano_banana_2` output), not a
   video — there was no matching `kling3_0_turbo` animation job for it yet. Rather than ship a static
   frame or guess at a different job ID, a fresh `kling3_0_turbo` animation was generated from that
   exact corrected still (same likeness/number, motion added), then verified frame-by-frame like
   every other showcase.
4. **No fixture-specific "generic library" clips were reused across the wrong opponent.** Unlike
   Ep96 (which had to drop Ecuador-contaminated Ep83 clips), this episode never attempted to reuse
   Ep71/88's Colombia/Croatia-paired clips or Ep87's Austria-paired clips for two-team beats
   (walkout, handshake, duel, crowd-tense, cta-celebrate) — those are inherently wrong-opponent for a
   Portugal-vs-Spain fixture regardless of contamination, so a fresh nation-correct walkout and
   handshake were generated from scratch instead of attempting a risky reuse.
5. **Only one distinct atmosphere/motif clip exists per nation this episode** (`portugal-fog` for
   Portugal, `texture-spain` for Spain — no second "eng-lions"-style motif clip was available for
   either nation in the source library). Rather than repeat either clip a second time in the Riddle
   section (a NO-REPEAT violation) or reuse a wrong-opponent motif, the 118–123s Riddle beat uses a
   plain graded `NightField` backdrop instead of a video clip — the same "no unverified filler"
   principle established in Ep96's Correction log.
6. **Squad-accuracy check on Cristiano Ronaldo.** Given his age (41) and the project's zero-tolerance
   history with outdated squad members (Ep94's Griezmann, Ep96's Foden), Ronaldo's current
   involvement with the Portugal national team was specifically re-checked before inclusion rather
   than assumed. He is retained as captain in this episode.
