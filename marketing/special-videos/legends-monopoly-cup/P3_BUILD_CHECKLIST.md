# PART 3 — "THE COIN OF FATE" — build state & finish steps

**Round Three of the Legends' Monopoly Game (~4:30). Everything is render-ready EXCEPT the
Brian VO, which is blocked on ElevenLabs quota (see blocker below).**

## Story (locked)
Final round of the group stage. Messi / Ronaldo / Haaland / Mbappé score → rewarded, still
in the race. The silent are dragged to the cells (Kane stays jailed). Then France breaks the
game: Mbappé scores, and Dembélé answers with a **hat-trick** — two Frenchmen level. The board's
law is *one nation, one seat*, so the witches settle it with a **coin flip** → **Mbappé wins,
Dembélé is erased from the board**. Twist: was it fate, or did the witches weight the coin?
Conclusion: **no legend is truly out** — every team qualified, so the real World Cup carries
them all forward. Leaderboard (Golden Boot): **Messi 6, Mbappé 5, Haaland 5, Ronaldo 4**,
Dembélé 3 (off the board), Kane jailed. Rivals hunt first place. Cliffhanger → the knockouts.

## ✅ Done (committed / on disk)
- `narration_p3.json` — 56 lines (3 silent card markers). Line 1 already voiced (`audio_p3/line_01.mp3`).
- `clips_p3.json` — 47-clip blueprint. **Validated: no missing files, NO clip repeats, all 53
  spoken lines covered exactly once.**
- `make_manifest_p3.mjs` — VO-driven manifest builder (outfile `LegendsGame_Round3.mp4`).
- **5 NEW clips** in `clips_p3/` (kling3_0_turbo i2v, 5s each): DEMBELE_HATTRICK, FRANCE_DUO,
  COINFLIP_FATE, MBAPPE_CHOSEN, DEMBELE_OUT.
- **3 cards** (png in `assets/`, mp4 in `clips_p3/`): TITLE_P3, LEADERBOARD_P3 (real numbers),
  CTA_P3.
- **Thumbnail** `assets/THUMBNAIL_P3.png` (Mbappé vs Dembélé, "THE COIN OF FATE", BONUS seal).
- Source stills in `p3_src/` (5 nano_banana_pro renders).
- Reuse library (42 clips) all present and referenced.

## ⛔ BLOCKER — ElevenLabs quota
`gen_brian.mjs` got HTTP 401 `quota_exceeded`: "You have 53 credits remaining, 75 required."
The monthly character quota (300000) is spent. **VO cannot be generated until the ElevenLabs
plan is topped up / upgraded** (same key in `.env.local`). Only line 1 is voiced.

## 🔲 Finish (one pass, once ElevenLabs has credit)
```
cd marketing/special-videos/legends-monopoly-cup
node gen_brian.mjs narration_p3.json audio_p3     # voices lines 2..56 (Brian)
node make_manifest_p3.mjs                          # errors loudly if any VO missing
rm -rf prep && mkdir prep
node assemble.mjs all                              # MANAGED background task (no & detach)
```
Then QC (sample frames at spoken-line times), encode web + 480p, SendUserFile + push, then
publish with the upload pack. Expected ~4:30 runtime.

## Regeneration (paid clips — job IDs, in case clips_p3/ is lost)
kling3_0_turbo i2v, 720p, 5s, declined_preset 24bae836-2c4a-48e0-89b6-49fcc0b21612:
- DEMBELE_HATTRICK  video `ba6cef66-8a58-4178-9a4b-5f0e42963006`  ← image `70f71498-9762-4f79-a95c-b81bfaf0aaf5`
- FRANCE_DUO        video `6d076bdc-2e97-48a0-945d-8873d1e0317b`  ← image `c984a74d-c430-4e80-8a89-688c5411c6e7`
- COINFLIP_FATE     video `0e7bd086-aeb7-4d92-b058-3e2e3969896f`  ← image `98eccf23-cb06-4873-b9a2-fa30d139c02f`
- MBAPPE_CHOSEN     video `52c1c16b-bcf5-41a3-8cf9-fa2c80b5062c`  ← image `b152c1fd-0005-4600-bd83-5f125545013e`
- DEMBELE_OUT       video `d57dd366-6e7b-4fd5-8ab7-79cf985ad789`  ← image `fc2ed7a1-7306-488b-b857-81bc8e554a54`
Player refs (media): Mbappé `4ff5da71-856e-4798-a69f-c56180896d12`, Dembélé `d2520328-1eb6-4fe8-9e22-d7c612f11ce4`.

## Monetization-safety (checked)
Soccer only (France kits, NO NFL); goals are OUR STORY/prediction not fact; free-to-play, no
prizes; no odds/betting; AI visuals; NO subtitles (cards = title/labels/CTA only). Set
made-for-kids = NO + AI disclosure at upload.
