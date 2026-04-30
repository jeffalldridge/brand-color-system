# Brand Color System

> **A free OKLCH-based color tool. Drop in your brand hexes, get
> perceptually uniform shade families ready for production.**
>
> By [Tent Studios](https://tentstudios.com).

<p align="center">
  <a href="https://jeffalldridge.github.io/brand-color-system/">
    <strong>→ Open the live tool</strong>
  </a>
</p>

[![CI](https://github.com/jeffalldridge/brand-color-system/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffalldridge/brand-color-system/actions/workflows/ci.yml)
[![Pages deploy](https://github.com/jeffalldridge/brand-color-system/actions/workflows/pages.yml/badge.svg)](https://github.com/jeffalldridge/brand-color-system/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## Why this exists

Brand colors need to work *everywhere* — UI components, marketing pages,
product surfaces, dark mode, light mode, on every background. Each color
needs a full family of shades (dark through light) so designers and
engineers can pick the right tone for any context.

The hard part: **generating shade families that feel perceptually
consistent across different hues.** In traditional spaces like HSL, a
"50% lightness" red and a "50% lightness" blue don't *look* equally bright
to the human eye. So a shade grid built in HSL has uneven visual weight
across colors at the same step.

**OKLCH fixes this.** Its Lightness axis is perceptually uniform: L=0.50
for red and L=0.50 for blue genuinely appear the same brightness. This
tool uses OKLCH to generate shade ramps where every color at the same
shade step shares identical perceived brightness — a grid you can trust
by eye.

---

## What it does

A single-page web app. Open it, see all your brand colors stretched
across a shade grid, tune the palette in real time. Changes are instant
— drag a slider, every swatch updates. State persists to localStorage.

### Highlights

- Editable per-color **Hue / Chroma / Lightness** sliders with absolute
  OKLCH readouts
- **Drag-and-drop** brand cards (horizontal) and shade rows (vertical)
- **Hue Map** color-wheel visualization
- **sRGB ↔ Display P3** gamut switching with auto-detection
- **Background slider** for testing palettes against any gray
- **Text overlay** (white / black / both) for WCAG contrast checks
- **WCAG contrast ratios** computed against white and black per swatch
- **Sort by Hue**, **Nearest Input** ring, label toggle, four gap presets

### Imports

Paste any of these into the **Import** panel and the app auto-detects:

- Plain hex list (`#2563eb`, `#7c3aed`, …)
- Tailwind v4 `@theme { --color-blue-500: #2563eb }`
- CSS Custom Properties (`:root { --blue-500: #2563eb }`)
- W3C Design Tokens (DTCG) JSON (`{ "color": { "blue": { "500": ... } } }`)

Examples in [`docs/import-examples/`](docs/import-examples/).

### Exports

- **CSS Custom Properties** (`:root { --name-step: #hex }`)
- **Tailwind v4 `@theme`** (`@theme { --color-name-step: oklch(...) }`)
- **W3C Design Tokens (DTCG)** JSON — Tokens Studio, Style Dictionary,
  Figma compatible
- **Adobe Swatch Exchange** (`.ase`) — Illustrator, Photoshop, InDesign
- **Adobe Color Swatch** (`.aco`) — Photoshop (v1 + v2)

---

## How the algorithm works

1. Each brand hex → **OKLCH** (Lightness, Chroma, Hue) via
   [`culori`](https://github.com/Evercoder/culori)
2. Optional per-color adjustments: hue rotation, chroma scaling,
   lightness offset
3. A **global lightness ramp** defines the L value for each shade step.
   Step number derives directly from L:
   `step = round(1000 * (1 - L))` — so step 500 = L 0.50, step 750 =
   L 0.25, step 30 = L 0.97
4. For each shade: L from the ramp, C and H from the (possibly adjusted)
   brand color
5. Out-of-gamut colors are reduced via the **CSS Color Level 4 gamut
   mapping algorithm** (`culori.toGamut`) — minimum-chroma reduction
   instead of naive clamping
6. WCAG contrast ratios computed against white and black for every shade

The result: a grid where every column shares identical perceived
brightness across rows.

---

## Develop

```sh
git clone https://github.com/jeffalldridge/brand-color-system
cd brand-color-system
npm install
npm run dev          # http://localhost:3000
npm run build        # produces ./out/ (static export)
npm run lint
```

The app is fully static — `output: 'export'` in
[`next.config.mjs`](next.config.mjs). No server, no API routes, no env
vars required to build. It deploys via GitHub Actions to GitHub Pages on
every push to `main` (see [`.github/workflows/pages.yml`](.github/workflows/pages.yml)).

### Configuration

The site URL and base path are centralized in
[`src/lib/site.ts`](src/lib/site.ts), with optional env-var overrides
in [`.env.example`](.env.example). Forks deploying under a different URL
just set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_PATH` in their
build environment.

### Project shape

```
src/
  lib/                  # Pure logic — no React, fully testable
    color-conversions   # culori wrappers (hex ↔ OKLCH, gamut mapping)
    color-engine        # Adjustments → shades → families
    lightness-ramp      # Ramp generation, step sorting
    contrast            # WCAG luminance + contrast ratio
    brand-colors        # Default 7-color palette + Tailwind 50–950 steps
    export-ase / -aco / -tokens
    import-parser       # Auto-detects CSS / Tailwind / hex / DTCG
    site                # Single source of truth for URL config
  hooks/
    usePaletteState     # Central useReducer + useMemo (16 actions)
  components/
    Header / BrandColorEditor / BrandColorCard / ShadeGrid /
    ColorSwatch / ColorWheel / BackgroundSlider / TextOverlayToggle /
    ImportPanel / OutputSection
  app/
    page / layout / globals.css / robots / sitemap / manifest
```

---

## Contributing

PRs welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the setup,
PR checklist, and what kinds of changes fit the project.

For security issues, see [`SECURITY.md`](SECURITY.md). Don't open public
issues for those.

---

## Credits

- Algorithm built on the [CSS Color Level 4](https://www.w3.org/TR/css-color-4/)
  specification and Björn Ottosson's [OKLab](https://bottosson.github.io/posts/oklab/)
  work.
- Color math by [culori](https://github.com/Evercoder/culori).
- Drag-and-drop by [@dnd-kit](https://github.com/clauderic/dnd-kit).
- Built with [Next.js](https://nextjs.org), [React](https://react.dev),
  [Tailwind CSS v4](https://tailwindcss.com), [TypeScript](https://www.typescriptlang.org).

Full attribution and license texts in
[`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md).

---

## License

MIT. © 2026 [Jeff Alldridge / Tent Studios, LLC](https://tentstudios.com).
