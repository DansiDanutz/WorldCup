# [SUPERSEDED — do not build] France vs Senegal early draft

> **⚠️ Abandoned early scaffold** (renamed from `match14-france-vs-senegal` on
> 2026-07-11). France vs Senegal was actually produced as **Ep21** in
> `match21-france-vs-senegal` — use that folder. On the channel, **Ep14 =
> Netherlands vs Japan** (folder `match13-netherlands-vs-japan`, published out of
> order — see `content/youtube/PRODUCTION_LOG.md`). Kept only for reference.

Series **Episode 14** (original draft heading — superseded, see banner above).
A 5-minute (300s, 1920×1080, 30fps) cinematic episode built on the **Ep2 template**
(content-swap model — see `PRODUCTION_ACCELERATION.md`).

- **Story source (canon):** `content/Stories/France-vs-Senegal.md`
- **Fixture:** Group I, Matchday 1 — SoFi Stadium, Los Angeles.
- **Mystery Supporter:** **Legend 014 — the Lion of Gorée** (an old Senegalese
  griot/drummer said to carry the ancestors onto the pitch since the 2002 upset).
- **Next-episode tease:** **Ep15 — Spain** (per `PREMIERE_CALENDAR.md` produce-next).

> ⚠️ **SCHEDULING / PLACEMENT NOTE (read before you publish).** France v Senegal
> is **Matchday 1 (June 12)** — that match has already been played, so this is an
> **evergreen / watch-hours publish, NOT a ≥48h pre-match Premiere.** It is still
> high-value (France + Senegal star power → watch hours, the monetization goal).
> If you want the buffer's first *Premiere*, produce an **upcoming** France
> fixture instead (France v Iraq or France v Norway, MD2/MD3). Either way the
> episode NUMBER stays 14 — numbering is by production order, not match date.

## Timeline (300s) — same skeleton as Ep2, France/Senegal content

| t (s) | Scene | Beat |
|------|-------|------|
| 0–16 | Cold open | "One goal in 2002… the champions of the world fell to a country they once ruled." Heartbeat + flash-cuts → empire-and-lion reveal |
| 16–28 | Title card | Episode 14 · FRA 🇫🇷 vs SEN 🇸🇳 · Group I · SoFi Stadium, LA |
| 28–44 | Stadium | SoFi flyover + H2H strip (only 1 meeting that mattered: 2002) |
| 44–98.5 | The History | 2002 WC opener: champions France vs first-timers Senegal; Papa Bouba Diop 30'; Senegal 1-0; France out without scoring; symbol of African defiance; 24 years later both are champions |
| 98.5–133.5 | France | Squad montage → Mbappé / Dembélé / Tchouaméni animated + lower thirds |
| 133.5–164.5 | Senegal | Squad montage → Mané / Jackson / Koulibaly + hopeful ultra |
| 164.5–186 | The Duel | The Prince vs The King — Mbappé speed vs Mané will (split screen, VS badge) |
| 186–242 | The Drama (OUR PREDICTION) | 56' Mbappé goal (France 1-0); Mané at 34 tracks back, wins it, → Jackson counter → Senegal equalise; FT **1–1** |
| 242–262 | Verdict | Group I table after MD1 — left open |
| 256–270 | Mystery Supporter | **Legend 014 — the Lion of Gorée** revealed |
| 262–286 | App promo | worldcup26.world — pick 3, free to play, climb the leaderboard, just for fun, no prizes |
| 286–300 | CTA outro | Subscribe/Like/Share + named share trigger + **Spain (Ep15) tease** |

## Files in this folder (authored)
- `narration.json` — Brian's VO script, timed to the 300s slots. **Ready.**
- `clips.json` — clip/music/SFX placements with France/Senegal assets. **Ready.**
- `assets-urls.json` — asset keys to fill after Higgsfield generation (URLs blank).

## To finish the build (producer steps)

