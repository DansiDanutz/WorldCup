# Short 02 — The Joy of the People (Garrincha)

**Final video:** `dyk_garrincha_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… He Won The World Cup On Broken Legs?

## Brian VO (ElevenLabs — eleven_multilingual_v2)
> Did you know the man who won the World Cup was born so broken… doctors said he should never even walk? Garrincha came into the world with a twisted spine, and two legs bending the opposite way — one of them six centimetres shorter than the other. A medical case. A boy who was never meant to run. But those crooked legs moved in ways no defender on earth could read. In 1962, with Pelé injured, Brazil needed a miracle — and Garrincha became one. Dancing past entire teams. Winning the World Cup almost alone. They called him the Joy of the People — the broken boy who became magic.
>
> **Close (drives to app):** Collect Garrincha's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `GARRINCHA` · `Brazil · World Cup 1962` (lower-third)
- End card: **The Joy of the People** — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — lone young Garrincha in a misty dark stadium, god-rays (DID YOU KNOW opener)
2. **Child** — frail boy with bent crooked legs on a dusty rural pitch at dusk (the wound)
3. **Dribble** — explodes past three defenders, ball glued to his feet (the struggle/gift)
4. **Triumph** — arms wide, golden confetti, warm light breaking the dark (the idol)
5. **Closing** — camera drifts into the empty misty stadium (CTA bg)

Color literally travels **dark-teal → warm-gold** as the story rises.

## Sources (verified — hard rule #9)
- Orthopedic case study: Acta Biomedica / PMC8478430 (spinal/leg deformity)
- en.wikipedia.org/wiki/Garrincha (1962 World Cup, "Alegria do Povo")
- *Confidence:* rock-solid.

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · original AI-generated score (fully licensed) · 100% AI visuals · no betting/odds · real-results framing.

## Production (this build — "same style, better quality")
- **Images:** imagine.art `nano-banana-pro`, 9:16, character-locked (one hero reference → img2img on every shot).
- **Motion:** imagine.art `seedance-2.0`, 1080p image→video; each 5s clip slow-mo stretched into its beat.
- **VO:** ElevenLabs Brian (`eleven_multilingual_v2`) — richer than the flash model used on Short 01.
- **Score:** imagine.art `generate_music` (original instrumental, dark→triumphant), sidechain-ducked under VO, loudnorm −16 LUFS.
- **Cards:** HyperFrames (`composition/index.html`) — DID YOU KNOW opener, GARRINCHA lower-third, phone app end card.

## Asset manifest
- `assets/images/` — `hero`, `beat2_child`, `beat3_dribble`, `beat4_triumph`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`…`5_closing` (1080p seedance-2.0 animations)
- `assets/composition/` — `index.html` (HyperFrames cards), `bg.mp4` (assembled film), `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_garrincha_wc26.mp4
```
