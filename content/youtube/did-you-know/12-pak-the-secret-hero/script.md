# Short 12 (DC-4) — The Secret Hero (Pak Doo-ik / North Korea 1966)

**Final video:** `dyk_pak_wc26.mp4` · 1080×1920 · 9:16 · ~49s · H.264 + AAC (−16 LUFS, voice-forward)
**Series:** WorldCup26 Legends — "Did You Know?" Shorts · **Arc:** DRAMA → IDOL (mystery)
**Advertises** worldcup26.world (legendary cards). **Engine:** fal.ai (nano-banana + Kling i2v).

## Title (upload)
Did You Know… An Unknown Factory Worker Knocked Italy Out Of The World Cup?

## Brian VO (ElevenLabs eleven_multilingual_v2, voice-forward mix)
> Did you know the greatest shock in World Cup history was pulled off by a team nobody had ever heard
> of — and then they vanished? 1966. North Korea — a thousand-to-one outsider, written off before a
> ball was kicked. Their hero was no superstar: Pak Doo-ik was a humble worker from a printing factory.
> Against the mighty Italy, three minutes before half-time, Pak struck. Korea, one. Italy, nil. The
> giants were out. A whole English town — Middlesbrough — fell in love with these smiling strangers,
> and roared them into the quarter-finals, the first Asian team ever to get there. And then they went
> home behind a closed border, and the world never saw them again — for thirty-six years, until
> Middlesbrough finally brought its heroes home.
>
> **Close (drives to app):** Collect Pak Doo-ik's legendary card, and unlock the story they never told you — free, at worldcup26.world.

## On-screen labels (HyperFrames cards only — NO sentence subtitles)
- `DID YOU KNOW?` (opener)
- `PAK DOO-IK` · `North Korea · 1966` (lower-third)
- End card: **The Secret Hero** · `North Korea · 1966` — *Collect his legendary card · Free at worldcup26.world*

## Visual arc (dark cinematic Pixar, character-locked, soccer-only, no logos)
1. **Hero** — Pak in the red North Korea 1966 kit, floodlit English stadium (DID YOU KNOW opener)
2. **The worker** — Pak in a 1960s printing factory, apron, cradling a ball (humble origins)
3. **The goal** — striking past a diving keeper vs Italy, crowd erupting (the shock)
4. **The love** — Pak + teammates celebrating, Middlesbrough fans roaring (adopted heroes / QF)
5. **The vanishing** — red-shirted silhouettes walking into golden mist, one glancing back (CTA bg)

## Sources (verified — hard rule #9, web-researched 2026-06-28)
- [FIFA — Korea DPR v Italy 1966](https://www.fifa.com/en/tournaments/mens/worldcup/articles/korea-dpr-italy-1966) ·
  [Wikipedia — Pak Doo-ik](https://en.wikipedia.org/wiki/Pak_Doo-ik) · Sky HISTORY.
- **Verified facts:** Pak (a Pyongyang **print-factory worker**, NOT the "dentist" of Italian legend) scored
  vs Italy at Ayresome Park, Middlesbrough, ~3 min before half-time; Korea 1–0 Italy; reached the **quarter-finals**
  (first Asian team to); Middlesbrough adopted the team and brought survivors back in **2002**. *Confidence: rock-solid.*
- Note: alleged post-tournament "punishment" of players is via defector accounts — kept OUT of the VO (only "behind a closed border / never seen again," which is accurate).

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · 100% AI visuals · soccer-only · no betting/odds · no real footage/logos.

## Production notes
- **Engine: fal.ai** (Higgsfield credits were exhausted on Castro). Images: `fal-ai/nano-banana` (hero) +
  `fal-ai/nano-banana/edit` (4 beats, hero as reference → face locked). Clips: `fal-ai/kling-video/v2.1/standard/image-to-video`.
  **fal queue note:** nano-banana/edit results poll under the BASE path `fal-ai/nano-banana/requests/<id>` (NOT `/edit/...`).
- **VO:** ElevenLabs Brian `eleven_multilingual_v2`, atempo 1.12 to fit; voice-forward mix (BGM −15 dB, high-passed, sidechain-ducked), −16.5 LUFS.

## Rebuild
```
cd hf && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30   # render in scratchpad if Desktop EPERMs
ffmpeg -i overlayed.mp4 -i ../assets/audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_pak_wc26.mp4
```
