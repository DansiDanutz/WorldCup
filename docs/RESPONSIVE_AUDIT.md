# Mobile Responsiveness Audit — WorldCup 2026

**Date:** 2026-06-02
**Scope:** Every page and component, all styling (`src/app/globals.css`, 1,910 lines)
**Method:** Full static review of the CSS responsive system + component markup, plus
`npm run build`. No headless browser is available in this environment, so live device
screenshots were not captured — a real-device QA pass is still recommended (see §5).

## 1. Verdict

**The app is already well-built for mobile.** It ships a deliberate three-tier responsive
system (1180 / 760 / 420px), collapses every multi-column grid on small screens, converts wide
tables to stacked cards, uses 44–46px touch targets, wraps long strings, and honors
`prefers-reduced-motion`. The README's "responsive mobile/tablet/desktop" claim holds up.

This audit applied **three small hardening fixes** (§3) and found **no broken layouts** at any
supported width down to the 320px floor.

## 2. What's already done well

| Concern | How it's handled | Where |
|---|---|---|
| Viewport floor | `html { min-width: 320px }` + `body { overflow-x: hidden }` safety net | `globals.css:20,28` |
| Box model | `* { box-sizing: border-box }` | `globals.css:16` |
| Breakpoints | 1180px (3→2 col), 760px (→1 col + stacked topbar), 420px (small-phone tightening) | `globals.css:1471/1490/1734` |
| Main 3-column dashboard (`.grid`, needs ~1110px) | → 2 col @1180, → 1 col @760 | `globals.css:1472/1543` |
| Wide data table (`.coefficient-table`, ~580px) | Header hidden, rows become 2-col **cards** @760 | `globals.css:1705/1709` |
| Group/rule/stage grids | Collapse to 1fr @760 | `globals.css:1543` |
| Prize / payout grids | `repeat(auto-fit, minmax(92–118px, 1fr))` — reflow automatically | `globals.css:749,1791` |
| Knockout bracket (6 columns) | `overflow-x: auto` + `overscroll-behavior-x: contain` + sticky column header → horizontal scroll | `globals.css:1218` |
| Top navigation | Topbar stacks; nav becomes full-width bar, `flex: 1 1 0`, **min-height 44px**, 5 items | `globals.css:1490–1533` |
| Touch targets | Inputs/buttons/search **min-height 46px** @760 | `globals.css:1633` |
| Long strings (names, codes, paths) | `overflow-wrap: anywhere` in 10 places; flex children use `min-width: 0` | e.g. `globals.css:865,1068,1767` |
| Invite/referral URL | Copied to clipboard / shared via `wa.me` — never rendered as overflow-prone text | `dashboard.tsx:391` |
| Secondary columns | Odds hidden on mobile to reduce crowding (`.odds`, `.odds-value { display:none }`) | `globals.css:1647,1729` |
| Motion / a11y | Full `prefers-reduced-motion` handling; `:focus-visible` rings on all controls | `globals.css:1898` |

## 3. Fixes applied in this change

1. **Explicit viewport** (`src/app/layout.tsx`). The `viewport` export previously set only
   `themeColor`, relying on Next.js's implicit default. Now declares
   `width: "device-width", initialScale: 1` explicitly — the single most important mobile
   meta — while **intentionally leaving pinch-zoom enabled** (no `maximumScale` /
   `userScalable: false`) for accessibility.
2. **iOS text-inflation guard** (`globals.css`). Added `-webkit-text-size-adjust: 100%`
   (+ standard `text-size-adjust`) so Safari doesn't enlarge body text after a rotation.
3. **Sticky-header anchor offset** (`globals.css`). The sticky topbar is the primary mobile
   nav and its in-page links (`#pick`, `#invite`, `#leaderboard`, `#rules`, `#matches`) use
   smooth scroll, so target headings were landing *under* the header. Added
   `scroll-padding-top: 88px` (desktop) / `168px` (≤760px, where the topbar stacks taller).

All four checks still pass after the change: **typecheck ✓, lint ✓, 82 tests ✓, build ✓.**

## 4. Breakpoint coverage matrix (spot-checked)

| Width | Representative device | Layout |
|---|---|---|
| ≥1181px | Desktop / large tablet landscape | 3-column dashboard, full table headers |
| 761–1180px | Tablet / small laptop | 2-column grids, inline topbar |
| 421–760px | Large phones, phones landscape | Single column, stacked topbar + bottom-style nav, table cards |
| 320–420px | iPhone SE, small Androids | Tighter padding/typography, 2-col stat row, name wrapping |
| <320px | Galaxy Fold (cover, 280px) | Below the `min-width: 320px` floor → minor horizontal clipping (edge case, see §5) |

## 5. Residual recommendations (non-blocking)

- **Real-device QA.** Static analysis can't catch every rendering quirk; do a pass on real
  iOS Safari + Android Chrome (already tracked in `docs/IMPLEMENTATION_PLAN.md`). Best tested on
  the dashboard with live data (the data-bearing pages need a populated Supabase to render).
- **Sub-320px devices.** The 320px floor covers essentially all phones; the folded Galaxy Fold
  (280px) is the only common exception. Lowering the floor is possible but risks cramping the
  stat/nav rows — leave unless that device is a target.
- **Notch / safe areas.** If the app is ever installed as a PWA / runs fullscreen, add
  `env(safe-area-inset-*)` padding to the sticky topbar. Not needed for normal browser tabs.
- **Bracket UX.** The knockout board scrolls horizontally on mobile (a valid pattern); consider
  a subtle scroll affordance/shadow so users discover the off-screen rounds.
