# Deploy `deepwaterart` from your Mac Studio

Five commands. Takes about three minutes.

```bash
# 1. Unpack wherever you keep projects
tar -xzf deepwaterart.tar.gz
cd deepwaterart

# 2. Install
npm install

# 3. Log in to Vercel (opens your browser once)
npx vercel login

# 4. Check it builds and looks right locally
npm run build && npm run preview     # http://localhost:4173

# 5. Ship it to production
npx vercel --prod
```

On the first `vercel --prod` you'll be asked a few questions. Answer:

| Prompt | Answer |
| --- | --- |
| Set up and deploy? | **Y** |
| Which scope? | **iRISE's projects** (or your personal account) |
| Link to existing project? | **N** |
| What's your project's name? | **deepwaterart** |
| In which directory is your code located? | **./** |
| Want to modify the build settings? | **N** — Vite is auto-detected |

That gives you **https://deepwaterart.vercel.app**.

---

## If the name is taken

`deepwaterart.vercel.app` is a shared global namespace. If Vercel says the name
is unavailable, deploy under any project name and then add the domain you want:

```bash
npx vercel domains add deepwaterart.vercel.app
```

or set it in the dashboard under **Project → Settings → Domains**.

---

## Why you're doing this instead of me

The Vercel account connected to my session can read your projects but returns
`403 forbidden — "You don't have permission to create a project"` on both your
personal scope and the **iRISE's projects** team. Creating the project needs a
Member/Owner role. Once `deepwaterart` exists, redeploys from anywhere are fine.

---

## The music

`public/score.mp3` is an original 27-second score, **synthesised from scratch** —
a low detuned drone, ten struck bell tones on an A-minor pentatonic, and a slow
wash of filtered noise. No samples, no library, nothing to licence or credit: it
was computed sample by sample. The generator is not shipped in this package;
ask if you want it to tweak the piece.

It is mixed under the film and ducks to 42% for the end card, so the price and
your number land in near-silence. To change the level or the ducking, edit the
`volume` envelope on `<Audio>` in `src/film/Film.tsx`. To replace the track
entirely, drop in any cleared MP3 as `public/score.mp3`.

---

## Editing the piece

Everything the page says about the painting comes from one object at the top of
`src/App.tsx`:

```ts
const PIECE = {
  title: "Deep Water",
  artist: "Your Name",          // <- your name
  year: "2026",
  medium: "Acrylic on stretched canvas",
  size: "100 × 80 cm · 39⅜ × 31½ in",
  price: 1100,
  whatsapp: "40749180355",      // digits only
  whatsappDisplay: "+40 749 180 355",
  email: "you@example.com",     // <- your email
};
```

Change those, `npx vercel --prod` again, done.

**To swap the photograph** (recommended — reshoot it square-on in daylight):
replace `public/artwork.webp`. Keep the same filename and the portrait
proportion. The four close-reading hotspots are positioned as percentages in
`PASSAGES` in `src/App.tsx` and in the `Detail` sequences in
`src/film/Film.tsx`; nudge the `x` / `y` values if your crop differs.

---

## What's in here

```
src/gl/Water.tsx      WebGL sea - caustics + light shafts, driven by scroll depth
src/gl/Ripple.tsx     WebGL refraction over the painting, follows the pointer
src/film/Film.tsx     The 26-second Remotion composition
src/App.tsx           The page - hero, film, close reading, study, acquisition
src/index.css         The design system: palette sampled from the canvas
src/components/ui/    shadcn/ui - button, badge, dialog, tabs, tooltip, accordion
public/artwork.webp   The painting, 1400px
public/score.mp3      The score - 27s, original, synthesised (see below)
```

Fonts (Bodoni Moda, Newsreader, Archivo) load from the Google Fonts CDN — see
the `<link>` tags in `index.html`. If you'd rather self-host them, download the
woff2 files into `public/fonts/` and swap the link for a local `@font-face`
block; nothing else changes.
