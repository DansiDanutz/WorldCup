# WorldCup26 Legends — Production Queue (chronological, single source of truth for ORDER)

> **Hard rule (CLAUDE.md #8):** produce & publish episodes in the EXACT order matches
> kick off on TV (date, then kickoff time). Each episode READY ≥48h before kickoff.
> Order source of truth = the live fixtures grid the owner shares (date + time).
> Every episode: AUTORESEARCHED verified "Did you know?" mystery+history hook,
> Brian VO, soccer-only, recap the previous episode's prediction.

Status: ✅ live · 🎬 rendered (master ready) · 🛠️ building/rendering · ⏳ queued

> **⚠️ STATUS NOTE (2026-07-11):** every group-stage kickoff listed below has now
> PASSED. Per CLAUDE.md, any episode not yet published is **RESCUE mode**
> (Shorts + retitle), not a Premiere. Episode numbers below were reconciled with
> the actual folders + narration on 2026-07-11: there is NO Brazil-vs-Haiti MD2
> episode — Ep34 = Turkey vs Paraguay, Ep35 = Netherlands vs Sweden,
> Ep36 = Germany vs Ivory Coast (folders `match34`–`match36`).
>
> **⚠️ CHANNEL STATE (2026-07-11):** the published series on the channel has
> continued far beyond this repo's folder pipeline — the latest upload is
> **Ep.104 (Argentina vs Switzerland, quarter-final)**, published 2026-07-09.
> Episodes Ep.37–104 were produced outside `marketing/match-videos/` (no folders
> exist for them). The complete live catalogue — every episode, link, stage, and
> story prediction — is tracked in `src/lib/youtube-legend-episodes.ts` (the
> Legend-cards source, reconciled against the channel on 2026-07-11). This
> fixture table remains the record of the folder-pipeline era (Ep2–36) only.

| Ep | Kickoff (TV) | Match | Status | Notes / link |
|----|--------------|-------|--------|--------------|
| 15 | Mon 15/06 | Ivory Coast vs Ecuador | ✅ live | youtu.be/3GRncnYwQVw (real: CIV 1–0) |
| 16 | Mon 15/06 | Sweden vs Tunisia | 🎬 rendered | predicted 2–1 Sweden (Gyökeres/Isak) — aligned to the real Sweden win |
| 17 | Mon 15/06 19:00 | Spain vs Cape Verde | ✅ live | youtu.be/_vHQqJxt6G4 |
| 18 | Mon 15/06 22:00 | Belgium vs Egypt | 🎬 rendered | master WorldCup26_Match18_BEL_EGY.mp4 (77 MB, see PRODUCTION_LOG) |
| 19 | Tue 16/06 01:00 | Saudi Arabia vs Uruguay | 🎬 rendered | master WorldCup26_Match19_KSA_URU.mp4 (31 MB, see PRODUCTION_LOG) |
| 20 | Tue 16/06 04:00 | Iran vs New Zealand | 🎬 rendered | predicted 1–1 · NZ only unbeaten team at 2010 WC (3 draws, Italy out) / Iran beat USA '98 · Legend 020 the Unbeaten |
| 21 | Tue 16/06 22:00 | France vs Senegal | 🎬 rendered | predicted FRA 2–1 · 2002 Seoul shock / Bouba Diop tribute · Legend 021 the Dancing Lion |
| 22 | Wed 17/06 01:00 | Iraq vs Norway | 🎬 rendered | predicted IRQ 1–1 NOR · Iraq 2007 Asian Cup (war-torn champions; Mahmoud header beat KSA 1-0; Sunni/Shia/Kurd as one; bombs hit celebrations) / Norway back since 1998 (Haaland, Odegaard) · Legend 022 the Standard-Bearer |
| —  | Wed 17/06 04:00 | Argentina vs Algeria | ✅ live | already covered (Ep6) — skip |
| 23 | Wed 17/06 07:00 | Austria vs Jordan | 🎬 rendered | predicted AUT 2–1 JOR · Jordan FIRST-EVER World Cup (40 yrs, 9 failed campaigns) + 2023 Asian Cup stunner (beat South Korea 2-0 in semi, Al-Naimat & Al-Tamari, first-ever final, lost to Qatar) / Austria's 1930s Wunderteam & Sindelar "Mozart of football" — never won a World Cup · Legend 023 the Keeper of the Dream |
| 24 | Wed 17/06 20:00 | Portugal vs DR Congo | 🎬 rendered | master WorldCup26_Match24_POR_COD.mp4 (75 MB, see PRODUCTION_LOG) |
| 25 | Wed 17/06 23:00 | England vs Croatia | 🎬 rendered | predicted ENG 2–1 · 2018 Moscow semi (Croatia 2-1 AET, Mandžukić 109') / Modrić 2018 Golden Ball · Legend 025 the Ghost of 2018 |
| 26 | Thu 18/06 | Ghana vs Panama | 🎬 rendered | image-based build (pre-#11 method); do NOT rebuild — move forward clip-based |
| 27 | Thu 18/06 | Uzbekistan vs Colombia | 🎬 rendered | image-based build |
| 28 | Thu 18/06 | Czech Republic vs South Africa | 🎬 rendered | image-based build |
| 29 | Thu 18/06 | Switzerland vs Bosnia | 🎬 rendered | image-based build |
| 30 | Fri 19/06 | Canada vs Qatar | 🎬 rendered | image-based build |
| 31 | Fri 19/06 | Mexico vs South Korea | 🎬 rendered | image-based build · predicted MEX 2–1 |
| 32 | Fri 19/06 22:00 | USA vs Australia | 🎬 rendered | image-based build · predicted USA 2–1 · Legend 032 Ghost of Belo Horizonte |
| 33 | Sat 20/06 01:00 | **Scotland vs Morocco** | 🛠️ building | **CLIP-BASED (Ep6 standard, Higgsfield Kling)** · predicted 0–0 (two saves) · hook: Scotland 1974 unbeaten-yet-eliminated (first ever) / Morocco 2022 first African semifinal · Legend 033 the Ghost of Goal Difference |
| —  | Sat 20/06 03:30 | Brazil vs Haiti | ⏭️ skipped | never produced as its own episode (the pairing is covered by Ep7); numbering continued with Turkey vs Paraguay as Ep34 — do NOT reuse 34 for this fixture |
| 34 | Sat 20/06 06:00 | Turkey vs Paraguay | 🛠️ scaffolded | folder `match34-turkey-vs-paraguay`; narration says "episode thirty-four" · Legend 034 |
| 35 | Sat 20/06 20:00 | Netherlands vs Sweden | 🛠️ scaffolded | big-audience (Netherlands) · folder `match35-netherlands-vs-sweden` · Legend 035 |
| 36 | Sat 20/06 23:00 | Germany vs Ivory Coast | 🛠️ scaffolded | big-audience (Germany) · folder `match36-germany-vs-ivory-coast` · Legend 036 |

## Held / out-of-order (do NOT publish before its TV slot)
- **France vs Iraq** — France's Matchday 2. Scaffold + narration exist in
  `marketing/match-videos/_hold-france-vs-iraq/`. Its real kickoff (Jun 17) has now
  PASSED → if produced, it is **RESCUE mode**, and it must be **renumbered first**:
  the scaffold's narration still says "episode nineteen"/Legend 019, but **Ep19 is
  taken by Saudi Arabia vs Uruguay** — assign the next free number at production time.

## Research hook log (fill as built — keep the "Did you know?" secret per episode)
- Ep19 Saudi Arabia vs Uruguay — _research the verified hook_
- Ep20 Iran vs New Zealand — New Zealand were the ONLY unbeaten team at the 2010 World Cup (three draws: Slovakia 1-1, defending champions Italy 1-1, Paraguay 0-0); went home unbeaten while champions Italy were eliminated bottom of the group. Secondary: Iran beat USA 2-1 at France '98 (first ever WC win) but have never escaped the group. Legend 020 = the Unbeaten.
- Ep21 France vs Senegal — Senegal 1-0 France, 2002 opener (Bouba Diop) — greatest WC upset
- Ep22 Iraq vs Norway — Iraq won the 2007 AFC Asian Cup as a war-torn nation: on 29 Jul 2007 in Jakarta they beat Saudi Arabia 1-0 in the final, captain Younis Mahmoud heading the winner (~72'), a squad uniting Sunni, Shia and Kurd under coach Jorvan Vieira; bombings struck crowds celebrating in Baghdad (reports ~50 killed) yet the people danced — the greatest day in Iraqi football. Secondary: Zidane Iqbal (ex-Man Utd) named after Zinedine Zidane. Norway: back at a World Cup for the first time since 1998 (28-year absence), Haaland (all-time top scorer, 16 goals in qualifying) & Odegaard, beat Italy home and away. Legend 022 = the Standard-Bearer. Sources: The National, Al Jazeera, AFC, Wikipedia, Olympics.com.
- Ep23 Austria vs Jordan — VERIFIED: Jordan (Al-Nashama, "The Brave Ones") at their FIRST-EVER World Cup in 2026, 40 years after their first qualifying campaign and nine failed attempts (qualification sealed with a 3-0 win over Oman, Ali Olwan hat-trick). At the 2023 AFC Asian Cup they stunned South Korea — ~60 places above them — 2-0 in the semifinal (6 Feb 2024, Al-Naimat 53', Al-Tamari 66') to reach their first-ever continental final, then lost it to Qatar 3-1 (10 Feb 2024, Afif hat-trick of pens; Al-Naimat scored). Stars Musa Al-Tamari & Yazan Al-Naimat. Austria: the 1930s "Wunderteam" under Hugo Meisl, led by Matthias Sindelar ("the Mozart of Football"); 6-0 over Germany, 8-1 over Switzerland; reached the 1934 World Cup semifinal but Austria have NEVER won a World Cup; today led by David Alaba. Legend 023 = the Keeper of the Dream. Sources: FIFA, The-AFC, ESPN, Al Jazeera, Wikipedia.
- Ep24 Portugal vs DR Congo — _research the verified hook_
- Ep25 England vs Croatia — VERIFIED: 11 Jul 2018, Luzhniki Stadium, Moscow, World Cup SEMI-FINAL. Trippier 5' free-kick (ENG 1-0, "It's Coming Home"), Perišić 68' equaliser, Mandžukić 109' winner in extra time → Croatia 2-1 England (AET), reaching their first ever final (lost 4-2 to France). Croatia ~4M people: 3rd 1998, runners-up 2018, 3rd 2022 — most decorated small nation. Luka Modrić won the 2018 Golden Ball (first Croatian). England's only WC win = 1966. Legend 025 = the Ghost of 2018 (the checkerboard from Moscow). Sources: Sky Sports, ESPN, BBC, FIFA, SI.
