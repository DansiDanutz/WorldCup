# Lukaku — The Promise (5-minute player drama film)

**Format:** standalone 5:00 (300s) drama-mystery player film for `@DansLab-Kimi` —
"the man behind the goals." Brian (ElevenLabs) VO, Pixar-style clip-based visuals
(fal/Higgsfield), **NO on-screen subtitles** (CLAUDE.md #10), soccer-only.

**Logline:** Last night an idol scored. The world saw a giant — but almost no one
knows the secret he still carries: a six-year-old boy in Antwerp who watched his
mother water down the milk, and made an impossible promise. This is how football
let him keep it.

## Verified facts (do NOT invent beyond these)
- Romelu Lukaku — born **13 May 1993, Antwerp, Belgium**.
- Aged ~6 he saw his mother **mix water into the milk** to make it last; "we were
  **broke** — not just poor." Bread-and-milk lunches.
- Father **Roger Lukaku** = an ex-professional footballer; when his career/income
  ended the family fell into poverty → **social housing**, up to ~**3 weeks with
  no electricity**, sleeping on a mattress on the floor.
- His **grandfather's dying wish**: take care of his mother. He vowed to be a pro
  by **16** — and made his **Anderlecht** first-team debut at **exactly 16** (2009).
- Path: Rupel Boom (6) → Lierse (13) → Anderlecht → Chelsea → West Brom → **Everton**
  → **Manchester United (42 goals)** → **Inter Milan (64 goals; 2020–21 Serie A
  title)** → Chelsea → Roma.
- **Belgium all-time top scorer: 89 goals, 124 caps** (by Nov 2025). **300+** career
  goals. Played World Cups 2014/2018/2022 and Euros 2016/2020/2024.
- Publicly named the racist double standard: scoring = "the Belgian striker"; missing
  = "the Belgian striker of Congolese descent." He answered with goals.

## Beat structure (mapped to narration.json timings)
1. **0–15 — HOOK/MYSTERY:** last night's goal; "the idol carries a secret."
2. **15–50 — THE SECRET:** the boy at the fridge; the watered-down milk; "broke."
3. **50–82 — FAMILY DRAMA:** father's lost career; no electricity; grandfather's wish.
4. **82–130 — THE PROMISE:** pro by 16; debut at exactly 16 (kept).
5. **130–195 — RISE & ACHIEVEMENTS:** Everton/United/Inter/title; Belgium record; idol.
6. **195–232 — ADVERSITY:** racism's double standard; answered with goals.
7. **232–285 — REDEMPTION:** every goal for the woman at the fridge; promise = idol.
8. **285–300 — PAYOFF + CTA:** "now you know the secret"; worldcup26.world (free, for fun).

## Shot / clip plan (generate via fal, Pixar-style, soccer-only, 16:9 1080p)
Reuse the VideoSprite clip engine (copy `match-kit.jsx` + `match.html` + `render.mjs`
from a clip-based episode). Clips to generate (text→video unless noted):
| id | prompt seed |
|---|---|
| goal-roar | floodlit stadium night, a powerful striker wheels away roaring after scoring, crowd erupts, confetti |
| boy-fridge | Pixar boy ~6 opens a dim fridge at dawn, sad; a tired mother pours water into a milk carton (emotional, soft light) |
| flat-dark | bare Antwerp social-housing flat, candlelight, a mattress on the floor, rain on the window |
| grandfather | an elderly man gently holds a small boy's hands, golden blessing light (an elder, NOT a player) |
| boy-train | a determined boy juggles a soccer ball alone on a wet concrete pitch at dusk |
| debut-16 | a teenage player walks out of a tunnel into floodlights, nervous and proud, round-neck club shirt |
| epl-red | a striker in a red round-neck shirt celebrates a goal, Premier League night |
| inter-title | a striker in blue-and-black stripes lifts a league trophy, blue smoke, ecstatic |
| belgium-record | a striker in a red Belgium round-neck shirt celebrates the record goal, flag wall behind |
| mother-proud | a proud mother in the stands, tears of joy, watching, warm light |
| idol-final | slow heroic push-in on the striker under floodlights, breathing, emotional, film grain |

(For a face-consistent Lukaku, first generate one Pixar character still, then image→video
each beat from it; otherwise the prompts above read as the archetype.)

## Status
- ✅ Script (`narration.json`) written from verified facts.
- ⏳ Clips + VO + render: queued behind the Ep22–25 rebuilds (local render CPU is busy).
  Clips can be fal-generated in parallel (cloud) on request.

## Sources
- The Players' Tribune / SI / CNBC — the milk-and-water story & poverty:
  https://www.si.com/soccer/2018/06/18/romelu-lukaku-recalls-day-he-knew-his-family-was-broke-how-it-has-shaped-his-career ·
  https://www.cnbc.com/2018/06/18/soccer-star-romelu-lukaku-says-hes-motivated-by-having-grown-up-poor.html
- Career & records: https://en.wikipedia.org/wiki/Romelu_Lukaku · https://www.sportskeeda.com/player/romelu-lukaku
- Racism double-standard quote (2018): https://feeds.bbci.co.uk/sport/football/44521723
