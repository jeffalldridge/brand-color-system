# Brand Color System

## Why This Exists

We have brand colors that need to work everywhere — UI components, marketing pages, product surfaces, dark mode, light mode, on every background. Each color needs a full family of shades (dark through light) so designers and engineers can pick the right tone for any context.

The problem: **generating shade families that feel perceptually consistent across different hues is hard.** In traditional color spaces like HSL, a "50% lightness" red and a "50% lightness" blue don't *look* equally bright to the human eye. So a shade grid built in HSL will have uneven visual weight across colors at the same step.

**OKLCH fixes this.** Its Lightness axis is perceptually uniform: L=0.50 for red and L=0.50 for blue genuinely appear the same brightness. This tool uses OKLCH to generate shade ramps where every color at the same shade step shares identical perceived brightness, producing a grid you can trust by eye.

## What It Does

Single-page interactive system. The design team opens it, sees all brand colors stretched across a shade grid, and can collaboratively tune the palette in real time. Changes are instant — drag a slider, see every swatch update. State persists to localStorage.

### The Algorithm

1. Each brand hex is converted to **OKLCH** (Lightness, Chroma, Hue) using `culori`
2. Optional per-color adjustments are applied: hue rotation, chroma scaling, lightness offset
3. A **global lightness ramp** defines the L value for each shade step — step numbers derive directly from L via `step = round(1000 * (1 - L))`, so step 500 = L 0.50, step 750 = L 0.25, step 30 = L 0.97
4. For each shade: L comes from the ramp, C and H come from the (possibly adjusted) brand color
5. Colors outside the target gamut are mapped back using the **CSS Color Level 4 gamut mapping algorithm** (`culori.toGamut`) — this reduces chroma minimally to fit rather than naive clamping
6. WCAG contrast ratios are computed against white (#fff) and black (#000) for every generated shade

The result: a grid where each row is a brand color's full shade family, and each column represents one lightness level. Every swatch in the same column has identical perceived brightness.

### Default Brand Colors

| Name | Hex |
|------|-----|
| Blue | `#2563eb` |
| Purple | `#7c3aed` |
| Teal | `#0d9488` |
| Green | `#16a34a` |
| Orange | `#ea580c` |
| Rose | `#e11d48` |
| Tones | `#737373` |

All names and hex values are editable. Colors can be added, removed, or reordered via drag-and-drop.

## Features

### Brand Color Editor
- **Split color preview** — shows source hex and adjusted hex side-by-side when adjustments are active
- Editable **Name** and **Hex** inputs per color (select-all on focus, Enter/Escape to blur)
- Per-color **Hue**, **Chroma**, and **Lightness** adjustment sliders with absolute OKLCH values and origin markers
- **Add / Remove** brand colors dynamically (minimum 1 required)
- **Drag-and-drop reordering** of brand color cards (@dnd-kit horizontal)
- Grayscale-aware chroma: achromatic inputs use additive chroma fallback so they can gain saturation
- **Hue Map** — optional color wheel visualization showing all brand colors positioned by hue and chroma

### Shade Grid
- Horizontal rows per brand color — dark (left) to light (right)
- Standard Tailwind shade steps (50–950) mapped to OKLCH lightness values
- **"INPUT" / "NEAREST" indicator** — "INPUT" marks exact hex matches, "NEAREST" marks closest-step approximations
- **Gamut mapping dot** — marks shades that required gamut mapping
- **Drag-to-reorder rows** — grab the name column to reorder shade family rows; auto-disables Sort by Hue to preserve manual order
- **Colored border accent** on hover to indicate drag handle

### Display Controls (Header)

**Row 1:** Brand-colored icon + title | Background slider + Reset

**Row 2:** Text Overlay (White/Black/Both) | Sort by Hue · Nearest Input · Labels | Flush · Tight · Normal · Wide | sRGB/P3 (right-justified)

- **Sort by Hue** — toggle between hue-sorted rows and source color order
- **Nearest Input** — show or hide the outline ring on closest-to-input swatches
- **Labels** — show or hide all text in shade cells (step numbers, contrast ratios, hex values)
- **Gap size** — Flush (0px), Tight (4px), Normal (8px), Wide (16px) gaps between swatches
- **sRGB / P3 gamut toggle** — switch gamut target; auto-detects P3-capable displays on first visit
- **Background slider** — test the palette on any gray from black to white
- **Text overlay toggle** — show white text, black text, or both on swatches to visualize contrast breakpoints
- **Contrast ratios** — WCAG contrast ratios (vs white and vs black) displayed on every swatch
- **Adaptive UI** — all labels, controls, and borders switch between light/dark appearance based on background

### Output & Export
- Expandable per-color accordion rows with **Step, Hex, RGB, HSL, OKLCH, Gamut** columns
- Click any value to copy it to clipboard (with "ok" feedback)
- **CSS Custom Properties** — exports as `:root { --name-step: #hex; }` variables
- **Tailwind @theme** — exports in Tailwind v4's `@theme { --color-name-step: oklch(...); }` format
- **W3C Design Tokens (DTCG)** — JSON with hex values and OKLCH extensions, compatible with Tokens Studio, Style Dictionary, and Figma
- **Adobe Swatch Exchange (.ase)** — binary format for Illustrator, Photoshop, and InDesign
- **Adobe Color Swatch (.aco)** — binary format (v1+v2) for Photoshop
- All exports respect the current sort order
- **"How it works"** — collapsible explainer section

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Push to GitHub, connect the repo in Vercel. No environment variables, no server config — it's a fully client-side static page.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Vercel-native, static export, fast builds |
| Styling | Tailwind CSS v4 | Utility classes for UI chrome; CSS-first config via `@theme` |
| Color math | culori v4 | Best OKLCH support, CSS Color Level 4 gamut mapping algorithm |
| DND | @dnd-kit | Drag-and-drop reordering of brand color cards + shade grid rows |
| Language | TypeScript (strict) | Type safety for color math and state management |
| State | React useReducer + useMemo | Single source of truth, memoized expensive computation |

No database. No API routes. No server-side logic. 100% client-side.

## Architecture

```
src/
  lib/                           # Pure logic (no React, no side effects)
    types.ts                     # All shared TypeScript interfaces
    color-conversions.ts         # culori wrappers: hex<->OKLCH, gamut mapping, format outputs
    color-engine.ts              # Core: applies adjustments, generates shades, finds closest step
    lightness-ramp.ts            # Ramp generation, step sorting
    contrast.ts                  # WCAG relative luminance + contrast ratio
    brand-colors.ts              # Default brand color definitions + Tailwind shade steps
    export-ase.ts                # Adobe Swatch Exchange (.ase) binary file generation
    export-aco.ts                # Adobe Color Swatch (.aco) binary file generation
    export-tokens.ts             # W3C Design Tokens (DTCG) JSON generation
  hooks/
    usePaletteState.ts           # Central state (useReducer), localStorage persistence, useMemo
  components/
    Header.tsx                   # Sticky two-row header: title, toggles, background slider, gamut
    BrandColorEditor.tsx         # Brand cards grid container with horizontal dnd
    BrandColorCard.tsx           # Individual color card (inputs, H/C/L sliders, drag-and-drop)
    ShadeGrid.tsx                # Column headers + shade rows with vertical dnd reordering
    ColorSwatch.tsx              # Individual shade cell with contrast info + indicators
    ColorWheel.tsx               # Hue map visualization (SVG)
    BackgroundSlider.tsx         # Background gray slider
    TextOverlayToggle.tsx        # White/black/both text toggle
    OutputSection.tsx            # Values tables, export buttons, "How it works" explainer
  app/
    page.tsx                     # Single-page entry point, wires state to components
    layout.tsx                   # Root layout
    globals.css                  # Tailwind import + custom slider styles + color-scheme
```

### State Management

All state lives in `usePaletteState.ts` as a single `useReducer`. Actions are a typed discriminated union (16 actions):

| Action | What it does |
|--------|-------------|
| `UPDATE_COLOR` | Change a brand color's hex |
| `UPDATE_NAME` | Rename a brand color |
| `UPDATE_ADJUSTMENTS` | Change hue/chroma/lightness shifts |
| `REORDER_COLOR` | Move a brand color via drag-and-drop |
| `ADD_COLOR` | Add a new brand color card |
| `REMOVE_COLOR` | Remove a brand color (min 1) |
| `SET_BACKGROUND` | Change page background gray level |
| `SET_TEXT_OVERLAY` | Toggle white/black/both text on swatches |
| `SET_SHOW_NEAREST_OUTLINE` | Toggle nearest-input outline ring |
| `SET_SHOW_SWATCH_TEXT` | Toggle all swatch text/labels |
| `SET_GAP_SIZE` | Set swatch gap (0/4/8/16 px) |
| `SET_SORT_BY_HUE` | Toggle hue-sorted vs source-order rows |
| `SET_GAMUT_TARGET` | Switch between sRGB and P3 gamut |
| `SET_BRAND_ORDER` | Reorder brand colors by ID array + disable sort by hue |
| `RESET` | Return to defaults |
| `HYDRATE` | Load persisted state from localStorage |
