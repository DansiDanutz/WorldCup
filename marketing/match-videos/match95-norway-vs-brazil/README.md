# Ep95 — Norway vs Brazil (Play-Offs) · "THE WOLF AND THE SPIRIT OF SAMBA"

OUR PREDICTION (not played): **Brazil 2–1 Norway** — Norway strike first through Erling Haaland,
Vinícius Júnior levels it, and Rodrygo strikes the late winner. **Legend 095 = Fenrir, the Unbound
Wolf** (Norway).

## Fixture note
Third fixture on the owner's Play-Off grid, following Ep91 (Argentina–Cape Verde), Ep92
(Colombia–Ghana), Ep93 (Canada–Morocco) and Ep94 (France–Paraguay, real result: France 1–0). Brazil
advance.

## Nation-myth (#21, sourced)
- **NORWAY** — the **Lions of the North**, carried by **Fenrir**, the colossal wolf of Norse
  prophecy, bound by an unbreakable chain until Ragnarök (cold-open motif + Legend 095). Direct,
  physical, and built around the most feared striker in the tournament.
- **BRAZIL** — **A Seleção**, five-time world champions, embodying the joyful spirit of the game
  itself. Fast, technical, dancing through the storm.

## Assets (Rule #26 REUSE — both nations built in prior episodes)
- **Norway (red shirt, blue trim):** REUSED from Ep81 (Rule #26) — Ødegaard (captain 10), Haaland
  (9), Sørloth (11), Berge (6), Nusa (20) showcases + crowd, press, goal clip, the Fenrir wolf +
  fjord aurora motifs.
- **Brazil (yellow shirt, green trim):** REUSED from Ep78 (Rule #26) — Marquinhos (captain 4),
  Vinícius Jr (7), Rodrygo (10), Raphinha (11), Bruno Guimarães (8) showcases + crowd, tifo, attack,
  Vinícius's equaliser goal clip, the Amazon spirit cold-open motif.
- **Fresh (4 gens):** a nation-correct Norway-vs-Brazil pitch walkout (neither prior episode had this
  pairing), Rodrygo's late-winner celebration (distinct from Vinícius's equaliser), the **Fenrir
  Legend 095** card art, and a nation-correct captains' handshake.
- **Generics (correct kits):** establishing, tense fans, 8 ANONYMOUS beat backdrops reused (0
  credits).

## Player-likeness QA log (Rule #29 — checked at render)
| Showcase | Named as | Likeness check | Verdict |
|---|---|---|---|
| no-odegaard…nusa | Norway five | Reused Ep81 (same nation/names, verified there) | PASSED (reuse) |
| bra-marquinhos…bruno | Brazil five | Reused Ep78 (same nation/names, verified there) | PASSED (reuse) |
Spot-checked at render: Ødegaard (Norway red #10 captain armband), nation-correct.

## Real statable facts (the 2026 result is PREDICTION only)
Norway = the Lions of the North, built around Haaland and Ødegaard. Brazil = A Seleção, five-time
World Cup champions. Feature NOR Ødegaard (captain), Haaland, Sørloth, Berge, Nusa; BRA Marquinhos
(captain), Vinícius Jr, Rodrygo, Raphinha, Bruno Guimarães.

## Pipeline
Ep92 template + FIXED ending (full 318s body — the CTA "LIKE · SUBSCRIBE" is not clipped).
36 distinct clips, NO-REPEAT + NO-LOOP, names SYNCED, footer mini-cards 090–094 + phone collect,
footage-backed beat cards (#27), 15s intro → ~333s. Brian VO.

## Build note (asset-integrity fix)
An initial mapping pass reused 3 clip IDs across two timeline slots each (no-press, no-goal-2,
bra-attack), which would have violated NO-REPEAT. Fixed by: (1) dropping two 1.5–5s transitional
filler beats in favor of plain color washes (no narrative loss), and (2) generating a dedicated
Rodrygo goal-celebration clip distinct from Vinícius's equaliser. `build_clips.mjs` validates
NO-REPEAT + NO-LOOP on every run.
