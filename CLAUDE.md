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

**Stage:** v0.1 — forked from color-palette v1.2. Fresh repo, ready for brand-color-system specific development.

## Tech Stack
- **Next.js 16** (App Router, `'use client'` for all interactive pages)
- **React 19**
- **Tailwind CSS v4** (CSS-first config via `@theme` in `globals.css`, no `tailwind.config.js`)
- **culori** v4 (ESM-only) — OKLCH conversions, gamut mapping via `toGamut('rgb', 'oklch')`
- **@dnd-kit** — drag-and-drop reordering of brand color cards
- **TypeScript** — strict mode
- No database, no API routes, no server-side logic

## Commands
- `npm run dev` — dev server on localhost:3000
- `npm run build` — production build (verify before deploy)
- `npm run lint` — ESLint
- `npm start` — serve production build locally

## Deploy
Push to GitHub → Vercel auto-deploys. No env vars needed. Static export.

## Project Structure
```
src/
  lib/                           # Pure logic (no React)
    types.ts                     # All shared interfaces (BrandColor, OklchColor, Shade, ShadeFamily, etc.)
    color-conversions.ts         # culori wrappers: hex<->OKLCH, gamut mapping, format outputs
    color-engine.ts              # Core: adjustments -> shades -> families, sortFamilies()
    lightness-ramp.ts            # stepFromL(), default steps, sorting
    contrast.ts                  # WCAG luminance + contrast ratio
    brand-colors.ts              # Defaults + hero step injection
    export-ase.ts                # Adobe Swatch Exchange (.ase) binary generation
    export-aco.ts                # Adobe Color Swatch (.aco) binary generation
    export-tokens.ts             # W3C Design Tokens (DTCG) JSON generation
  hooks/
    usePaletteState.ts           # Central state: useReducer + useMemo (20 actions)
  components/
    Header.tsx                   # Top bar: title, gamut, BG slider, toggles, Settings dropdown, Reset
    GlobalSettingsDropdown.tsx   # Advanced options (Match Intensity, Sort by Hue)
    BrandColorEditor.tsx         # Brand cards grid (uses BrandColorCard for each item)
    BrandColorCard.tsx           # Individual card logic (drag-and-drop, inputs, H/C/L sliders)
    ShadeGrid.tsx                # Column headers (step #, L sliders, hero badge) + shade rows
    ColorSwatch.tsx              # Individual shade cell (memo'd)
    BackgroundSlider.tsx         # Background gray slider
    TextOverlayToggle.tsx        # Text overlay toggle (white/black/both)
    OutputSection.tsx            # Value tables, export buttons (CSS/Tailwind/Tokens/.ase/.aco), "How it works"
  app/
    page.tsx                     # Single-page entry, gamut indicator
    layout.tsx / globals.css     # Root layout + Tailwind + custom slider CSS + color-scheme
```

## Architecture

### Data Flow
`BrandColor[] + RampConfig + matchIntensity` → `color-engine.ts` → `ShadeFamily[]` → UI components.

All state in `usePaletteState.ts` via `useReducer`. `generateAllFamilies` wrapped in `useMemo`.

### State (20 Actions)

| Action | Payload | Description |
|--------|---------|-------------|
| `UPDATE_COLOR` | index, hex | Change brand hex (blocked if hero) |
| `UPDATE_NAME` | index, name | Rename a brand color |
| `UPDATE_ADJUSTMENTS` | index, adjustments | Change hue/chroma/lightness shifts |
| `REORDER_COLOR` | fromIndex, toIndex | Drag-and-drop reorder |
| `ADD_COLOR` | — | Add new brand color card (visible: true) |
| `REMOVE_COLOR` | index | Remove card (auto-promotes hero if removed, min 1) |
| `SET_HERO` | id | Transfer hero to another color (ensures visibility) |
| `TOGGLE_VISIBILITY` | index | Hide/show from grid & exports (hero cannot be hidden) |
| `SET_BACKGROUND` | value (0–100) | Set page background gray level |
| `SET_TEXT_OVERLAY` | mode | Toggle white/black/both text overlay |
| `UPDATE_STEP` | index, updates | Change a shade step's L and/or name |
| `ADD_STEP` | — | Insert new step (midpoint of two lightest) |
| `REMOVE_STEP` | index | Remove a shade column (min 2) |
| `SORT_STEPS` | — | Re-sort columns by L ascending |
| `SET_SHOW_NEAREST_OUTLINE` | boolean | Toggle nearest-input ring on swatches |
| `SET_SHOW_SWATCH_TEXT` | boolean | Toggle all swatch text/labels |
| `SET_COMPACT_VIEW` | boolean | Toggle flush grid layout |
| `SET_MATCH_INTENSITY` | boolean | Toggle chroma matching to hero |
| `SET_SORT_BY_HUE` | boolean | Toggle hue-sorted vs source-order rows |
| `RESET` | — | Return to defaults |
| `HYDRATE` | payload | Load persisted state from localStorage |

