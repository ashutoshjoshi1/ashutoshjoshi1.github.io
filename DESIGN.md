# Design system: Exposure

The site's one material is the **pixel**: a detector pixel counting photons on a NASA Pandora
spectrometer, and a KV-cache block holding tokens on a GPU. Pictures arrive the way a detector
reads them, as coarse square cells that resolve. Everything else stays flat and quiet so that
material carries the page.

Built from three skill sets: Emil Kowalski's animation rules (curves, durations, press feedback,
interruptible transitions), impeccable (one committed world, browser surfaces themed, no
eyebrows or decorative monospace), and taste-skill (direction `pinned-poster`, seed 1119461737,
measured with its `inspect.mjs`).

## Colour

One ground, one ink, one accent, one pale field. Tokens live in `app/globals.css`.

| Role | Value | Use |
| --- | --- | --- |
| `--bg` | `#1c1c1c` | the ground, the nav once scrolled, the contact card |
| `--surface` / `--surface-2` | `#262626` / `#303030` | free memory blocks, inputs, quiet buttons |
| `--ink` | `#f1f1ef` | all running text |
| `--muted` | `#a3a49f` | secondary text and inactive story steps (never opacity) |
| `--accent` | `#8fa68e` | the primary action, and the shared-prefix KV blocks. Nothing else |
| `--field` | `#c8c5ba` | the Lab section, the page's one change of ground |

The Lab redefines the roles locally (`app/components/lab/lab.css`), so buttons, segments and the
canvases inside it take the field's ink and a deeper green accent (`#46604a`).

## Type

Cabinet Grotesk (ITF Free Font License, self-hosted in `public/fonts/`), one family, three weights.
Five sizes, far apart:

| Token | Range | Use |
| --- | --- | --- |
| `--step-small` | 13–14px | captions, labels, metadata |
| `--step-body` | 17–19px | running text |
| `--step-lead` | 20–26px | sub-headings, statements, skill lists |
| `--step-head` | 40–88px | the name and every section heading, 800, -0.035em |
| `--step-display` | 96–280px | the three production figures only |

Headings are two lines at most, with authored breaks (`components/motion/Lines.tsx`).
Numbers use tabular figures everywhere.

## Frame

Equal outer margins (`--margin`, 16–32px), one 12-column grid, square corners on everything.
Sections sit about 120–230px apart on desktop. No rules, outlined boxes, gradients (except the
static hero's photo scrim), shadows at rest, glass, eyebrows, index numbers or icon cards.

## Motion

Curves (`app/globals.css`): `--ease-out` `cubic-bezier(.23,1,.32,1)` for interface,
`--ease-expo` `(.16,1,.3,1)` for reveals, `--ease-in-out` `(.77,0,.175,1)` for wipes.
Press 140ms (`scale(.97)`), hover 180ms, interface 240ms, reveals 800ms, openings 1200ms.
Hover effects sit behind `(hover: hover) and (pointer: fine)`.

| Moment | What moves | Where |
| --- | --- | --- |
| Signature | the hero window opens to full-bleed as the photo resolves from detector cells | `components/hero/` |
| First light | on load, the cells integrate from dark noise to the picture in 1s | `Hero.tsx` `expose()` |
| Held stage | the live KV-cache map holds while the story steps pass and set its levers | `components/inference/` |
| Develop | NASA pictures and project drawings arrive as merged cells and resolve | `NasaFrame.tsx`, `PixelArt.tsx` |
| Entrances | line rises for headings, rises for text, rolling figures | `components/motion/` |
| Drift | the contact photograph drifts a few percent as it passes (CSS scroll timeline) | `contact.css` |

Every hidden entrance state lives under `html.js` and `prefers-reduced-motion: no-preference`,
so without script or with reduced motion the page is complete and still. Loops pause offscreen
and when the tab is hidden. Lenis smooths wheel scrolling lightly (lerp 0.12) and is off for
touch and reduced motion.

## Pictures

Only Ashutosh's own photographs: the black-and-white studio portrait (hero) and the UMBC
graduation photo (contact). Everything else is drawn in code from what each thing does, in the
same cells (`components/work/painters.ts`; `components/nasa/drawings.ts`: instrument traces,
an all-sky frame, the fleet grid, a solar spectrum) and captioned as a drawing.
The portrait sits on a near-black ground (#040404), so the hero opens into that ground rather
than cropping the face.

## Checks

- `npm test`: the KV block allocator (`tests/kvcache.test.ts`).
- taste-skill `inspect.mjs` against the dev server. It walks only the first 11 screens, so it
  reports reveals further down as blank gaps; walking the whole page shows none unfired.
