# Short 01 — The Vanished Hero (Joe Gaetjens)

**Final video:** `dyk_gaetjens_wc26.mp4` · 1080×1920 · 9:16 · ~52s · H.264 + AAC (−19 LUFS)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts
**Arc:** DRAMA → IDOL · advertises **worldcup26.world** (legendary cards), not the channel

---

## Title (upload)
Did You Know… The Man Who Beat England Vanished Forever?

## Brian VO (ElevenLabs)
> Did you know the man who pulled off the greatest shock in World Cup history… was erased from the earth — and his body was never found? 1950. Mighty England, the kings of football. Against them, a part-time American team nobody believed in. Then a Haitian named Joe Gaetjens threw himself at a cross and scored. USA one, England nil — the most stunning upset the World Cup had ever seen. Gaetjens went home to Haiti a hero. But his family stood against the dictator, Papa Doc. One morning in 1964, the secret police came for Joe. They took him to a prison of nightmares… and he was never seen again. No grave. No body. No answers.
>
> **Close (drives to app):** The man who beat England — gone without a trace. Collect his legendary card and unlock the full story, free at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener card)
- `JOE GAETJENS` · `USA 1–0 ENGLAND · 1950` (lower-third)
- End card: **The Vanished Hero** — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, soccer-only, no logos)
diving header → roaring upset celebration → tone shift to dark: shadowy figures, prison gates, an empty cell, fading out.

## Sources (verified — hard rule #9)
- en.wikipedia.org/wiki/Joe_Gaetjens
- Al Jazeera — the mysterious fate / disappearance
- *Confidence:* rock-solid on the 1950 upset + 1964 disappearance; exact death unknown — that IS the mystery.

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · music cleared · 100% AI visuals · no betting/odds · real-results framing.

## Asset manifest
- `assets/images/` — beat stills (hook, hero, goal, dark, disappearance) + `card.png`
- `assets/audio/narration_master.mp3` — Brian VO + BGM mix
- `assets/clips/` — Higgsfield/fal image→video animation clips
- `assets/composition/` — `index.html` (HyperFrames cards), `bg.mp4` (assembled film), `card.png`, `brand-mark.svg`

## Rebuild
HyperFrames render of `composition/index.html` (bg.mp4 + designed cards) → mux `narration_master.mp3`:
```
cd composition && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_gaetjens_wc26.mp4
```
