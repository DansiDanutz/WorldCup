# Short 13 (DC-2) — The Forgotten Hat-Trick (Bert Patenaude)

**Final:** `dyk_patenaude_wc26.mp4` · 1080×1920 · 9:16 · ~49s · −16 LUFS voice-forward · **Engine:** fal.ai
**Arc:** DRAMA → IDOL · advertises worldcup26.world (legendary cards).

## Title
Did You Know… The First World Cup Hat-Trick Was Erased For 76 Years?

## Brian VO
> Did you know the first hat-trick in World Cup history was stolen from the man who scored it — for
> seventy-six years? 1930, the very first World Cup. A young American, Bert Patenaude, scored three goals
> against Paraguay — the first hat-trick the tournament had ever seen. But the records got it wrong. One
> goal was handed to a teammate, and Bert's place in history simply vanished. He lived an ordinary life,
> and died believing he was forgotten. Then in 2006, seventy-six years later, FIFA finally put it right —
> Bert Patenaude, the first man ever to score a World Cup hat-trick.
>
> **Close:** Collect Bert Patenaude's legendary card, and unlock the story they never told you — free, at worldcup26.world.

## Labels
`DID YOU KNOW?` · `BERT PATENAUDE` · `USA · 1930` · end card **The Forgotten Hat-Trick** · `USA · 1930`

## Visual arc (Pixar, character-locked, soccer-only)
1. Hero — Patenaude in the white 1930 USA kit, misty floodlit stadium (opener)
2. The hat-trick — striking the ball, scoring, crowd rising
3. The erasure — a ledger, a pen crossing out his name, his silhouette fading (sepia, melancholy)
4. Ordinary life — older Bert (1950s, flat cap) holding an old ball by a window, wistful
5. Vindication — his name glowing golden in a history book, light rays rising (2006 payoff / CTA bg)

## Sources (verified — hard rule #9, 2026-06-28)
- [Wikipedia — Bert Patenaude](https://en.wikipedia.org/wiki/Bert_Patenaude) · US Soccer · Yahoo Sports.
- **Facts:** scored 3 vs Paraguay 17 Jul 1930; 2nd goal long mis-credited (teammate/own goal); FIFA officially
  confirmed him as the first WC hat-trick on **10 Nov 2006**, 76 years later; he died in 1974. *Rock-solid.*

## Monetization-safety
Made-for-kids=NO · AI disclosure=YES · cleared score · 100% AI visuals · soccer-only (vintage USA kit, NOT NFL) · no betting/odds/logos.

## Production
fal.ai: `nano-banana` hero + `nano-banana/edit` (hero ref) beats + `kling-video/v2.1/standard/image-to-video` clips.
VO ElevenLabs Brian; voice-forward master −16.4 LUFS. Render in scratchpad (Desktop EPERM workaround).

## Rebuild
```
cd hf && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../assets/audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_patenaude_wc26.mp4
```
