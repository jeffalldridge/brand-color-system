# Brand Color System

## Session Protocol

This project uses a Hello/Shutdown protocol for session continuity.

### Hello
On greeting: read memory files (`memory/`), read this file, run `git log --oneline -10` + `git status`, flag discrepancies, then deliver a briefing scaled to staleness (use last MEMORY.md timestamp). Optional `Hello [tag]` scopes to a workstream.

### Shutdown
On "Shutdown": (1) Present summary — decisions to document, memory update preview, git state, cleanup actions. Wait for confirmation. (2) Execute — update CLAUDE.md (if conventions changed), DECISIONS.md, MEMORY.md, BACKLOG.md. Report git state. Stop running processes. Clean only regenerable files (.next, build artifacts). (3) End with 2–3 line handoff note for next session.

### Memory Location
`/Users/jeffalldridge/.claude/projects/-Users-jeffalldridge-Documents-GitHub-brand-color-system/memory/`

---

## Project Overview

OKLCH-based color playground for generating perceptually uniform shade families from any number of brand colors. Single-page Next.js app, fully client-side, deployed on Vercel. The design team uses it to collaboratively tune the palette and export results in multiple formats.

## Tech Stack
- **Next.js 16** (App Router, `'use client'` for all interactive pages)
- **React 19**
- **Tailwind CSS v4** (CSS-first config via `@theme` in `globals.css`, no `tailwind.config.js`)
- **culori** v4 (ESM-only) — OKLCH conversions, gamut mapping via `toGamut('rgb', 'oklch')` and `toGamut('p3', 'oklch')`
- **@dnd-kit** — drag-and-drop reordering of brand color cards (horizontal) + shade grid rows (vertical)
- **TypeScript** — strict mode
- No database, no API routes, no server-side logic

## Commands
- `npm run dev` — dev server on localhost:3000
- `npm run build` — production build (verify before deploy)
- `npm run lint` — ESLint
- `npm start` — serve production build locally

## Deploy
Push to GitHub → Vercel auto-deploys. No env vars needed. Static export.

## _INBOX / _PROCESSED Workflow
- **`_INBOX/`** — Drop reference material, design specs, or notes here for the next session to incorporate.
- **`_PROCESSED/`** — Dump removed/superseded content here during cleanup sweeps. Safe to delete once reviewed. Use dated filenames (e.g. `cleanup-2026-02-27.md`).
- **Any time files need to be removed** from the project, move them to `_PROCESSED/` instead of deleting outright. This preserves an audit trail and lets you review before permanent deletion.
- Both folders use `.gitkeep` so they're tracked even when empty.

## Project Structure
```
src/
  lib/                           # Pure logic (no React)
    types.ts                     # All shared interfaces (BrandColor, OklchColor, Shade, ShadeFamily, etc.)
    color-conversions.ts         # culori wrappers: hex<->OKLCH, gamut mapping, format outputs
    color-engine.ts              # Core: adjustments -> shades -> families, sortFamilies()
    lightness-ramp.ts            # Ramp generation, step sorting
    contrast.ts                  # WCAG luminance + contrast ratio
    brand-colors.ts              # Default brand colors (Blue, Purple, Teal, Green, Orange, Rose, Tones) + Tailwind steps
    export-ase.ts                # Adobe Swatch Exchange (.ase) binary generation
    export-aco.ts                # Adobe Color Swatch (.aco) binary generation
    export-tokens.ts             # W3C Design Tokens (DTCG) JSON generation
  hooks/
    usePaletteState.ts           # Central state: useReducer + useMemo (16 actions)
  components/
    Header.tsx                   # Sticky two-row header: icon + title, BG slider, Reset, toggles, gamut
    BrandColorEditor.tsx         # Brand cards grid with horizontal dnd
    BrandColorCard.tsx           # Individual card (drag-and-drop, inputs, H/C/L sliders)
    ShadeGrid.tsx                # Column headers + shade rows with vertical dnd reordering
    ColorSwatch.tsx              # Individual shade cell (memo'd)
    ColorWheel.tsx               # Hue map SVG visualization
    BackgroundSlider.tsx         # Background gray slider
    TextOverlayToggle.tsx        # Text overlay toggle (white/black/both)
    OutputSection.tsx            # Value tables, export buttons, "How it works"
  app/
    page.tsx                     # Single-page entry, wires state to components
    layout.tsx / globals.css     # Root layout + Tailwind + custom slider CSS + color-scheme
```

## Architecture

### Data Flow
`BrandColor[] + RampConfig + gamutTarget` → `color-engine.ts` → `ShadeFamily[]` → UI components.

All state in `usePaletteState.ts` via `useReducer`. `generateAllFamilies` wrapped in `useMemo`.

### State (16 Actions)