**1. Bring in the template engine (content-swap model).** Copy the reusable code
from the Ep2 template into this folder (these are NOT episode-specific logic, they
read `narration.json` / `clips.json`):
```
cp ../match02-south-korea-vs-czech-republic/{match.html,animations.jsx,match-kit.jsx,match-scenes.jsx,render.mjs,serve.mjs,mux.mjs,gen_audio.mjs,fetch_assets.mjs,package.json,package-lock.json} .
cp -r ../match02-south-korea-vs-czech-republic/{music,sfx} .   # reuse score + SFX (don't regenerate)
```

**2. Swap the ON-SCREEN TEXT in `match-scenes.jsx`** (the only episode-specific
strings — VO + clips already come from the json files):
- Episode badge → `14`; teams → `FRANCE` / `SENEGAL`; flags → 🇫🇷 / 🇸🇳; venue → `SoFi Stadium · Los Angeles`
- History captions → 2002 opener / Bouba Diop 30' / Senegal 1-0 / France out / symbol of defiance
- France lower-thirds → Mbappé, Dembélé, Tchouaméni · Senegal → Mané, Jackson, Koulibaly
- Duel card → "THE PRINCE vs THE KING"; score plate → **1–1** with the **OUR PREDICTION** label
- Group table → Group I; Mystery reveal → "Legend 014 — the Lion of Gorée"; tease → "Next: Spain"

**3. Generate the Higgsfield assets** (prompts below), paste URLs into
`assets-urls.json`.

**4. Render with the one-command build** (`PRODUCTION_ACCELERATION.md`):
```
ELEVENLABS_API_KEY=sk_... VOICE_NAME=Brian \
  ../build-episode.sh match14-france-vs-senegal
```

## Higgsfield asset prompts (SOCCER ONLY — hard rule)

Every prompt MUST include: *"SOCCER player / SOCCER jersey (round-neck football
shirt), NO helmet, NO shoulder pads, NOT american football; a soccer pitch with
goals."* Review every output for the correct sport before use.

Players (Pixar-style, image → 5s kling 2.6 video, vertical action):
- `player-mbappe` — France #10, dark navy soccer kit, explosive sprint, electric blue energy trail.
- `player-dembele` — France soccer kit, dazzling close dribble, ball glued to feet.
- `player-tchouameni` — France soccer kit, commanding midfield stride, calm authority.
- `player-mane` — Senegal green soccer kit #10, relentless run then a clean sliding tackle, lion aura.
- `player-jackson` — Senegal soccer kit, ice-cold counter-attack sprint.
- `player-koulibaly` — Senegal captain, towering defender, armband, calm wall.

Crowd emotions (Pixar-style fans):
- `fan-fra-euphoric` / `fan-fra-anxious` — French supporters (blue), joy / nerves.
- `fan-sen-hopeful` / `fan-sen-euphoric` — Senegalese supporters (green), hope / roaring joy with drums.

Venue & mystery:
- `stadium-sofi` — SoFi Stadium LA exterior + soccer pitch flyover, dusk, full house.
- `mystery-griot` — an old Senegalese griot in white robes with a sabar drum, glowing ancestral aura, mystical (the Lion of Gorée). NOT a player.

## Thumbnail brief (1 face + ≤4 words; title/thumb are ONE package)
- **Image:** Sadio Mané close-up, fierce/determined, green kit; small 🇫🇷vs🇸🇳 flags; **Legend 014** badge corner.
- **Text (≤4 words, thick black-outlined gold):** `THE EMPIRE'S GHOST`
- Pairs with the hook-first title (thumbnail asks, title answers — don't repeat words).
- SOCCER ONLY — no NFL gear; review before use.

## Music attribution (required in the YouTube description)
> "Achilles", "Five Armies", "Invariance" — Kevin MacLeod (incompetech.com)
> Licensed under Creative Commons: By Attribution 4.0 — https://creativecommons.org/licenses/by/4.0/
