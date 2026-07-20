# Short 11 (DC-1) — The One-Armed Champion (Héctor Castro)

**Final video:** `dyk_castro_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts · **Arc:** DRAMA → IDOL
**Advertises** worldcup26.world (legendary cards), not the channel.

## Title (upload)
Did You Know… The First World Cup Was Won By A One-Armed Man?

## Brian VO (ElevenLabs eleven_multilingual_v2, voice-forward mix)
> Did you know the very first World Cup was won by a man with only one arm? They called him 'El Divino
> Manco' — the divine one-armed one. As a boy, Héctor Castro lost his right hand to an electric saw. In a
> cruel age, they told him his life was finished. But Castro picked up a football. In 1930, at the very
> first World Cup, he scored Uruguay's opening goal of the tournament. And in the final, against their
> fiercest rivals Argentina, with a whole nation holding its breath… it was Castro who struck the last
> goal. Uruguay, four. Argentina, two. The first world champions in history — led home by the man they
> said would never amount to anything. One arm. One dream. The whole world at his feet.
>
> **Close (drives to app):** Collect Héctor Castro's legendary card, and unlock the story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener)
- `HÉCTOR CASTRO` · `Uruguay · 1930` (lower-third)
- End card: **The One-Armed Champion** · `Uruguay · 1930` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — Castro in the sky-blue Uruguay 1930 kit, dignified in a misty dark stadium (DID YOU KNOW opener)
2. **The loss** — young Castro, right forearm bandaged, cradling a ball in a workshop (injury IMPLIED — no blood/saw/gore)
3. **The first goal** — striking the ball, scoring in the packed 1930 stadium
4. **The final** — roaring joy, fist raised, confetti, after the decisive goal vs Argentina (idol payoff)
5. **The trophy** — lifting the golden trophy, first world champion (CTA bg)

## Sources (verified — hard rule #9, web-researched 2026-06-28)
- [Wikipedia — Héctor Castro](https://en.wikipedia.org/wiki/H%C3%A9ctor_Castro)
- A Halftime Report — "El Divino Manco: The One-Armed World Cup Winner"; qatarmoments.
- **Verified facts:** lost his right forearm/hand in an electric-saw accident as a boy (~age 13); nicknamed
  "El Divino Manco"; scored Uruguay's first-ever World Cup goal (vs Peru, 1930) and the **final, decisive
  4th goal** in the 1930 final (Uruguay 4–2 Argentina) — the first World Cup champions. *Confidence: rock-solid.*

## Monetization-safety (rule #0 / #8)
NO graphic injury/blood — amputation is IMPLIED (bandaged arm only, no saw, no wound). Made-for-kids = NO ·
AI disclosure = YES · cleared/original score · 100% AI visuals · soccer-only · no betting/odds · generic trophy (no logos).

## Production notes
- **Images:** Higgsfield `nano_banana_pro` — hero text-to-image; 4 beats with hero imported as media reference (face locked).
- **Clips:** Higgsfield `kling3_0_turbo` 9:16 (declined "IN THE DARK" preset). Right arm kept angled-away/implied across beats.
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`; voice-forward mix (BGM −15 dB, high-passed, sidechain-ducked), −16 LUFS.

## Asset manifest
- `assets/raw/` — hero, beat2_loss, beat3_goal, beat4_final, beat5_trophy (source stills)
- `assets/audio/` — vo_brian.mp3, bgm.mp3, narration_master.mp3, vo_script.txt
- `assets/clips/` — 1_hero…5_trophy (kling3_0_turbo); `jobs.txt` (job ids)
- `hf/` — index.html, bg.mp4, card.png (hero portrait), brand-mark.svg

## Rebuild
```
cd hf && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../assets/audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_castro_wc26.mp4
```
