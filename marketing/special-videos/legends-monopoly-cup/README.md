# The Legends' Monopoly Cup — Round One
**WorldCup26 special crossover** · Messi × Mbappé × Haaland × Ronaldo play a
property-trading board game where every move is earned by their REAL World Cup
2026 first-round performance. ~5 min, Pixar-style, continuous, scored & narrated.

Final film: `LegendsMonopolyCup.mp4` · Story: `STORY.md` · Rules: `GAME_RULES.md`

---

## The hook (verified, real-results-only)
Driven by the actual first round of the 2026 World Cup group stage:
- **Messi** — hat-trick, Argentina **3–0** Algeria → buys 3, leads the board.
- **Mbappé** — brace, France **3–1** Senegal; becomes France's all-time top
  scorer (**58**) → buys 2 + the "Record" card.
- **Haaland** — brace, Norway **4–1** Iraq → buys 2, builds the "Viking Wall".
- **Ronaldo** — **0** goals/assists, Portugal **1–1** DR Congo → **stays in jail.**

Sources (June 2026):
- ESPN — "Messi's 38 breaks Ronaldo's record; Mbappé's 58 sets France record,
  Haaland's 2 first for Norway".
- Al Jazeera / Sky Sports — opening group-stage round-up.

## How it was built (pipeline)
- **Images:** 4 identity anchors (Nano Banana Pro, image-to-image from
  `content/images/<Team>/`).
- **Video:** 27 Seedance 2.0 clips (`seedance_2_0`, 720p, native audio) +
  1 cinematic "living portrait" of the Ronaldo anchor (the hero jail shot;
  Seedance image-to-video of real-player likenesses is moderation-blocked, and the
  dark lone-figure shots failed repeatedly — the bright-set retries + the portrait
  carry his face). Clips slowed (5s→10s, 10s→15s) and cross-faded into one
  continuous ~296s film (`assemble.mjs`, ffmpeg).
- **Voice:** Higgsfield ElevenLabs TTS, preset **Orion** (deep cinematic
  narrator), 34 lines timed to the real scene timeline (`narration.json`).
- **Music:** original AI score (Higgsfield sonilo, generated in-workspace) —
  mystery / anthem / build / jail-tension / finale. SFX from the episode library.
- **Assembly:** `make_manifest.mjs` → `manifest.json` → `assemble.mjs`
  (prep → xfade concat → audio bed with music ducked under VO → mux).

Rebuild: `node make_manifest.mjs && node assemble.mjs all`

## ⚠️ Monetization-safety checklist (CLAUDE.md Hard Rule #0)
- [x] **No gambling/betting look** — dice & "buy property" are a board *game*; no
      odds, no bookmaker styling, framed "free to play · just for fun · no prizes".
- [x] **No prize/cash wording** — VO says "no prizes... only glory".
- [x] **100% AI-generated visuals** — no real footage, club/FIFA logos.
- [x] **Soccer only** — round-neck kits, no helmets/gridiron; reviewed every clip.
- [x] **No subtitles / sentence text on screen** — every prompt forbids text;
      only generic board flavour ("GO") appears, no captions.
- [x] **Real-results-only** — scorelines are the true Round-1 results.
- [x] **Cleared audio** — original AI music + CC-BY library; Kevin MacLeod tracks
      (if used) credited.
- [ ] **At upload:** set **"No, not made for kids"** and **"Altered/synthetic
      content = Yes"** (mandatory).
- [x] **CTA** — worldcup26.world, pick 3 teams, collect legends & cards, free to
      play, no prizes.

## Asset inventory
`STORY.md`, `GAME_RULES.md`, `narration.json`, `clips.json`, `manifest.json`,
`assemble.mjs`, `make_manifest.mjs`, `assets/` (4 anchors), `clips/` (raw Seedance),
`audio/` (34 VO lines), `music/` (scores), `sfx/`, `LegendsMonopolyCup.mp4`.
