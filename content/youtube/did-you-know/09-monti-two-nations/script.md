# Short 09 — Two Nations (Luis Monti)

**Final video:** `dyk_monti_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… One Man Played World Cup Finals For TWO Different Countries?

## Brian VO (ElevenLabs — eleven_multilingual_v2, voice-forward mix)
> Did you know one man played in two World Cup finals… for two different countries — and to this day, he is the only one who ever has? Luis Monti. In 1930, he led Argentina out for the very first World Cup final. But before kick-off, a chilling letter arrived: if Argentina won, he and his daughters would die. Shaken, Monti played like a ghost, and Argentina lost. Four years later, he wore a different shirt — Italy had called him home. And in 1934, Luis Monti walked out for his second World Cup final, and this time… he lifted the trophy. The same man. Two finals. Two nations. A record that has stood for almost a hundred years.
>
> **Close (drives to app):** Collect Luis Monti's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `LUIS MONTI` · `Argentina & Italy` (lower-third)
- End card: **Two Nations** · `Argentina & Italy` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked across a kit change, soccer-only, no logos)
1. **Hero** — Monti in the pale-blue striped Argentina kit, imposing in the misty dark stadium (DID YOU KNOW opener)
2. **The threat** — alone in a dim dressing room with a blank letter, haunted (the 1930 death-threat → the loss)
3. **Italy** — now in the royal-blue Azzurri shirt, renewed determination (the different shirt)
4. **Triumph** — lifting the golden trophy in Italy blue, 1934 (the idol payoff — the unique record)
5. **Closing** — slow rise over the empty stadium (CTA bg)

## Sources (verified — hard rule #9, web-researched)
- [Wikipedia — Luis Monti](https://en.wikipedia.org/wiki/Luis_Monti)
- [FIFA — Monti, Argentina & Italy in a final](https://www.fifa.com/en/tournaments/mens/worldcup/articles/luis-monti-argentina-italy-1930-1934-final)
- [These Football Times — Doble Ancho](https://thesefootballtimes.co/2018/04/25/doble-ancho-the-tale-of-a-unique-oriundothe-story-of-luis-monti-the-only-man-to-have-played-in-world-cup-finals-for-two-different-nations/)
- **Verified facts:** played the **1930 final for Argentina** (lost to Uruguay) and the **1934 final for Italy** (won, beat Czechoslovakia 2–1) — the **only** player ever to appear in two World Cup finals for two different nations. The 1930 anonymous death-threat letter (against him and his daughters) and Mussolini's 1934 pressure are both widely reported. *Confidence: rock-solid on the record; the threats are well-documented historical accounts.*

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no violence shown · no betting/odds.

## Production notes
- **All images:** Higgsfield `nano_banana_pro` (hero text-to-image; 4 beats with the hero imported as media reference — face stays locked across the Argentina→Italy kit change).
- **All 5 clips:** Higgsfield `kling3_0_turbo` 720p image→video.
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, tempo +10% to fit, **voice-forward mix** (BGM −15 dB bed, high-passed, sidechain-ducked), −16 LUFS. Score reused (channel theme).

## Asset manifest
- `assets/images/` — `hero`, `beat2_threat`, `beat3_italy`, `beat4_triumph`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`…`5_closing` (kling3_0_turbo 720p)
- `assets/composition/` — `index.html`, `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_monti_wc26.mp4
```