### State Defaults
- `matchIntensity: false`, `sortByHue: true`, `compactView: false`
- `showNearestOutline: true`, `showSwatchText: true`
- `textOverlay: 'both'`, `backgroundColor: '#333333'`

## Conventions

### Color Math
- **Always** use `culori.toGamut('rgb', 'oklch')` for gamut mapping — never naive clamping
- Achromatic colors (C < 0.005): use additive chroma fallback (`shift * 0.15`) instead of multiplicative
- L: 0–1, C: 0–~0.4, H: 0–360 degrees
- Step numbers derive from L: `step = round(1000 * (1 - L))` — see `stepFromL()`
- `adjustedOklch` / `adjustedHex` on ShadeFamily = hue/chroma/lightness shifts applied to base
- Nearest-input matching uses perceptual distance in OKLCH (L, C, hue shortest-arc) against adjusted color

### UI Patterns
- `bgIsLight: boolean` on all components for adaptive text/borders (threshold: gray value > 140)
- Dynamic colors → inline `style={{}}`. Static chrome → Tailwind classes
- Minimalistic system aesthetics: focus on spacing, typography, and clear "Source → Adjusted" patterns
- `focus-visible` rings for keyboard accessibility (global rule in `globals.css`)
- Custom slider styling in `globals.css` via `.custom-range` class with CSS custom properties
- `color-scheme: light dark` on `:root` for browser color management

### State
- `rampConfig.steps` is source of truth for shade columns: `{ step, l }[]`
- Steps sort by L ascending (dark→light)
- `BrandColor.id` is the stable identity (used for React keys, dnd-kit, expandable rows); `name` is user-editable
- `BrandColor.locked: boolean` marks the hero color — exactly one color has `locked: true` at all times
- `BrandColor.visible: boolean` controls grid/export inclusion — hero must stay visible
- Adjustments: hue (additive deg), chroma (multiplicative % for chromatic, additive for achromatic), lightness (additive L)
- `sortFamilies()` in `color-engine.ts` is the canonical sort order (hero first, then by hue)
- All export functions (CSS, Tailwind, Tokens, ASE, ACO) respect sort order and visibility

### Form UX
- Step number inputs: Tab/Shift+Tab navigates between columns (skipping locked), Enter commits, Escape cancels
- Name and hex inputs: select-all on focus, Enter/Escape to blur
- L sliders: local state during drag (no re-render per pixel), commit on pointer-up with 800ms auto-sort

### Hero System
- **F5 Red `#e4002b` is the default hero.** Hero status is transferable — click the dot on any source card.
- The hero's hex is locked (cannot edit), its OKLCH L pins a column in the shade grid, and its chroma drives Match Intensity.
- The hero column shows a "Hero" badge and its L slider is disabled.
- `SET_HERO` ensures the new hero is visible. `TOGGLE_VISIBILITY` is a no-op on the hero.
- Removing the hero auto-promotes the first remaining color.

## Shutdown Cleanup Scope
**Safe to clean:** `.next/` (build cache), any `*.tsbuildinfo`, temp files
**Never touch:** `src/`, config files, `node_modules/`, `.git/`, memory files, `.env` (doesn't exist but just in case)
