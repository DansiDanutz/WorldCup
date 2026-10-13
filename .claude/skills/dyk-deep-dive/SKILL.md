---
name: dyk-deep-dive
description: >-
  Produce a "Did You Know? Deep Dive" — a 5-minute YouTube story about a FAMOUS,
  searchable player (Messi, Yamal, Mbappé, Haaland…) with every visual drawn in code
  (no Higgsfield, no generated footage, no faces), Brian VO, a new legend card in the
  app, and an upload kit. Use for any Deep Dive episode, the daily episode run, adding
  a Deep Dive card to the album, or planning the next Deep Dives. Engine:
  marketing/deep-dives/engine · queue: marketing/deep-dives/plan.json.
---

# Did You Know? Deep Dive (5-minute, code-drawn, famous players)

Read `CLAUDE.md` rules #0, #9, #10 first. This skill is the HOW.

## Why this format

- **Search demand.** Famous names (Messi, Yamal, Ronaldo, Mbappé, Haaland, Salah,
  Kane, Modrić, Bellingham, Rodri) are what people type into YouTube. Lead every
  title with the name. Obscure legends stay in the Shorts/FORGOTTEN lane.
- **Watch hours.** 5 minutes of story per upload is what the YPP threshold needs.
- **The album.** Every episode creates one new legend card that unlocks by watching it.

## LAW #1 — no faces, ever

We own no honest likeness of any famous player (the library's "Messi"/"Rodri" clips
were rejected by the owner because they depict other people). So a Deep Dive never
shows a face: players are **typography, numbers, faceless shirts, dots on a pitch and
lines on a map**. The engine only accepts code-drawn scene types; preflight refuses
anything else. No Higgsfield or other image/video generation.

## LAW #2 — verified or it doesn't ship

Every claim in the VO is web-searched before scripting and listed in `episode.json`
`sources` (claim + URL). Search with precise words (name + incident + year). Frame
anything single-sourced as "reportedly". Recheck numbers (ages, dates, days between
games) — the first Yamal draft said "four days" where it was five. Never state a
result that hasn't happened; WC 2026 is played (Spain 1–0 Argentina a.e.t., 19 July 2026).

## The episode shape (≈ 650–700 words → 4:45–5:15)

1. **Stakes first (0:00–0:20):** the searchable moment (date, final, record), then the
   "did you know?" turn → `title` scene with a ≤4-word hook label.
2. **Chapters 1–4** (`chapter` beats), each 5–8 beats of 1–3 sentences.
3. **Payoff:** tie the secret back to the opening moment.
4. **Card reveal** (`card` scene) — "This story is now a legendary card…"
5. **Close** (`phone` scene) — must say *worldcup26.world* and *no prizes*.

One beat = one VO chunk + one scene (or a list of scenes that split the beat).
Vary scene types; never three of the same in a row.

## Scene types (engine/story-kit.jsx + motion-kit.jsx)

| type | use | key props |
|---|---|---|
| `date` | split-flap date | `date`, `label` |
| `title` | cold-open title, shirt + name | `label` (hook) |
| `chapter` | chapter card | `title` (≤4 words) |
| `nameplate` | a name/record as typography | `name`, `meta`, `stat` |
| `stat` | number counting up | `value`, `label`, `sub`, `prefix/suffix/decimals` |
| `impact` | one slammed phrase | `text` (≤4 words) |
| `kinetic` | up to 4 words punching in | `words:[{w,at}]` |
| `jersey` | faceless shirt (club/age variants) | `colors`, `number` ('' = none), `name`, `label` |
| `route` | journey on an abstract map | `a`, `b`, `stops` ({name,x,y} in 1600x700) |
| `pitch` | moment reconstructed with dots | `frames:[{t,ball,home,away}]` (105x68 m) |
| `artifact` | napkin / polaroid with date | `kind`, `date`, `title` |
| `versus` | compared bars | `rows:[{label,value,accent}]` |
| `heartbeat` | ECG racing → settling | `bpmFrom`, `bpmTo`, `label` |
| `timeline` | years lighting up | `years:[{v,label≤3 words}]` |
| `clock`, `ballnet`, `stadium` | match minute, goal, crowd | `to`, `label` |
| `card` | the episode's new card | (automatic; `card.story` ≤45 words — the album reads it aloud) |
| `phone` | worldcup26.world end card | (automatic) |

