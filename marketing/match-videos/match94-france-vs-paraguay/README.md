# Ep94 — France vs Paraguay (Play-Offs) · "THE ROOSTER AND THE NIGHT SPIRIT"

RESULT: **France 1–0 Paraguay** — France dominate, Paraguay defend heroically, and **Kylian Mbappé
settles it from the penalty spot**, ice cold. **Legend 094 = Vercingetorix, the Gaul King** (France).

## Fixture note
World Championship **Play-Off**. France = reigning-era world champions (Les Bleus); Paraguay = La
Albirroja, back on the big stage. France advance. The scoreline (1-0, Mbappé penalty) is the real
result supplied by the owner.

## Nation-myth (#21)
- **FRANCE** — **Les Bleus**, the Gallic Rooster crowing at dawn, and the spirit of **Vercingetorix**,
  the Gaulish chieftain who united the tribes (cold-open rooster motif + Legend 094). Led by Kylian
  Mbappé.
- **PARAGUAY** — **La Albirroja**, guarded by the **Pombéro**, the Guaraní night spirit, protector of
  the underdog (cold-open motif). Organised and fearless; led by Gustavo Gómez and Miguel Almirón.

## Assets (Rule #26 REUSE — both nations built in prior episodes)
- **France (navy shirt, rooster crest):** REUSED from Ep82 (Rule #26) — Mbappé (captain 10),
  Dembélé (11), Tchouaméni (8), Saliba (17) showcases + crowd, attack, surge, the two
  France goal clips (used for the penalty + the celebration), the Gallic Rooster cold-open motif.
  Antoine Griezmann is no longer part of the squad — cut entirely (name + showcase), replaced by an
  unnamed attacking-wave beat.
- **Paraguay (red-and-white stripes):** REUSED from Ep79 (Rule #26) — Gómez (captain 15), Almirón
  (10), Enciso (11), Diego Gómez (8), Sanabria (9) showcases + crowd, tifo, Gómez's heroic block,
  Enciso's shot inches wide, the Pombéro night-spirit cold-open motif.
- **Fresh (5 gens):** the Vercingetorix Legend 094 card, a nation-correct France–Paraguay captains'
  handshake, a France "lay siege" attacking clip for the drama, and a generic unnamed France
  attacking-wave clip (`fr-collective`, Griezmann's replacement).
- **Generics:** establishing, tense fans, night-stadium riddle beats, 7 ANONYMOUS beat backdrops
  reused (0 credits).

## Player-likeness QA log (Rule #29 — checked at render)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| fr-mbappe, fr-dembele, fr-tchouameni, fr-saliba | France four | Frame-by-frame re-check against real likeness + shirt number | PASSED (corrected) |
| par-gomez…sanabria | Paraguay five | Reused Ep79 (verified there) | PASSED (reuse) |

**Correction log:** the original Ep82-reused France clips had never actually been likeness-verified
— frame audit found wrong faces/shirt numbers on Griezmann, Dembélé, Tchouaméni and Saliba (mismatched
against the labeled names), plus fake broadcast-graphic hallucinations baked into one early
regeneration attempt. All four were regenerated with explicit likeness/ethnicity/number prompts (and
explicit "no scoreboard/no broadcast graphics" prompts) and re-verified against the final render.
Griezmann was removed outright per the owner (no longer on the France squad) rather than replaced.

## Real statable facts
France = Les Bleus, world champions, led by Mbappé. Paraguay = La Albirroja, led by
Gómez and Almirón. Real result: France 1–0 Paraguay, Mbappé penalty.

## Pipeline
Ep92 template + FIXED ending (full 318s body). 38 distinct clips, NO-REPEAT + NO-LOOP, names SYNCED,
footer mini-cards 089–093 + phone collect, footage-backed beat cards (#27), 15s intro → ~333s. Brian VO.
Rendered in disk-safe 1200-frame chunks (render → encode → discard frames) due to constrained local
disk; final video re-encoded at CRF 26 to fit GitHub's 100MB push limit.
