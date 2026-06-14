# WorldCup26 Legends — Thumbnail Kit

The standard episode-thumbnail generator. Every match episode's `thumbnail.jpg`
(1280×720) is produced here so the whole series stays visually consistent and
on the best-performing formula.

## The formula (why it looks the way it does)

Fuses the two things that actually win on our channel:

1. **Star face + ≤4-word hook** — the proven episode formula (Ep6 Messi breakout, 979 views with zero ad spend). One marketable face, big curiosity/stakes headline.
2. **The app's best-performing thumbnails** — "Pick 3 + climb" and "phone + leaderboard". Every thumbnail carries a phone showing the leaderboard with the episode's team climbing to **#1**, plus a **PICK 3 · FREE** pill and `worldcup26.world`.

Layout: star face left (gradient-masked), gold hook top-left, leaderboard phone
right, name tag + match + URL bottom-left, episode badge top-right. Brand colors
from `content/youtube/THUMBNAIL_GUIDE.md`. Soccer only — never NFL gear.

## Usage

```bash
cd marketing/match-videos/_thumbnail-kit
npm install                 # once (playwright; chromium is cached system-wide)
node gen-thumbnails.mjs            # render all -> ./out/epNN.jpg (review first)
node gen-thumbnails.mjs --ep 13   # render a single episode
node gen-thumbnails.mjs --install # render all AND copy into each episode's thumbnail.jpg
```

## Adding a new episode

Append an entry to `thumbnails.config.json`:

```json
{ "ep": 14, "dir": "match14-...", "img": "content/images/<Team>/<Player>.png",
  "name": "SURNAME", "hook": "TWO<br>WORDS", "face": "XXX", "away": "YYY",
  "marquee": "BRA", "sub": "HOME vs AWAY" }
```

- `img` — the star face (Pixar render in `content/images/`). Pick the most marketable name in the tie.
- `hook` — ≤4 words, curiosity/stakes; `<br>` splits the two lines.
- `face` — 3-letter code highlighted at #1 in the mini-leaderboard (add its brand color to `COLORS` in `gen-thumbnails.mjs` if new).
- `dir` — episode folder; `null` for the inaugural Ep1 (no pipeline folder; its file is `ep01-*.jpg` here).

Then `node gen-thumbnails.mjs --ep 14 --install`.

## Before redesigning the template

Per the series rule, **research first**: study our own YouTube Studio CTR data
and the fastest-growing football / faceless-narration channels, then copy what
works. See `content/youtube/THUMBNAIL_RESEARCH.md` and keep it updated.

`out/` is regenerable and gitignored; the committed source + each episode's
`thumbnail.jpg` are the deliverables.
