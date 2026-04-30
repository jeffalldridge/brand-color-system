# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-04-30

Initial public release.

### Added

- Single-page web app for generating perceptually-uniform shade families
  from any number of brand colors using OKLCH (Oklab Lightness, Chroma,
  Hue), with `culori` for color-space conversions and CSS Color Level 4
  gamut mapping.
- Editable per-color **Hue / Chroma / Lightness** adjustment sliders with
  absolute OKLCH readouts and origin markers; grayscale-aware chroma
  fallback so achromatic inputs can gain saturation.
- **Drag-and-drop reordering** of brand color cards (horizontal) and
  shade-grid rows (vertical) via `@dnd-kit`; touch-friendly sensors for
  iPad.
- **Hue Map** color-wheel visualization positioning all brand colors by
  hue and chroma.
- Standard Tailwind shade steps (50–950) mapped to OKLCH lightness; step
  numbers derive directly from L via `step = round(1000 * (1 - L))`.
- **Sort by Hue**, **Nearest Input** highlight, **Labels** toggle, four
  gap presets (Flush / Tight / Normal / Wide), and **sRGB ↔ Display P3**
  gamut switching with auto-detection of P3-capable displays.
- **Background slider** to test the palette against any gray background;
  adaptive UI flips controls and borders between light/dark to stay
  legible.
- **Text overlay** options (white / black / both) to visualize WCAG
  contrast breakpoints across every shade.
- **Import** from CSS custom properties, Tailwind `@theme`, plain hex
  lists, and W3C Design Tokens (DTCG) JSON. Examples in
  `docs/import-examples/`.
- **Export** to CSS custom properties, Tailwind v4 `@theme`, W3C Design
  Tokens (DTCG) JSON, Adobe Swatch Exchange (`.ase`), and Adobe Color
  Swatch (`.aco`).
- WCAG contrast ratios computed against white and black for every
  generated shade.
- Local-storage persistence — your palette survives reloads.
- Static build (`output: 'export'`) deployed to GitHub Pages with no
  server, no API routes, and no environment variables required.

### Notes

- Apple Silicon and Intel Macs supported (the app is browser-based).
- Modern browsers with `oklch()` and CSS Color Level 4 support; Safari
  16.4+, Chrome 111+, Firefox 113+.
