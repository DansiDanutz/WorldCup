# Episode 20 — Iran vs New Zealand

**Group G · real kickoff 04:00, Tue 16 June 2026 (FedExField, Washington D.C.)** · Mystery Supporter: **Legend 020 — the Unbeaten**
Canon: `content/Stories/Iran-vs-New-Zealand.md` · Script: `narration.json` · Predicted score (OUR PREDICTION): **1–1**

> Packaging status: narration script ✅, render project ✅. VO / mux / thumbnail / git are the
> downstream steps (built from the Ep2 template: React timeline → Playwright frames →
> ElevenLabs Brian VO → ffmpeg mux). This episode is IMAGE-BASED (Ken-Burns on player stills);
> no Higgsfield clips. Player PNGs copied from `content/images/` via `fetch_assets.mjs`.

## The true-history hook (verified)
At the **2010 World Cup** in South Africa, **New Zealand were the ONLY team in the entire
tournament not to lose a single match** — three draws: **Slovakia 1–1** (Winston Reid's
93rd-minute header, the All Whites' first ever World Cup point), **Italy 1–1** (Shane Smeltz
scored against the defending world champions), and **Paraguay 0–0**. New Zealand went home in
the group stage **unbeaten** — while the defending champions, **Italy, finished bottom of the
group and were eliminated**. The strangest unbeaten exit in World Cup history.

Secondary verified history: at **France 1998** (21 June 1998, Lyon), **Iran beat the USA 2–1**
in a politically charged match — Iran's **first ever World Cup win**. Yet across their whole
history **Iran have never advanced past the group stage** — the same ache New Zealand carry.

- Wikipedia — 2010 FIFA World Cup Group F: https://en.wikipedia.org/wiki/2010_FIFA_World_Cup_Group_F
- CNN — Reid snatches historic first World Cup point for New Zealand: http://www.cnn.com/2010/SPORT/football/06/15/new.zealand.slovakia.group.f/index.html
- Al Jazeera — Reid makes history for New Zealand: https://www.aljazeera.com/sports/2010/6/16/reid-makes-history-for-new-zealand
- Wikipedia — New Zealand at the FIFA World Cup: https://en.wikipedia.org/wiki/New_Zealand_at_the_FIFA_World_Cup
- Wikipedia — United States v Iran (1998 FIFA World Cup): https://en.wikipedia.org/wiki/United_States_v_Iran_(1998_FIFA_World_Cup)
- CNN — A match like no other: Iran v USA at the 1998 World Cup: https://www.cnn.com/2022/11/28/football/iran-usa-france-1998-spt-intl

> NOTE on dates: the broadcast/production schedule (`content/youtube/SCHEDULE.md`) lists this
> fixture at **Tue 16 June 2026, 04:00** (chronological slot 20). The canon story file frames
> it as the Group G Matchday-3 decider; the episode treats the scoreline as **OUR PREDICTION**.

## Mystery Supporter — Legend 020: the Unbeaten
An old All Whites fan who was in South Africa in 2010 and saw all three draws. He has **never
once seen New Zealand lose at a World Cup** — and he keeps that flame burning. Collect him in
the game at worldcup26.world. (Cold-open hook → paid off in the reveal at 4:13.)

## Predicted final — OUR PREDICTION (not a result)
**Iran 1–1 New Zealand.** Taremi heads Iran in front from a Ghoddos cross (1–0); Cacace whips
one in from the left and Chris Wood climbs to equalise (1–1). Two underdogs, level, both still
standing — the All Whites stay unbeaten, Iran still chasing the door.

## Title
`The Team That Went Home Unbeaten | Iran vs New Zealand — World Cup 2026 (Ep.20)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 20**.

## Thumbnail
Star face: Chris **Wood** (NZL, black/white). Away star: Mehdi **Taremi** (IRN, red).
Hook: **HOME UNBEATEN**. Rebuild via `../_thumbnail-kit` (`thumbnails.config.json`, ep 20).

## Best 5 (assets/squad)
- Iran: Mehdi Taremi, Alireza Jahanbakhsh, Saman Ghoddos, Saeid Ezatolahi, Mehdi Ghaedi.
- New Zealand: Chris Wood, Marko Stamenic, Liberato Cacace, Kosta Barbarouses, Sarpreet Singh.

## Palette
Iran = red `#ce1126` + white + green `#239f40`. New Zealand = black `#1f1f1f` + white (silver
`#aab4c2` accent for legibility on the dark broadcast theme).

## Shorts (plan)
1. **HOME UNBEATEN** — the 2010 three-draws cold open (post 24h before premiere).
2. **WOOD CLIMBS — 1-1** — the Chris Wood equaliser climax (post day-of).
3. **LEGEND 020: THE UNBEATEN** — the mystery-supporter reveal (post day after).

## Build + render (this project)
```
npm install
npm run serve &      # PORT=8098 range-capable static server
FPS=30 DURATION=300 OUT=frames node render.mjs   # ~9000 frames
# downstream (NOT run here): npm run voice ; OUTFILE=WorldCup26_Match20_IRN_NZL.mp4 npm run mux
```

## Music
"Crossing the Chasm", "Desert City", "Five Armies", "Invariance" — Kevin MacLeod (incompetech.com), CC BY 4.0.
