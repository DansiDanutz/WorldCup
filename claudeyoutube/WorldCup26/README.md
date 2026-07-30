# WorldCup26.world — "What We Built, What Football Left Behind" (Milestone + FIFA Records Special)

**A 20–25 min cinematic documentary** celebrating the worldcup26.world journey and the
**14,000-subscriber** milestone, then a records-and-memories special on FIFA World Cup 2026
(USA · Canada · Mexico) — the money, the records, the greatest winners, and the moments the
tournament will be remembered for.

- **Runtime:** ~23 min (1380s target). 1920×1080 · 30fps.
- **Narrator:** Brian (ElevenLabs). **NO on-screen sentence text** — labels/number cards only.
- **Visuals:** library-first animated clips (soccer-only, AI Pixar, no real footage/logos),
  HyperFrames number/record cards, no Ken-Burns, **no-repeat**.
- **Music:** Kevin MacLeod / incompetech (CC-BY 4.0), credited.
- **Monetization-safe (rule #0):** made-for-kids = No · AI-disclosure = Yes · cleared music ·
  no betting/odds/prize wording · app CTA "free to play · just for fun · no prizes."
- **Real-results rule:** WC2026 has been PLAYED — results are stated as fact and source-cited.
  Our earlier episode predictions are only ever referenced AS predictions.

---

## CHAPTER MAP (the timeline)

| # | Chapter | ~Time | Content |
|---|---------|-------|---------|
| 0 | Cold open | 0:00–1:00 | The trophy is lifted; a year ago this channel was tiny. Hook: "the World Cup is over — but here's what it leaves behind, and what we built together." |
| 1 | **What we built (worldcup26.world)** | 1:00–4:30 | The journey: the free pick-3 game, Legend Cards (Brian-voiced), the leaderboard, the episodes/Shorts. What the app is and how it grew alongside the channel. |
| 2 | **Thank you — 14,000** | 4:30–6:30 | The 14,000-subscriber milestone. From a handful to a stadium's worth of fans. Gratitude; the community made it. "And we're not stopping." |
| 3 | **The money (FIFA records)** | 6:30–11:00 | 2026 prize pool; what the WINNER got; what CLUBS got (Club Benefits Programme); how prize money exploded over the decades. [FIGURES ← research] |
| 4 | **The record books** | 11:00–15:00 | Most titles (Brazil 5…), all-time top scorer (Klose 16), records set/broken at WC2026 (Mbappé Golden Boot, 48-team/104-match format, attendance). [← research] |
| 5 | **The greatest winners** | 15:00–18:00 | The sides history calls the best (Brazil 1970…), one verified reason each. |
| 6 | **What it leaves behind (memories)** | 18:00–22:30 | Spain 1–0 Argentina (Ferran Torres 106'), Spain's 2nd title & first to hold men's+women's cups together. **Messi:** 8 goals/4 assists, adored — but no trophy, and even the Golden Ball went to Rodri (Messi took Silver); "the people's appreciation was his prize." **The Trump–Balogun red-card controversy.** The tournament's soul. |
| 7 | Close + CTA | 22:30–23:00 | "We continue." Next episodes tease; worldcup26.world free CTA; subscribe. |

---

## VERIFIED FACTS + SOURCES (hard rule #9 — never invent history)

### Locked (verified this build, 2026-07-26)
- **Final:** Spain 1–0 Argentina (a.e.t.), 19 Jul 2026; **Ferran Torres 106'**. Spain's **2nd** WC title
  (after 2010); first nation to hold the **men's and women's** World Cups simultaneously.
  — [CBS News](https://www.cbsnews.com/news/2026-fifa-world-cup-final-spain-argentina-sunday/) ·
  [Yahoo Sports](https://sports.yahoo.com/soccer/live/spain-argentina-world-cup-2026-score-result-schedule-live-updates-130000682.html)
- **Awards:** **Rodri** won the adidas **Golden Ball** (best player); **Messi** the **Silver Ball**;
  **Mbappé** the **Golden Boot** (his 2nd). Messi's line: **8 goals, 4 assists, 5 Player-of-the-Match awards** —
  yet no trophy in his last World Cup.
  — [NBC Sports](https://www.nbcsports.com/soccer/news/2026-world-cup-award-winners-golden-boot-golden-ball-best-young-player-golden-glove) ·
  [Yahoo Sports](https://sports.yahoo.com/articles/every-award-winner-2026-world-233500005.html) ·
  [FIFA](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/rodri-earns-adidas-golden-ball)
- **Trump–FIFA red card controversy:** USA's **Folarin Balogun** was sent off vs **Bosnia** (round of 32,
  a 2–0 USA win) for a stamp on Tarik Muharemović, triggering an automatic one-game ban. **Trump called
  FIFA president Infantino** to ask for a review; FIFA used **Article 27** of its disciplinary rules to
  suspend the ban, letting Balogun play. Widely condemned (Belgium's FA, UEFA, ex-FIFA officials) as
  political interference. **USA still lost to Belgium 4–1** (Seattle).
  — [Wikipedia — 2026 Trump–FIFA red card controversy](https://en.wikipedia.org/wiki/2026_Trump%E2%80%93FIFA_red_card_controversy) ·
  [CNBC](https://www.cnbc.com/2026/07/05/trump-fifa-balogun-world-cup-red-card-suspension.html) ·
  [Al Jazeera](https://www.aljazeera.com/sports/2026/7/6/why-fifas-balogun-red-card-suspension-after-trump-call-is-so-controversial)

### To fill from research agent (figures + records)
- FIFA 2026 total prize pool · winner payout · runner-up · group participation fee · **Club Benefits Programme** total.
- Historic winner-payout growth (milestone years).
- All-time records (titles, top scorer, appearances, youngest/oldest, biggest final, fastest goal) + WC2026 records.
- Greatest-winners list with one verified reason each.

*(Every figure that lands in `narration.json` must carry a source in this file before render.)*

---

## MONETIZATION-SAFETY CHECKLIST (run before render + upload)
- [ ] Made for kids = No · AI-disclosure = Yes · cleared music credited
- [ ] 100% AI Pixar visuals — no real footage, broadcast clips, club/FIFA logos, trophy art, or emblems
- [ ] Soccer-only; no betting/odds/prize wording; app CTA "free · just for fun · no prizes"
- [ ] Non-affiliation: "World Cup" used descriptively; no official FIFA marks near worldcup26.world/CTAs
- [ ] No on-screen sentence text (labels/number cards only); no-repeat clips
- [ ] Every stated result/figure is real and source-cited above (real-results rule)

## PIPELINE
`npm run serve` (:8126) → `npm run render` → `npm run voice` → `npm run mux`. See `STRUCTURE.md`.
