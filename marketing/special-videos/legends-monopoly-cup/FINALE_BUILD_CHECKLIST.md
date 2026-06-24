# GROUP-STAGE FINALE — finish-after-Round-3 checklist
**~90% is pre-built.** When Round 3 is played, only the per-player goals remain. Do these 4 steps.

## ✅ Already done (round-3-independent, committed)
- Script `narration_finale.json` (87 lines) — 80 lines voiced (`audio_finale/`), real Brian.
- Edit blueprint `clips_finale.json` — verified: no clip repeats, all clips present, all
  spoken lines covered. Manifest builder `make_manifest_finale.mjs` (syntax-checked).
- Clips banked: `clips_finale/` (LAW_BURN, WITCHES_FEED, KING_VS_WITCHES, BRACKET_FOLD,
  FROZEN_BRACKET + card clips TITLE_FINALE, KNOCKOUTS, CTA_FINALE, LEADERBOARD, GOLDENBOOT_CARD)
  + 80-clip reuse library (legends, witches, Pelé, Kane, Neymar, Vinícius, board, dice).
- Cards (PNG): TITLE_FINALE, KNOCKOUTS, CTA_FINALE, LEADERBOARD_TEMPLATE, GOLDENBOOT_LEGEND.

## 🔲 Step 1 — fill the 5 player-goal lines (the ONLY round-3 content)
In `narration_finale.json`, lines **19, 21, 23, 25, 27** are `"tbd": true` with `[R3 — …]`
placeholders. Replace each `text` with the real round-3 result + group-stage total and
**delete the `"tbd": true`** on that line. Examples are in the placeholder text. Then:
```
node gen_brian.mjs narration_finale.json audio_finale   # voices only the now-filled lines
```

## 🔲 Step 2 — fill the LEADERBOARD card numbers
Edit `/tmp/cards_fin.py` (the leaderboard block) — put the real goals in the `lt(d,1360,…,"_"…)`
slots for MESSI / RONALDO / MBAPPE / HAALAND / BRAZIL, then:
```
python3 /tmp/cards_fin.py        # rewrites assets/LEADERBOARD_TEMPLATE.png
ffmpeg -y -framerate 30 -loop 1 -t 6 -i assets/LEADERBOARD_TEMPLATE.png \
  -vf "format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st=5.55:d=0.4" -r 30 \
  -c:v libx264 -crf 18 clips_finale/LEADERBOARD.mp4
```

## 🔲 Step 3 — which Brazilian entered? (Neymar vs Vinícius)
Blueprint defaults `v27 → NEYMAR_ADVANCE`, `v28 → VINICIUS_READY`. If **Vinícius** is the one
who entered/scored, swap `clips_finale.json`: v27 → `clips_r2b/VINICIUS_READY.mp4`,
v28 → `clips_r2/NEYMAR_LUCKY.mp4` (keep both unique). Otherwise leave as is.

## 🔲 Step 4 — build + render + deliver
```
node make_manifest_finale.mjs                 # errors loudly if any VO still missing
rm -rf prep && mkdir prep
node assemble.mjs all                          # run as a MANAGED background task (no & detach)
```
Then QC (sample frames at the spoken-line times), encode web + 480p, SendUserFile + push.
Expected ~9–10 min runtime. Title `LegendsGame_GroupFinale.mp4`.

## Notes
- Keep it monetization-safe: goals are OUR STORY/prediction, free-to-play, soccer-only,
  made-for-kids=NO + AI disclosure at upload.
- Thumbnail: reuse the Golden Boot / PELÉ style; "THE GOLDEN BOOT WAR" + group-stage leaders.
- The season continues per `MYSTERY_ARC.md` (R32 → R16 → QF → SF → Final Jul 19).
