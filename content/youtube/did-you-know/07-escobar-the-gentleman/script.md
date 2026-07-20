# Short 07 — The Gentleman (Andrés Escobar)

**Final video:** `dyk_escobar_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL (handled with dignity) · advertises **worldcup26.world** (legendary cards)
**Tone:** reverent tribute. **NO graphic violence** — the death is carried by narration only, never depicted.

---

## Title (upload)
Did You Know… A World Cup Player Lost His Life For An Own Goal?

## Brian VO (ElevenLabs — eleven_multilingual_v2, voice-forward mix)
> Did you know one of football's greatest gentlemen lost his life… because of a single touch of the ball? USA, nineteen ninety-four. Andrés Escobar — Colombia's elegant captain, so noble and kind the world called him 'The Gentleman.' Stretching to cut out a cross, he turned the ball into his own net. Colombia were knocked out of the World Cup. Days later, Escobar wrote in the newspaper: 'Life does not end here. We have to go on.' But on a dark night in Medellín, his life was taken — over a game — at just twenty-seven years old. A whole nation wept. And football vowed never to forget the gentle man who reminded the world… it is only a game.
>
> **Close (drives to app):** Remember Andrés Escobar. Collect his legendary card, and keep his story alive — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `ANDRÉS ESCOBAR` · `Colombia · USA '94` (lower-third)
- End card: **The Gentleman** · `Colombia · 1967–1994` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — Escobar serene and dignified in the misty dark stadium (DID YOU KNOW opener)
2. **The own goal** — the slide, the ball into his own net, quiet anguish (sporting heartbreak — NO violence)
3. **The weight** — walking off alone, head bowed, hand over heart, dignified sorrow
4. **The tribute** — a candle-lit vigil with white doves, lilies, and his honored portrait (the reverent payoff)
5. **Closing** — slow rise over the empty floodlit stadium (CTA bg)

## Sources (verified — hard rule #9; user-requested web research)
- [Wikipedia — Andrés Escobar](https://en.wikipedia.org/wiki/Andr%C3%A9s_Escobar)
- [Britannica — Was Andrés Escobar Killed for Scoring an Own Goal?](https://www.britannica.com/sports/Was-Andres-Escobar-Killed-for-Scoring-an-Own-Goal)
- [beIN Sports — The Tragedy of Andrés Escobar after the own goal at USA 1994](https://www.beinsports.com/en-us/soccer/fifa-world-cup-2026/articles/the-tragedy-of-andr%C3%A9s-escobar-after-the-own-goal-at-usa-1994-2026-06-02)
- **Verified facts:** own goal vs **USA** (22 Jun 1994), deflecting a John Harkes cross; Colombia eliminated (Romania's results sealed Group A — the "Romania" connection). Murdered in Medellín **2 July 1994**, aged 27. "El Caballero del Fútbol." *Confidence: rock-solid on the own goal, elimination, murder & legacy; the own-goal **motive** is widely believed but never legally proven (gambling/organized crime).*

## Monetization-safety (rule #0 / #8)
**NO graphic violence, weapons, or blood** — reverent tribute treatment. Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no betting/odds.

## Production notes
- **All images:** Higgsfield `nano_banana_pro` (hero text-to-image; 4 beats with the hero imported as media reference for consistency).
- **All 5 clips:** Higgsfield `kling3_0_turbo` 720p image→video (seedance was flaky today; kling = 100% reliable this build).
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, tempo +7% to fit, **voice-forward mix** (BGM −15 dB bed, high-passed, sidechain-ducked), −16 LUFS. Score reused (channel theme).

## Asset manifest
- `assets/images/` — `hero`, `beat2_owngoal`, `beat3_sorrow`, `beat4_tribute`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`…`5_closing` (kling3_0_turbo 720p)
- `assets/composition/` — `index.html`, `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_escobar_wc26.mp4
```
