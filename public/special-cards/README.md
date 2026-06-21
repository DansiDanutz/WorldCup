# Special Cards — WorldCup26 Legends Collection

Every WorldCup26 Legends episode hides one **Mystery Supporter** — a collectible Legend.
This folder holds the collection art; each card has a **landscape (16:9)** and **portrait (9:16)** version.

- `cards.json` — the manifest (number, name, nation, episode, match, image paths)
- `legend-0NN-portrait.png` / `legend-0NN-landscape.png` — the card art
- App gallery: `/collection` (src/app/collection/page.tsx) reads these and renders the collection.

Add a new card per episode: drop the two PNGs here, add an entry to `cards.json` and to the
`CARDS` array in `src/app/collection/page.tsx`. (Legends 001–036 to be backfilled from earlier episodes.)
