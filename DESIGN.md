# Design system: Split stage

The page opens on **the sky over NASA Goddard as it is right now**, rendered from the physics of
sunlight scattering in the air: the light a Pandora spectrometer measures. Below it, a column of
paper carries the reading while the other half of the screen holds still and changes what it shows
as the chapters pass: a simulated LLM server running the way the production one does, the same
server taken apart step by step, then the sun's path over Goddard today.

Built from three skill sets: Emil Kowalski's animation rules (curves, durations, press feedback,
interruptible transitions), impeccable (one committed world, browser surfaces themed, no eyebrows
or decorative monospace), and taste-skill (direction `split-stage`, seed 384904642, measured with
its `inspect.mjs`). The previous "Exposure" pixel design was retired for using too much pixel motion.

## Colour

Two grounds, one ink for each, one accent. Tokens live in `app/globals.css`; sections switch
grounds with `data-theme` (`night`, `sky`), which redefines the roles (`--ground`, `--text`,
`--text-2`, `--surface`, `--focus`).

| Role | Value | Use |
| --- | --- | --- |
| `--paper` / `--paper-2` / `--paper-3` | `#eae8e3` / `#e0ddd6` / `#d3d0c8` | the reading ground, surfaces, controls |
| `--ink` / `--ink-2` | `#121212` / `#57544e` | text on paper; secondary text (6:1) |
| `--night` / `--night-2` / `--night-3` | `#060606` / `#141414` / `#222221` | the stage, Experience, Contact, footer |
| `--night-ink` / `--night-ink-2` | `#ecebe6` / `#a19e96` | text on night |
| `--gold` | `#f2b330` | the sun and the UMBC stole: the action, the cached-prompt marks, the sun, the highlighter. Nothing else |

## Type

Two families from the Indian Type Foundry (ITF Free Font License, self-hosted in `public/fonts/`):
**Clash Grotesk** 400/500 for the name, headings and interface, **Gambetta** 400/400 italic/500
for the reading. Five sizes:

| Token | Range | Use |
| --- | --- | --- |
| `--step-small` | 13–14px | captions, labels, readouts (Clash) |
| `--step-body` | 17–20px | running text (Gambetta) |
| `--step-lead` | 21–28px | sub-headings, statements |
| `--step-head` | 36–72px | section headings and project names, 400, -0.03em |
| `--step-display` | 60–152px | the name and the production figures |

## Frame

Equal outer margins (`--margin`, 16–36px), one 12-column grid, square corners. The held stage is
inset by the page margin so the frame stays even. No rules, outlined boxes, shadows at rest,
glass, eyebrows or index numbers.

## Motion

Curves (`app/globals.css`): `--ease-out` `(.23,1,.32,1)` for interface, `--ease-expo`
`(.16,1,.3,1)` for reveals, `--ease-in-out` `(.77,0,.175,1)` for wipes.

| Moment | What moves | Where |
| --- | --- | --- |
| Signature | on load the sky runs from this morning's sunrise to now (after dark, from dusk) | `components/hero/Hero.tsx` |
| Live thing | drag the sky, or use the slider, to move the sun through the day | `Hero.tsx`, `skyRenderer.ts` |
| Held stage | the stage crossfades (out 500ms, in 1.4s) as chapters pass | `components/split/` |
| Live server | a strip chart of twelve request slots; the story's steps and the visitor's levers drive it | `components/inference/ServerView.tsx` |
| Sun path | the day's path draws dot by dot, the line of sight and the spectrum draw in | `components/nasa/SkyFigure.tsx` |
| Entrances | line rises for headings, rises for text, rolling figures, the résumé sheet prints top-down | `components/motion/`, `experience.css` |
| Drift | the graduation photograph settles as the footer arrives (CSS scroll timeline) | `footer.css` |

Hidden entrance states live under `html.js` and `prefers-reduced-motion: no-preference`, so the
page is complete without script or with reduced motion. The sky and the server draw only when
something changes or they are on screen; loops stop when the tab is hidden. Lenis smooths wheel
scrolling lightly (lerp 0.12) and is off for touch and reduced motion.

## Pictures

Only Ashutosh's own photographs: the black-and-white portrait (a close crop beside the letter) and
the UMBC graduation photo (footer). The sky is rendered (`skyRenderer.ts`, after Rye Terrell's
public-domain glsl-atmosphere); the server chart and the sun-over-Goddard figure are drawn from
live computation, and the spectrum is an illustrative curve labelled as such.

## Checks

- `npm test`: the sun position (`tests/sun.test.ts`), the spectrum (`tests/spectrum.test.ts`) and
  the batching behaviours the chart shows (`tests/batching.test.ts`).
- taste-skill `inspect.mjs` against the dev server. It walks only the first 11 screens and counts
  only loaded images, so on this ~21-screen page it reports unfired reveals below that as blank gaps
  and misses the lazy-loaded photographs; walking the whole page shows none unfired.