| Action | Payload | Description |
|--------|---------|-------------|
| `UPDATE_COLOR` | index, hex | Change brand hex |
| `UPDATE_NAME` | index, name | Rename a brand color |
| `UPDATE_ADJUSTMENTS` | index, adjustments | Change hue/chroma/lightness shifts |
| `REORDER_COLOR` | fromIndex, toIndex | Drag-and-drop reorder (source cards) |
| `ADD_COLOR` | — | Add new brand color card |
| `REMOVE_COLOR` | index | Remove card (min 1) |
| `SET_BACKGROUND` | value (0–100) | Set page background gray level |
| `SET_TEXT_OVERLAY` | mode | Toggle white/black/both text overlay |
| `SET_SHOW_NEAREST_OUTLINE` | boolean | Toggle nearest-input ring on swatches |
| `SET_SHOW_SWATCH_TEXT` | boolean | Toggle all swatch text/labels |
| `SET_GAP_SIZE` | value (0/4/8/16) | Set gap between swatches |
| `SET_SORT_BY_HUE` | boolean | Toggle hue-sorted vs source-order rows |
| `SET_GAMUT_TARGET` | "srgb" \| "p3" | Switch gamut target |
| `SET_BRAND_ORDER` | ids: string[] | Reorder brandColors by ID array + disable sortByHue |
| `RESET` | — | Return to defaults |
| `HYDRATE` | payload | Load persisted state from localStorage |

### State Defaults
- `sortByHue: true`, `gapSize: 8`, `gamutTarget: 'srgb'` (auto-promotes to `'p3'` on capable displays)
- `showNearestOutline: false`, `showSwatchText: true`
- `textOverlay: 'both'`, `backgroundColor: '#333333'`

## Conventions

### Color Math
- **Always** use `culori.toGamut('rgb', 'oklch')` or `toGamut('p3', 'oklch')` for gamut mapping — never naive clamping
- Achromatic colors (C < 0.005): use additive chroma fallback (`shift * 0.15`) instead of multiplicative
- L: 0–1, C: 0–~0.4, H: 0–360 degrees
- Step numbers derive from L: `step = round(1000 * (1 - L))`
- `adjustedOklch` / `adjustedHex` on ShadeFamily = hue/chroma/lightness shifts applied to base
- Nearest-input matching uses perceptual distance in OKLCH (L, C, hue shortest-arc) against adjusted color

### UI Patterns
- `bgIsLight: boolean` on all components for adaptive text/borders (threshold: gray value > 140)
- Dynamic colors → inline `style={{}}`. Static chrome → Tailwind classes
- Minimalistic system aesthetics: focus on spacing, typography, and clear "Source → Adjusted" patterns
- `focus-visible` rings for keyboard accessibility (global rule in `globals.css`)
- Custom slider styling in `globals.css` via `.custom-range` class with CSS custom properties
- `color-scheme: light dark` on `:root` for browser color management

### Styling Strategy — Inline Tailwind, No Abstraction
- **Do NOT** use `@apply`, custom CSS classes, or `lib/ui-tokens.ts` to deduplicate Tailwind utilities
- Tailwind v4 emits each atomic rule once regardless of how many JSX elements reference it — no CSS bloat
- Vercel serves with brotli/gzip which deduplicates repeated class strings in the JS bundle
- Atomic selectors are faster for the browser to match than nested/compound custom classes
- The real consistency tool is **periodic design audits**, not abstraction layers
- Keep styles colocated in JSX so you can see what a component looks like without jumping to a CSS file

### Design Tokens (copy-paste reference for audits)
These are the canonical values — every component should match:
- **Section headings:** `text-xs font-semibold uppercase tracking-widest` + muted color (`text-black/60` / `text-white/60`)
- **Primary text:** `/80` opacity (`text-black/80` / `text-white/80`)
- **Muted text:** `/60`, **Dim text:** `/50`, **Ghost text:** `/40`
- **Buttons (bordered):** `text-xs font-medium rounded-md border transition-colors`
- **Toggle button groups:** `rounded-md overflow-hidden border` wrapper
- **Links:** `no-underline hover:underline underline-offset-2`
- **Touch targets (icon buttons):** `w-8 h-6` (4:3 ratio)

### State Conventions
- `rampConfig.steps` is source of truth for shade columns: `{ step, l }[]`
- Steps sort by L ascending (dark→light)
- `BrandColor.id` is the stable identity (used for React keys, dnd-kit, expandable rows); `name` is user-editable
- Adjustments: hue (additive deg), chroma (multiplicative % for chromatic, additive for achromatic), lightness (additive L)
- `sortFamilies()` in `color-engine.ts` sorts by hue ascending
- All export functions (CSS, Tailwind, Tokens, ASE, ACO) respect sort order

### Drag-and-Drop
- **Source cards** (BrandColorEditor): dnd-kit with `rectSortingStrategy` (handles multi-row wrapping), dispatches `REORDER_COLOR` + sets `sortByHue: false`
- **Shade grid rows** (ShadeGrid): vertical dnd-kit with `verticalListSortingStrategy`, drag handle is name column only
- Dragging a shade row dispatches `SET_BRAND_ORDER` which atomically reorders `brandColors[]` and sets `sortByHue: false`
- Floating accent strokes (absolute positioned, pill-shaped `rounded-full`, `w-0.5`) on both left and right margins indicate the drag handle row on hover
- Shade grid name column has `mr-2` gap before swatch grid; column header spacer matches

### Form UX
- Name and hex inputs: select-all on focus, Enter/Escape to blur
- Background slider: inverted (left = white, right = black) with swatch indicators

## Commit Workflow
- Make natural commits in batches that make sense
- Never push — the user pushes manually
- Use `_PROCESSED/` to dump removed content during sweeps

## Shutdown Cleanup Scope
**Safe to clean:** `.next/` (build cache), any `*.tsbuildinfo`, temp files
**Never touch:** `src/`, config files, `node_modules/`, `.git/`, memory files, `.env` (doesn't exist but just in case)
