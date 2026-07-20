# Short 03 — The Eternal Keeper (Antonio Carbajal)

**Final video:** `dyk_carbajal_wc26.mp4` · 1080×1920 · 9:16 · ~50s · H.264 + AAC (−16 LUFS)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… He Became A Keeper To Hide From His Father?

## Brian VO (ElevenLabs — eleven_multilingual_v2)
> Did you know the first man to ever play in five World Cups… only became a goalkeeper to hide from his own father? When the family lost a son, young Antonio's father forbade him from ever touching a football again. So the boy chose the one position with a clear view of the whole field — in goal — so he could spot his father coming home, and run before he was caught. That desperate little trick to dodge his dad… became a record for the ages. Five World Cups in a row. The first human being in history to do it. And in the end, his father forgave him — and watched his boy become a legend.
>
> **Close (drives to app):** Collect Carbajal's legendary card, and unlock the full story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `ANTONIO CARBAJAL` · `Mexico · 5 World Cups` (lower-third)
- End card: **The Eternal Keeper** — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — young keeper alone in the misty dark goalmouth, god-rays (DID YOU KNOW opener)
2. **Child** — frightened boy gripping the goal net, glancing toward the gate (the wound / the trick)
3. **Save** — full-stretch diving save, fingertips to the ball, dust flying (the gift)
4. **Triumph** — weathered legend, gloved fists raised, golden light, father's forgiveness (the idol)
5. **Closing** — drift into the empty dark stadium (CTA bg)

## Sources (verified — hard rule #9)
- FIFA feature — Carbajal, the record-breaker (first to 5 World Cups, 1950–1966)
- en.wikipedia.org/wiki/Antonio_Carbajal
- *Confidence:* rock-solid on the 5-World-Cup record; the "keeper to watch for his father" origin is the widely-retold legend tied to his start in goal.

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · no betting/odds · real-results framing.

## Production notes — backend failover (documented for the pipeline)
Mid-build, all three video backends hit limits in sequence: imagine.art video credits depleted then partially refreshed (failed gens auto-refund), the `fal.ai` key returned 401 (expired — needs rotating), and the Higgsfield MCP connector dropped (its 4 rendered 720p clips became unreachable). Recovered on imagine.art:
- **Hero + child** beats: `seedance-2.0` **1080p** (sharp opener).
- **Save / triumph / closing**: `seedance-2.0-fast` **480p**, upscaled to 1080×1920 (lanczos) under the dark grade — real motion, holds up well. Each 1080p clip ≈ 1,815 credits vs ≈ 644 for 480p-fast; concurrent jobs reserve a large hold, so video gens must run **sequentially** when the balance is low.
- **Score:** reused Short 02's original imagine.art instrumental (channel theme), sidechain-ducked under VO, −16 LUFS.
- **VO:** ElevenLabs Brian, `eleven_multilingual_v2`.

> TODO when budget allows: optionally re-render the 3 fast/480p beats at 1080p for full parity.

## Asset manifest
- `assets/images/` — `hero`, `beat2_child`, `beat3_save`, `beat4_triumph`, `card_portrait`
- `assets/audio/` — `vo_brian.mp3`, `bgm.mp3`, `narration_master.mp3`, `vo_script.txt`
- `assets/clips/` — `1_hero` (1080p) … `2_child`/`3_save`/`4_triumph`/`5_closing` (480p)
- `assets/composition/` — `index.html` (HyperFrames cards), `bg.mp4`, `card.png`, `brand-mark.svg`

## Rebuild
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_carbajal_wc26.mp4
```
