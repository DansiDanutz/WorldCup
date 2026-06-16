# Player animation library — coverage (48-team audit)

Reusable, paid Higgsfield/fal animation clips per team. New clip-based episodes
MUST reuse these first (CLAUDE.md rule #11). One `.mp4` per star player (target 5).

**Reality check (the "all 48 done in Higgsfield" question):** the Higgsfield
*cloud* account holds only ~9 video media items — the player animations live
**in this repo**, not in the Higgsfield cloud. They were generated per-episode and
have now been consolidated here. As of this audit **21 of 48 teams** have saved
animations; **27 teams have none yet**.

## Covered (21 teams)
| Team | clips | source |
|---|---|---|
| Algeria | 5 | Ep6 |
| Argentina | 5 | Ep6 |
| Austria | 5 | Ep23 |
| Bosnia_and_Herzegovina | 3 | Ep3 |
| Brazil | 5 | Ep5 |
| Canada | 5 | Ep3 |
| Croatia | 5 | Ep25 |
| Czech_Republic | 3 | Ep2 |
| DR_Congo | 5 | Ep24 |
| England | 5 | Ep25 |
| Haiti | 5 | library |
| Iraq | 5 | Ep22 |
| Japan | 3 | Ep13 |
| Jordan | 4 | Ep23 |
| Morocco | 5 | Ep5 |
| Netherlands | 3 | Ep13 |
| Norway | 5 | Ep22 |
| Paraguay | 5 | Ep4 |
| Portugal | 5 | Ep24 |
| South_Korea | 3 | Ep2 |
| USA | 5 | Ep4 |

## Top-ups needed (have <5): Bosnia(3), Czech(3), Japan(3), Jordan(4), Netherlands(3), South_Korea(3)

## Missing entirely (27 teams)
Australia, Belgium, Cape_Verde, Colombia, Curaçao, Ecuador, Egypt, France,
Germany, Ghana, Iran, Ivory_Coast, Mexico, New_Zealand, Panama, Qatar,
Saudi_Arabia, Scotland, Senegal, South_Africa, Spain, Sweden, Switzerland,
Tunisia, Turkey, Uruguay, Uzbekistan

> Cost to complete: ~135 player clips + ~13 top-ups ≈ 148 × ~22.5 credits ≈ 3,300
> credits. Generate from `content/images/<Team>/<Player>.png` (image→video),
> soccer-only prompt, save as `content/videos/<Team>/<player>.mp4`.
