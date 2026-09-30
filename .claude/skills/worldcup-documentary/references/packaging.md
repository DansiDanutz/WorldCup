# Packaging a WorldCup26 long-form video

## Title law — searchable promise first, myth second

A viewer must instantly understand the topic and the reason to click. Put the
clear search phrase at the FRONT; the mythic phrase goes second, or into the
thumbnail/description. Keep the most important words near the beginning and the
whole title ≈55–70 characters so it isn't truncated on mobile.

- Weak: `What Football Left Behind — A WorldCup26 Story`
- Strong: `World Cup 2026 Records: The Money, Messi, And What Remains`

The title must accurately represent the video. If CTR is good but retention drops
fast, the package overpromised — fix the intro or make the title more honest.

## Thumbnail law

- **One dominant subject.** A hero legend card, a face, or one huge number.
- **≤4 words.** Readable at 168 px wide (mobile feed size). Test by shrinking it.
- **Clear tension or a question**, not a label.
- **No clutter** — no more than two type sizes, no paragraphs, no logo soup.
- **No FIFA marks**: no official emblem, trophy art, mascot, official typeface,
  host-city marks, or official-looking layout near `worldcup26.world`. Use generic
  soccer imagery, country colours, and our own brand marks instead.
- **Brand:** WorldCup26 green `#106b4f`, gold `#f6b40e`/`#ffd24a`, Inter, deep
  navy-black ground `#050608`.
- **Soccer only** — never gridiron gear (AI models default US players to NFL kit).

Build it as HTML and screenshot it with Playwright at 1280×720 — brand-true,
frame-exact, and it costs no Higgsfield credits. Reuse the real card PNGs from
`public/legend-cards/` so the thumbnail also advertises the app.

```bash
node -e "…playwright → page.setViewportSize({width:1280,height:720}) → screenshot…"
```

Deliver a `.jpg` under 2 MB (YouTube's limit).

## Description shape

1. **Hook paragraph** — restate the promise in prose, front-load the search terms
   (first ~150 chars show in search results).
2. **Chapters** — real timestamps starting at `0:00`. These earn key-moment
   surfacing and help retention.
3. **The app CTA** — after the value, never as the cold open. Always carries
   *"free to play · just for fun · no prizes."*
4. **Credits** — Kevin MacLeod / incompetech CC-BY 4.0, named cues + licence URL.
5. **Disclosures** — AI-generated visuals; non-affiliation line.

## Non-affiliation line (use verbatim)

> Not affiliated with, endorsed by, or associated with FIFA or any football
> federation. "World Cup" is used descriptively to refer to the tournament.

## Tag strategy

~15–25 tags, ordered broad → specific, mirroring the title's search phrase first.
Include the channel/brand tag and the series name. Don't keyword-stuff unrelated
terms — it suppresses rather than helps.

## Upload checklist (⚠️ monetization)

- Made for kids → **No** (Pixar style auto-flags and silently kills fan funding)
- Altered/AI content disclosure → **Yes**
- Music: cleared only, credited in the description
- No odds, betting, prize, or cash wording anywhere — the game is free-to-play
- Premiere scheduled ≥48 h ahead, added to the "All Episodes" playlist
- Pinned comment with the app CTA + the no-prizes line
