# WorldCup26 Bonus — Norway: The Viking Row (100s motivational team film)

A short motivational film for the Norway squad built around the real **Viking Row**
chant ("RO! RO!") — the fan shout requested by the owner (Facebook reel share) —
with the chant placed **between the players**, exactly as briefed. Clip-based only
(rule #11): 14 distinct video clips, every source used once, zero stills.
Advertises **worldcup26.world** (free to play · just for fun · no prizes).

## Output

`WorldCup26_Bonus_Norway_The_Viking_Row.mp4` — 1920×1080, 30fps, 100s, H.264/AAC.

## The verified story (REAL facts, sources below)

- The **Viking Row**: a Gjallarhorn signal, then a drumbeat, then the whole crowd
  sits and rows in unison while shouting **"Ro!"** (Norwegian for "row").
- Created by designer **Ole Frøystad** ("Mr. Row Row") for the **Oljeberget**
  supporter club in late 2025; first performed at the **March 2026 friendly vs
  Switzerland**; took off after the 1 June 2026 friendly vs Sweden.
- Norway are at their **first World Cup since 1998** (28 years).
- Norway **beat Brazil on 5 July 2026**; **Erling Haaland led the chant** after the
  match (Crown Prince Haakon joined in). Ødegaard led it after the Senegal and
  Ivory Coast wins. **No scorelines are stated in the film** (real-results-only rule:
  only the win itself, which is real and verified, is referenced).

Sources: Wikipedia "Viking Row"; FIFA.com "'Viking Row' powering Norway's FIFA World
Cup euphoria"; Yahoo Sports "Norway's soccer chant, explained"; TIME (6 Jul 2026)
"Erling Haaland Is Proving Himself Wrong".

## Structure (100s)

| t | scene | clip | audio |
|---|-------|------|-------|
| 0–8 | Cold open — fjord stadium, title NORWAY / THE VIKING ROW | stadium | rumble + Brian 00 |
| 8–16 | The Gjallarhorn sounds | horn | horn blast + Brian 01 |
| 16–24 | The Row begins | row1 | crowd RO! RO! + Brian 02 |
| 24–32 | ERLING HAALAND | Erling-Haaland | Brian 03 |
| 32–36 | Chant burst — drummer | drummer | RO! on every drum hit |
| 36–44 | MARTIN ØDEGAARD | Martin-Odegaard | Brian 04 |
| 44–48 | Chant burst — flags | row2 | RO! RO! |
| 48–56 | ANTONIO NUSA | Antonio-Nusa | Brian 05 |
| 56–60 | Chant burst — family rows | family | RO! RO! |
| 60–68 | ALEXANDER SØRLOTH | Alexander-Sorloth | Brian 06 |
| 68–72 | Chant burst — flares | flares | RO! RO! |
| 72–80 | SANDER BERGE | Sander-Berge | Brian 07 |
| 80–88 | They rowed past Brazil (real) | celebration | roar + Brian 08 |
| 88–94 | The longship sails on | finale | tunnel + Brian 09 |
| 94–100 | CTA worldcup26.world — free to play, just for fun, no prizes | (DOM card) | Brian 10 |

The chant audio is the **native audio of the generated clips** (Seedance 2.0 with
audio ON) mixed at each clip's slot by `mux.mjs` (`vol` > 0 in `clips.json`) — no
copyrighted crowd recordings anywhere (100% AI rule). The Facebook reel was only
the creative reference; none of its audio or footage is used.

## Voice

Brian canon kept without an ElevenLabs key in this sandbox: the narrator voice is a
**clone of our own committed Brian lines** (Lukaku film, lines 00–06) via Higgsfield
voice cloning (`Brian Narrator WC26`, element `857b6dce-…`), spoken through
`seed_audio`. See `fal-jobs.json` for every job id.

## Build

```bash
PORT=8123 node serve.mjs &
CHROMIUM_PATH=/opt/pw-browsers/chromium FPS=30 DURATION=100 OUT=frames node render.mjs
FPS=30 DURATION=100 OUTFILE=WorldCup26_Bonus_Norway_The_Viking_Row.mp4 node mux.mjs
```

Or simply `npm run serve` (background it yourself) followed by `npm run render` and
`npm run mux` — the package scripts already default to port 8123 / 100s / the
correct output filename, so no env overrides are required.

## Music (credit in the upload description)

"Crossing the Chasm", "Five Armies", "Heroic Age" — Kevin MacLeod (incompetech.com),
Licensed under Creative Commons: By Attribution 4.0, https://creativecommons.org/licenses/by/4.0/

## Monetization-safety checklist (PREUPLOAD_CHECKLIST.md)

- No odds/betting/prize wording — CTA chips are FREE TO PLAY / JUST FOR FUN / NO PRIZES ✔
- Made for kids = **No**, AI/altered content disclosure = **Yes** at upload ✔
- Cleared music only (Kevin MacLeod CC-BY 4.0, credited) ✔
- 100% AI visuals, no broadcast footage, no club/FIFA logos ✔
- No subtitles / no sentence text on screen; labels ≤4 words ✔
- No clip used twice ✔ · Soccer-only imagery ✔ · No scoreline stated as fact ✔
