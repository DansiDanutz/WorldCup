# Short 06 — The First Goal (Lucien Laurent)

**Final video:** `dyk_laurent_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… The First World Cup Goal Was Scored By A Factory Worker?

## Brian VO (ElevenLabs — eleven_multilingual_v2, voice-forward mix)
> Did you know the man who scored the very first goal in World Cup history… went straight back to work in a car factory? 1930. The very first World Cup, in Uruguay. A young Frenchman named Lucien Laurent met a cross on the volley — and scored the first goal the tournament had ever seen. But Laurent was no star. He built cars for Peugeot, and had to take unpaid leave just to sail across the ocean and play. Then war came. Captured and held prisoner for three long years, he came home to find the soldiers had stolen his precious World Cup shirt. But Lucien had the last laugh. He lived to ninety-seven years old — long enough to watch France finally lift the World Cup, in 1998.
>
> **Close (drives to app):** Collect Lucien Laurent's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `LUCIEN LAURENT` · `France · 1930` (lower-third)
- End card: **The First Goal** · `France · 1930` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — young Laurent in the vintage 1930s France kit, serene in the misty dark old stadium (DID YOU KNOW opener)
2. **Factory worker** — in grey overalls + flat cap in a 1930s car factory, a ball at his feet (humble origin)
3. **The first goal** — the historic volley, ball flying to the net (the immortal moment)
4. **Old man, 1998** — elderly Laurent in his armchair, joyful tears, golden confetti, holding a faded photo of his young self (the "last laugh" payoff)
5. **Closing** — slow rise over the empty old stadium (CTA bg)

## Sources (verified — hard rule #9)
- en.wikipedia.org/wiki/Lucien_Laurent — first goal of the 1930 World Cup (13 July 1930, France 4–1 Mexico, a volley); a Peugeot worker; WWII POW for ~3 years; died 2005 aged 97; lived to see France win 1998.
- FIFA feature — "the first World Cup goalscorer."
- *Confidence: rock-solid on the first goal, the factory job, the POW years, the 97 years, and seeing France '98; the **stolen-jersey** detail is from his own recollection (cited as such).*

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no betting/odds · real-results framing.

## Production notes
- **All images:** Higgsfield `nano_banana_pro` (hero text-to-image; 4 beats with the hero imported as media reference for consistency — including an age-progressed elderly beat that holds a photo of the young hero, bridging young↔old).
- **All 5 clips:** Higgsfield `kling3_0_turbo` 720p image→video (the reliable workhorse this build).
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, tempo +9% to fit, **voice-forward mix** (BGM −15 dB bed, high-passed, sidechain-ducked), −16 LUFS. Score reused (channel theme).

## Asset manifest
- `assets/images/` — `hero`, `beat2_factory`, `beat3_goal`, `beat4_elderly`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`…`5_closing` (kling3_0_turbo 720p)
- `assets/composition/` — `index.html`, `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_laurent_wc26.mp4
```
