# WorldCup 2026 Design System

This app uses the WorldCup 2026 design handoff from:

`/Users/davidai/Downloads/WorldCup 2026 Design System.zip`

The app should read like calm sports fintech: clear numbers, restrained motion,
green as the primary signal, gold for money, and red only for danger.

## Core Tokens

- Primary green: `#106b4f`
- Green tint: `#e5f3ee`
- Gold money accent: `#c9942e`
- Danger red: `#b84a45`
- Ink: `#0c1d1a`
- Muted text: `#5d6f69`
- Border: `#d8e3df`
- Panels: `1px` border, `8px` radius, `0 16px 45px rgba(17, 43, 36, 0.08)` shadow

## Pick Colors

The three selected teams are always color-coded:

- Pick 1: green `#106b4f`
- Pick 2: blue `#2f5fbd`
- Pick 3: amber `#b66b16`

These colors must stay consistent across team rows, entry slots, leaderboard
chips, and any admin/read-only display of selected teams.

## Type And Copy

- Font: Inter only.
- Titles use Title Case.
- Labels use uppercase with slight tracking.
- Numbers are the hierarchy: coefficients, points, percentages, and money should
  be fixed-decimal, heavy, and easy to scan.
- No emoji, no casino-style hype, no decorative motion.

## Brand Assets

The design handoff includes the exact trophy mark and lockup:

- `public/brand-mark.svg`
- `public/logo-lockup.svg`
- `src/app/icon.svg`

The login page uses the logo lockup. In-app headers use the trophy mark pattern
through Lucide icons and the `.brand-mark` token styling.

## Production Guard

`tests/design-system.test.ts` protects the non-negotiable tokens and brand
assets so future changes do not accidentally strip the handoff out of the app.
