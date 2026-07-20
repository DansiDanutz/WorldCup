# Short 08 — The Black Spider (Lev Yashin)

**Final video:** `dyk_yashin_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… The Greatest Keeper Ever Almost Quit For Ice Hockey?

## Brian VO (ElevenLabs — eleven_multilingual_v2, voice-forward mix)
> Did you know the greatest goalkeeper who ever lived almost quit football… to become an ice hockey star? Lev Yashin — dressed all in black, his arms seeming to reach every corner of the net. They called him the Black Spider. He saved over a hundred and fifty penalties, more than any keeper in history. And in 1963, he did the impossible — the only goalkeeper ever to win the Ballon d'Or. But few remember that before it all, a young Yashin lost faith, and walked away to guard a net on the ice. He won the Soviet hockey cup, and was nearly picked for the national team — before he returned to football, and became a legend. The keeper who could do it all.
>
> **Close (drives to app):** Collect Lev Yashin's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `LEV YASHIN` · `USSR · 1963` (lower-third)
- End card: **The Black Spider** · `USSR · 1963` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only + one ice-hockey beat, no logos)
1. **Hero** — Yashin in the all-black kit + cap, imposing in the misty dark goalmouth (DID YOU KNOW opener)
2. **The spider save** — a spectacular full-stretch flying save, arms spread (the greatness)
3. **The Ballon d'Or** — raising a glowing golden ball trophy, golden light (the only keeper ever — the idol peak)
4. **The ice** — Yashin as a 1950s ice-hockey goaltender, cold blue tone (the road not taken)
5. **Closing** — slow rise over the empty stadium (CTA bg)

## Sources (verified — hard rule #9, web-researched)
- [Wikipedia — Lev Yashin](https://en.wikipedia.org/wiki/Lev_Yashin)
- [Britannica — Lev Yashin](https://www.britannica.com/biography/Lev-Ivanovich-Yashin)
- [FC Dynamo Moscow — Yashin legend page](https://en.fcdynamo.ru/legend/yashin/)
- **Verified facts:** only goalkeeper ever to win the **Ballon d'Or (1963)**; nickname "Black Spider" (all-black kit, "eight arms"); FIFA credits **150+ penalties saved** (most ever) and **270+ clean sheets**; Olympic gold 1956, Euro 1960. **Ice hockey:** played goalie for Dynamo's hockey team, **won the USSR ice hockey Cup in 1953**, was a candidate for the 1954 World Ice Hockey Championship squad, then returned to football. *Confidence: rock-solid.*

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no betting/odds · real-results framing.

## Production notes
- **All images:** Higgsfield `nano_banana_pro` (hero text-to-image; 4 beats with the hero imported as media reference — including a character-consistent ice-hockey beat).
- **All 5 clips:** Higgsfield `kling3_0_turbo` 720p image→video. (VO was trimmed from 172→135 words to fit ~50s.)
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, **voice-forward mix** (BGM −15 dB bed, high-passed, sidechain-ducked), −16 LUFS. Score reused (channel theme).

## Asset manifest
- `assets/images/` — `hero`, `beat2_save`, `beat3_ballon`, `beat4_hockey`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero`…`5_closing` (kling3_0_turbo 720p)
- `assets/composition/` — `index.html`, `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_yashin_wc26.mp4
```
