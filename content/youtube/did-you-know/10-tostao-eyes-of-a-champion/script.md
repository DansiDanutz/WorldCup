# Short 10 — Eyes of a Champion (Tostão)

**Final video:** `dyk_tostao_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… A 1970 World Cup Star Almost Went Blind First?

## Brian VO (ElevenLabs — eleven_multilingual_v2, voice-forward mix)
> Did you know one of the stars of the greatest team in football history… nearly went blind just months before the World Cup? 1969. A ball struck Tostão flush in the face, and the retina in his left eye tore loose. With his sight and his career hanging by a thread, he flew across the world for surgery. It saved his eye, but left a blind spot that never healed. Yet eight months later, half-blind in one eye, Tostão helped Brazil win the 1970 World Cup — the team many call the most beautiful of all time. And in his proudest moment, he gave his winner's medal to the doctor who saved his sight. When his eye finally failed, Tostão walked away at just twenty-six… and became a doctor himself.
>
> **Close (drives to app):** Collect Tostão's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `TOSTÃO` · `Brazil · 1970` (lower-third)
- End card: **Eyes of a Champion** · `Brazil · 1970` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — Tostão in the golden Brazil 1970 kit, serene in the misty dark stadium (DID YOU KNOW opener)
2. **The injury** — hand pressed over his left eye, wincing (the detached retina — restrained, NO blood)
3. **The comeback** — dribbling with grace and fierce focus despite the blind spot
4. **The triumph** — beaming, lifting the golden trophy, 1970 (the idol payoff)
5. **Closing** — slow rise over the empty stadium (CTA bg)

## Sources (verified — hard rule #9, web-researched)
- [Simple Wikipedia — Tostão](https://simple.wikipedia.org/wiki/Tost%C3%A3o)
- [The Set Pieces — Who was Tostão?](https://thesetpieces.com/latest-posts/brazil-1970-tostao/)
- [The Daily Star — Grit, bravery, and a medal for the doctor](https://www.thedailystar.net/sports/sports-special/fifa-world-cup-2026/news/grit-bravery-and-medal-the-doctor-4155266)
- **Verified facts:** Sept 1969 a clearance struck him in the left eye → detached retina; surgery in Houston (saved the eye, left a permanent blind spot); played the **1970 World Cup at 23** (Brazil 4–1 Italy in the final, 3rd title — "the greatest team ever"); **gave his winner's medal to the surgeon who saved his sight**; retina detached again in 1972 → retired at 26; **became a physician** (graduated medicine 1981, practised ~20 years). *Confidence: rock-solid.*

## Monetization-safety (rule #0 / #8)
**NO graphic injury/blood** — the eye injury is restrained (hand over eye, no gore). Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no betting/odds.

## Production notes
- **All images:** Higgsfield `nano_banana_pro` (hero text-to-image; 4 beats with the hero imported as media reference for consistency).
- **All 5 clips:** Higgsfield `kling3_0_turbo` 720p image→video.
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, tempo +10% to fit, **voice-forward mix** (BGM −15 dB bed, high-passed, sidechain-ducked), −16 LUFS. Score reused (channel theme).

## Asset manifest
- `assets/images/` — `hero`, `beat2_injury`, `beat3_comeback`, `beat4_triumph`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`…`5_closing` (kling3_0_turbo 720p)
- `assets/composition/` — `index.html`, `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_tostao_wc26.mp4
```
