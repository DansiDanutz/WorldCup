# Ep79 — Germany vs Paraguay (Round of 32) · "THE MOUNTAIN KING"

R32 rematch of the Ep76 group tie. OUR PREDICTION (not played): **Germany 2–0 Paraguay** — Paraguay
resist for an hour (Enciso nearly scores), then Wirtz (78') and Havertz (88') seal it. The machine
marches on. **Legend 079 = Rübezahl, Lord of the Mountains** (German/Silesian folklore — an ancient
mountain giant-spirit who humbles the proud and rewards the brave).

## Credit discipline (Rule #26 — asset reuse)
This episode REUSED the entire Ep76 Germany/Paraguay clip library: all 33 photoreal clips copied
directly from `match76-germany-vs-paraguay/assets/clips/` → **0 video-generation credits.** The only
new Higgsfield generations were the Legend 079 card (portrait + landscape) and the thumbnail
(~10 credits total), vs ~285 for a from-scratch episode — a ~96% credit saving on a repeat matchup.

## Pipeline
Built on the Ep76 template. Squad VO lines reuse Ep76 text verbatim so name-sync onsets stay valid.
Fresh narration/scenes for the R32 2-0 story + the Rübezahl Legend. Known carry-over: the reused
`havertz-goal` clip has an AI-baked broadcast bug ("GER 1-0 ENG") — masked on the final with a
correct "GER 2-0 PAR · 88'" score-chip overlay (same fix as Ep76). render_local.mjs → mux.mjs →
intro + concat → chip overlay → final.