On-screen text: names, numbers, dates and labels of **≤4 words**. Never a sentence.
Banned anywhere: odds, bet, stake, wager, jackpot, bookmaker, coefficient, prize money,
cash prize, payout (preflight greps VO, labels, title and card).

## Build one episode

```bash
cd marketing/deep-dives
mkdir episodes/NN-slug && $EDITOR episodes/NN-slug/episode.json   # copy 01 as the template
PREVIEW=1 node engine/build.mjs episodes/NN-slug                    # estimated timing
CHROMIUM_PATH=/usr/bin/google-chrome node engine/make-art.mjs episodes/NN-slug
PREVIEW=1 node engine/preflight.mjs episodes/NN-slug                # must be GREEN
# smoke-check frames (one per scene type) before the long render:
#   serve from repo root, render.mjs with SHOTS=..., tile with ffmpeg, LOOK at them
bash engine/run.sh episodes/NN-slug          # VO -> build -> art -> PREFLIGHT -> frames -> mux -> QA -> kit
```

`run.sh` needs `ELEVENLABS_API_KEY` (environment secret) for Brian. Without it, only
`PREVIEW=1 bash engine/run.sh …` works — a silent-VO preview that must never be uploaded.
Renders resume from the first missing frame; ~4.5 fps (≈35 min for 5 min of film).

Outputs: `episodes/NN-slug/output/DidYouKnow_NN_<Player>.mp4`, `output/thumbnail.jpg`,
`UPLOAD_KIT.md`, and the card art `public/legend-cards/deep-dive/NN-slug.png`.
`output/` and `build/` are gitignored; the MP4 is delivered, not committed.

## The card → the app

A card can only go live once its video is public on @DansLab-WorldCup (it unlocks by
watching that video). Two ways:

```bash
node scripts/deep-dive-cards.mjs add marketing/deep-dives/episodes/NN-slug <youtube-url>
node scripts/deep-dive-cards.mjs sync     # matches built episodes to the channel feed
```

Both verify the video is public, embeddable and on the canonical channel, write
`src/lib/deep-dive-cards.json` (read by `legend-card-registry.ts`) and mark the episode
`published` in `plan.json`. Then `pnpm test`, commit, PR, merge, and promote the
production deployment on Vercel (auto-promotion is off) and confirm the card on
worldcup26.world.

## The daily run (one episode per day)

1. `node scripts/deep-dive-cards.mjs sync` → ship any newly uploaded episodes' cards.
2. Take the first `planned` row in `plan.json`; research + verify its hook (LAW #2);
   write `episode.json` (≈680 words, 4 chapters, sources).
3. Preview build + art + preflight GREEN + smoke frames looked at.
4. If `ELEVENLABS_API_KEY` exists: `bash engine/run.sh` → final MP4 → set the row to
   `built`. If not: stop at the preview and say the voice key is missing — never ship
   a preview, never substitute another voice.
5. Commit the episode folder, card art and plan; PR → merge.
6. Deliver the MP4 + thumbnail + UPLOAD_KIT to the owner (split into ≤25 MB parts on
   a delivery branch if needed, per the documentary skill §7).

## Rejections to never repeat

| Problem | Rule |
|---|---|
| Name wrapped mid-word in the title | `PlayerTitle` wraps between words only |
| "THE NEXT MESSI?" over a wall of other players' faces | never put a person's name next to someone else's face |
| Academy-era shirt showing the current number | `number: ''` for past-era shirts |
| "PICK 3 · FREE" on the phone end card | the game is retired: `COLLECT · FREE` |
