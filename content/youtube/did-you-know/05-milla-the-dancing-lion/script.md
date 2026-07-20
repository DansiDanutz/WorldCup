# Short 05 — The Dancing Lion (Roger Milla)

**Final video:** `dyk_milla_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… A President Forced Him To The World Cup?

## Brian VO (ElevenLabs — eleven_multilingual_v2, voice-forward mix)
> Did you know a 38-year-old retiree was dragged to the World Cup… by an actual order from a president? Roger Milla had already retired — playing for fun on a tiny island, far from the lights. Then the President of Cameroon picked up the phone, and signed a government decree, forcing the team to bring the old man back. At Italia '90, Milla scored four goals, danced at the corner flag, and carried Cameroon to the quarter-finals — the first African nation ever to get there. Four years later, at forty-two years old, he scored again — the oldest goalscorer in World Cup history.
>
> **Close (drives to app):** Collect Roger Milla's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `ROGER MILLA` · `Cameroon · Italia '90` (lower-third)
- End card: **The Dancing Lion** — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — older Milla (greying hair, green jersey) serene in the misty dark stadium, god-rays (DID YOU KNOW opener)
2. **Island retiree** — juggling alone on a tropical island pitch at dusk, far from the lights (the drama setup)
3. **Corner-flag dance** — his iconic hip-swinging celebration beside the corner flag, pure joy (the idol moment)
4. **Triumph** — arms wide, golden light, confetti, roaring — first African quarter-final, oldest scorer
5. **Closing** — slow rise over the empty floodlit stadium (CTA bg)

## Sources (verified — hard rule #9)
- en.wikipedia.org/wiki/Roger_Milla — Italia '90 (4 goals, corner-flag dance, Cameroon QF = first African team to reach it); USA '94 scored aged 42 (oldest WC goalscorer)
- *Confidence:* rock-solid on the goals, the dance, the quarter-final, and the age-42 record; the "presidential decree to recall him" is the widely-reported account of his Italia '90 recall.

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no betting/odds · real-results framing.

## Production notes (backend mix this build)
- **All images:** Higgsfield `nano_banana_pro` (hero text-to-image; 4 beats with the hero imported as media reference for face consistency) — imagine.art video credits were exhausted.
- **Motion (hero + closing):** Higgsfield `seedance_2_0` 720p image→video.
- **Motion (island, dance, triumph):** seedance kept failing on these three (transient engine errors) → re-rendered on **`kling3_0_turbo`** 720p (reliable workhorse). Lesson: when Higgsfield video gen fails repeatedly on a model, switch model (seedance ↔ kling) rather than just retrying.
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, **voice-forward mix** (BGM −15 dB bed, high-passed, sidechain-ducked), −16 LUFS. Score reused (channel theme).

## Asset manifest
- `assets/images/` — `hero`, `beat2_island`, `beat3_dance`, `beat4_triumph`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`/`5_closing` (seedance), `2_island`/`3_dance`/`4_triumph` (kling3_0_turbo)
- `assets/composition/` — `index.html` (HyperFrames cards), `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_milla_wc26.mp4
```
