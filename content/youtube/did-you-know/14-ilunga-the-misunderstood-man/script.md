# Short 14 (DC-3) — The Misunderstood Man (Mwepu Ilunga, Zaire 1974)

**Final:** `dyk_ilunga_wc26.mp4` · 1080×1920 · 9:16 · ~49s · −16 LUFS voice-forward · **Engine:** fal.ai
**Arc:** DRAMA → IDOL (dignity restored) · advertises worldcup26.world. **Tone:** reverent — reframes a "joke" as defiance, NO mockery, NO violence.

## Title
Did You Know… Football's "Dumbest" Moment Was Actually A Protest?

## Brian VO
> Did you know the most ridiculed moment in World Cup history was actually an act of rebellion? 1974 —
> Zaire, against mighty Brazil. As Brazil lined up a free-kick, a defender named Mwepu Ilunga burst from
> the wall and booted the ball away. The world howled with laughter, and called it the dumbest moment
> football had ever seen. But Mwepu was not confused. His team had just learned the bonus they were
> promised was stolen by men close to their country's ruler. Unpaid, threatened, far from home, he tried
> to get himself sent off — the only protest he had left.
>
> **Close:** Collect Mwepu Ilunga's legendary card, and unlock the story they never told you — free, at worldcup26.world.

## Labels
`DID YOU KNOW?` · `MWEPU ILUNGA` · `Zaire · 1974` · end card **The Misunderstood Man** · `Zaire · 1974`

## Visual arc (Pixar, character-locked, soccer-only, NO violence)
1. Hero — Ilunga in the green Zaire 1974 kit, proud/defiant, floodlit stadium (opener)
2. The wall — Zaire's defensive wall braces as Brazil lines up the free-kick
3. The moment — Ilunga bursts out and boots the ball away, fierce + deliberate (NOT comedic)
4. The truth — Ilunga alone in a dim dressing room, head bowed, an empty pay envelope (the stolen bonus — emotional, no violence)
5. Dignity — Ilunga stands tall, meets the camera, warm light reclaiming him (payoff / CTA bg)

## Sources (verified — hard rule #9, 2026-06-28)
- [Wikipedia — Mwepu Ilunga](https://en.wikipedia.org/wiki/Mwepu_Ilunga) · ESPN (his own words) · The Greatness Index.
- **Facts:** vs Brazil 1974 he ran from the wall and kicked the free-kick away; told L'Équipe/ESPN the squad's
  bonuses were intercepted by people close to the Mobutu regime; he wanted a red card in protest; many of that
  team later died in poverty. *Rock-solid on the incident + bonus dispute (his own account).*

## Monetization-safety
Made-for-kids=NO · AI disclosure=YES · cleared score · 100% AI visuals · soccer-only (green Zaire kit) · NO violence/weapons · no betting/odds/logos. Tone = dignity restored.

## Production
fal.ai: `nano-banana` hero + `nano-banana/edit` (hero ref) beats + `kling-video/v2.1/standard/image-to-video` clips.
VO ElevenLabs Brian; voice-forward master −16.5 LUFS. Render in scratchpad (Desktop EPERM workaround).

## Rebuild
```
cd hf && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../assets/audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest dyk_ilunga_wc26.mp4
```
