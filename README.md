# Brand Color System

## Why This Exists

We have 8 brand colors that need to work everywhere — UI components, marketing pages, product surfaces, dark mode, light mode, on every background. Each color needs a full family of shades (dark through light) so designers and engineers can pick the right tone for any context.

The problem: **generating shade families that feel perceptually consistent across different hues is hard.** In traditional color spaces like HSL, a "50% lightness" red and a "50% lightness" blue don't *look* equally bright to the human eye. Yellow at 50% HSL looks much lighter than blue at 50% HSL. So a shade grid built in HSL will have uneven visual weight across colors at the same step — the "500" row won't feel like one consistent brightness level.

**OKLCH fixes this.** Its Lightness axis is perceptually uniform: L=0.50 for red and L=0.50 for blue genuinely appear the same brightness. This tool uses OKLCH to generate shade ramps where every color at the same shade step shares identical perceived brightness, producing a grid you can trust by eye.

### The Constraint

**F5 Red (`#e4002b`) is the default hero brand color.** It's the initial fixed point in the system. Everything else — shade steps, other brand hues, chroma levels — can be tuned. The hero color's natural OKLCH lightness defines a locked shade column, guaranteeing there's always a step where the exact brand hex appears. Hero status can be transferred to any color via the toggle dot on each source card.

## What It Does

This is a single-page interactive system. The design team opens it, sees all 8 brand colors stretched across a shade grid, and can collaboratively tune the palette in real time. Changes are instant — drag a slider, see every swatch update.

### The Algorithm

1. Each brand hex is converted to **OKLCH** (Lightness, Chroma, Hue) using `culori`
2. Optional per-color adjustments are applied: hue rotation, chroma scaling, lightness offset
3. A **global lightness ramp** defines the L value for each shade step — step numbers derive directly from L via `step = round(1000 * (1 - L))`, so step 500 = L 0.50, step 750 = L 0.25, step 30 = L 0.97
4. For each shade: L comes from the ramp, C and H come from the (possibly adjusted) brand color
5. Colors outside sRGB gamut are mapped back using the **CSS Color Level 4 gamut mapping algorithm** (`culori.toGamut`) — this reduces chroma minimally to fit the target gamut rather than naive clamping
6. WCAG contrast ratios are computed against white (#fff) and black (#000) for every generated shade

The result: a grid where each row is a brand color's full shade family, and each column represents one lightness level. Every swatch in the same column has identical perceived brightness.

### The Brand Colors

| Name | Hex | Role |
|------|-----|------|
| F5 Red | `#e4002b` | **Default hero brand color** |
| Eggplant | `#832cb6` | Secondary palette |
| River | `#1041aa` | Secondary palette |
| Bay | `#0272b0` | Secondary palette |
| Surf | `#009b92` | Secondary palette |
| Jade | `#00963a` | Secondary palette |
| Tangerine | `#f79027` | Secondary palette |
| Raspberry | `#ac2782` | Secondary palette |

All names and hex values are editable (except the hero color's hex, which is locked to ensure system consistency). Hero status can be transferred to any color.

## Features

### Brand Color Editor
- **Toggleable hero color** — click the dot on any card to make it the hero; hero color's hex is locked and its step is pinned in the grid
- **Visibility toggle** — hide/show individual colors from the shade grid and exports without removing them
- **Split color preview** — shows source hex and adjusted hex side-by-side when adjustments are active
- Editable **Name** and **Hex** inputs per color (hex is disabled for the hero; select-all on focus, Enter/Escape to blur)
- Per-color **Hue**, **Chroma**, and **Lightness** adjustment sliders with absolute OKLCH values and origin markers
- **Add / Remove** brand colors dynamically (minimum 1 required)
- **Drag-and-drop reordering** of brand color cards (@dnd-kit)
- Grayscale-aware chroma: achromatic inputs use additive chroma fallback so they can gain saturation

### Shade Grid
- Horizontal rows per brand color — dark (left) to light (right)
- **Dynamic shade steps** — add, remove, or edit shade columns
- **Tab navigation** — Tab/Shift+Tab between step number inputs when editing (skips locked columns)
- **Hero column** — hero color's L value pinned with a "Hero" badge at the column footer
- **Per-step L slider** — drag to adjust lightness; the step number auto-updates via `step = round(1000 * (1 - L))`
- **Click-to-edit step numbers** — manually override a step name; Enter to commit, Escape to cancel
- **Auto-sort** — columns reorder by lightness after 800ms pause so tonal progression stays correct
- **"INPUT" / "NEAREST" indicator** — "INPUT" marks exact hex matches, "NEAREST" marks closest-step approximations
- **"GM" badge** — marks shades that required gamut mapping (original OKLCH fell outside sRGB)

### Display Controls
- **Match Intensity** — blend all colors' chroma toward the hero's at the locked step
- **Sort by Hue** — toggle between hue-sorted rows and source color order (on by default)
- **Nearest Input** — show or hide the outline ring on INPUT/NEAREST indicator swatches
- **Labels** — show or hide all text in shade chips (step numbers, badges, contrast ratios, hex values)
- **Compact** — remove gaps, rounded corners, shadows, and hover effects for flush edge-to-edge comparison
- **Background slider** — test the palette on any gray from black to white
- **Text overlay toggle** — show white text, black text, or both on swatches to visualize contrast breakpoints
- **Contrast ratios** — WCAG contrast ratios (vs white and vs black) displayed on every swatch
- **Adaptive UI** — all labels, controls, and borders switch between light/dark appearance based on background
- **Keyboard accessibility** — focus-visible rings on all interactive elements
- **Display gamut indicator** — shows sRGB, P3, or Rec. 2020 based on the current display's capabilities

### Output & Export
- Expandable per-color accordion rows with **Step, Hex, RGB, HSL, OKLCH, Gamut** columns
- Click any value to copy it to clipboard (with "ok" feedback)
- **CSS Custom Properties** — exports as `:root { --name-step: #hex; }` variables
- **Tailwind @theme** — exports in Tailwind v4's `@theme { --color-name-step: oklch(...); }` format
- **W3C Design Tokens (DTCG)** — JSON with hex values and OKLCH extensions, compatible with Tokens Studio, Style Dictionary, and Figma
- **Adobe Swatch Exchange (.ase)** — binary format for Illustrator, Photoshop, and InDesign
- **Adobe Color Swatch (.aco)** — binary format (v1+v2) for Photoshop
- All exports respect the current sort order and visibility settings
- **"How it works"** — collapsible explainer section covering color space, shade generation, hero system, contrast formulas, adjustments, and exports

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Push to GitHub, connect the repo in Vercel. No environment variables, no server config — it's a fully client-side static page that prebuilds to HTML.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Vercel-native, static export, fast builds |
| Styling | Tailwind CSS v4 | Utility classes for UI chrome; CSS-first config via `@theme` |
| Color math | culori v4 | Best OKLCH support, CSS Color Level 4 gamut mapping algorithm |
| DND | @dnd-kit | Fluid horizontal drag-and-drop reordering of brand colors |
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
    lightness-ramp.ts            # stepFromL formula, default step generation, sorting
    contrast.ts                  # WCAG relative luminance + contrast ratio
    brand-colors.ts              # Default brand color definitions + hero step injection
    export-ase.ts                # Adobe Swatch Exchange (.ase) binary file generation
    export-aco.ts                # Adobe Color Swatch (.aco) binary file generation
    export-tokens.ts             # W3C Design Tokens (DTCG) JSON generation
  hooks/
    usePaletteState.ts           # Central state (useReducer), localStorage persistence, useMemo
  components/
    Header.tsx                   # Top bar: title, gamut indicator, toggles, global dropdown
    GlobalSettingsDropdown.tsx   # Advanced display options
    BrandColorEditor.tsx         # Brand cards grid container
    BrandColorCard.tsx           # Individual color card (inputs, H/C/L sliders, drag-and-drop)
    ShadeGrid.tsx                # Column headers (step #, L sliders, hero badge) + shade rows
    ColorSwatch.tsx              # Individual shade cell with contrast info + indicators
    BackgroundSlider.tsx         # Background gray slider
    TextOverlayToggle.tsx        # White/black/both text toggle
    OutputSection.tsx            # Values tables, export buttons, "How it works" explainer
  app/
    page.tsx                     # Single-page entry point, wires state to components
    layout.tsx                   # Root layout
    globals.css                  # Tailwind import + custom slider styles + color-scheme
```

### Data Flow

```
BrandColor[] + RampConfig
       |
       v
 color-engine.ts
   1. hexToOklch(brand.hex)              -- parse source color
   2. applyAdjustments(oklch, brand)     -- hue/chroma/lightness shifts
   3. for each step in ramp:
        set L from ramp, keep C & H      -- override lightness
        oklchToHex (with gamut mapping)   -- convert back to sRGB
        compute contrast ratios           -- WCAG vs white & black
   4. find closestStep                   -- nearest shade to source L
       |
       v
 ShadeFamily[] (with hex, RGB, HSL, OKLCH, adjustedHex, contrast ratios)
       |
       v
 UI Components (ShadeGrid, BrandColorEditor, OutputSection)
```

### State Management

All state lives in `usePaletteState.ts` as a single `useReducer`. Actions are a typed discriminated union (20 actions):

| Action | What it does |
|--------|-------------|
| `UPDATE_COLOR` | Change a brand color's hex (blocked for hero) |
| `UPDATE_NAME` | Rename a brand color |
| `UPDATE_ADJUSTMENTS` | Change hue/chroma/lightness shifts |
| `REORDER_COLOR` | Move a brand color via drag-and-drop |
| `ADD_COLOR` | Add a new brand color card |
| `REMOVE_COLOR` | Remove a brand color (auto-promotes hero if removed, min 1) |
| `SET_HERO` | Transfer hero status to a different color (ensures visibility) |
| `TOGGLE_VISIBILITY` | Hide/show a color from grid and exports (hero cannot be hidden) |
| `SET_BACKGROUND` | Change page background gray level |
| `SET_TEXT_OVERLAY` | Toggle white/black/both text on swatches |
| `UPDATE_STEP` | Change a shade step's L value and/or name |
| `ADD_STEP` | Insert a new shade step (midpoint of two lightest) |
| `REMOVE_STEP` | Remove a shade column (minimum 2 enforced) |
| `SORT_STEPS` | Re-sort columns by L ascending |
| `SET_SHOW_NEAREST_OUTLINE` | Toggle nearest-input outline ring visibility |
| `SET_SHOW_SWATCH_TEXT` | Toggle all swatch text/labels visibility |
| `SET_COMPACT_VIEW` | Toggle compact (flush) grid layout |
| `SET_MATCH_INTENSITY` | Toggle chroma matching to hero |
| `SET_SORT_BY_HUE` | Toggle hue-sorted vs source-order rows |
| `RESET` | Return to defaults |

The expensive `generateAllFamilies()` is wrapped in `useMemo` — it only recomputes when `brandColors`, `rampConfig`, or `matchIntensity` change.

### Key Design Decisions

**Step numbers derive from L values.** The formula `step = round(1000 * (1 - L))` keeps step names honest — step 500 always means L=0.50. When you drag a slider, the number updates automatically.

**Hero color is transferable.** Any brand color can be the hero. The hero's hex is locked, its L value pins a column in the grid, and its chroma drives Match Intensity blending. Transfer hero status by clicking the dot on any source card.

**Visibility is non-destructive.** Hidden colors retain all their config (name, hex, adjustments) and can be restored instantly. The hero cannot be hidden.

**Gamut mapping, not clamping.** High-chroma colors at extreme lightness values lack natural analogues in sRGB space. We use culori's `toGamut('rgb', 'oklch')` to naturally reduce chroma for web rendering.

**Adjustments are relative, not absolute.** Hue shift is additive (degrees), chroma shift is multiplicative (percentage), lightness shift is additive (L units).

## Future Ideas

- [ ] Per-step hue/chroma shift curves (different hue rotation at dark vs light ends)
- [ ] Import/export full palette as JSON for sharing between team members
- [x] Persist state to localStorage so palette survives page refresh
- [ ] Side-by-side comparison mode (compare two palette configurations)
- [ ] Accessibility checker (flag shade pairs that fail WCAG AA/AAA)
- [ ] Color blindness simulation preview (deuteranopia, protanopia, tritanopia)
- [ ] Mobile responsiveness audit

## Changelog

### v1.2 — Hero System, Visibility, Exports & Color Accuracy
- **Toggleable hero color** — any brand color can be the hero via dot toggle; hero's hex is locked, step is pinned
- **Per-color visibility toggle** — hide/show colors from grid and exports without removing them
- **Hero badge** — consistent "Hero" badge styling in both source cards and shade grid columns
- **Color science audit** — verified all OKLCH math, contrast formulas, and gamut mapping
- **ASE export fix** — fixed buffer overflow bug (name format mismatch between size calc and write phase)
- **ACO export** — Adobe Color Swatch (.aco) v1+v2 binary format for Photoshop
- **Design Tokens export** — W3C DTCG JSON with hex values and OKLCH extensions
- **"How it works" explainer** — collapsible section explaining color space, shade generation, hero system, contrast, adjustments, and exports
- **Display gamut indicator** — shows sRGB, P3, or Rec. 2020 capability in header
- **`color-scheme: light dark`** — CSS property for accurate browser color management
- **SET_HERO ensures visibility** — promoting a hidden color to hero automatically makes it visible

### v1.1 — Display Toggles & Compact View
- **INPUT vs NEAREST labels** — "INPUT" marks exact hex matches, "NEAREST" marks closest-step approximations
- **Nearest Input outline** now uses a consistent color tied to page background (not per-swatch contrast)
- **Nearest Input toggle** — show/hide the outline ring on closest-to-input swatches
- **Labels toggle** — show/hide all text in shade chips
- **Compact toggle** — removes gaps, rounded corners, shadows for flush comparison
- All three toggles are independent and reset with the Reset button

### v1.0 — Launch
- Pre-flight cleanup across all source files for production readiness
- Removed `dangerouslySetInnerHTML` inline styles; slider CSS now in `globals.css`
- Removed `framer-motion` dependency (~225KB bundle reduction)
- Added stable `id` field to `BrandColor`
- `ColorSwatch` wrapped in `React.memo` for render performance
- Extracted `sortFamilies()` utility, eliminating duplicate sort logic
- Cross-browser slider support (WebKit + Firefox pseudo-elements)

### v0.5 — Interface Polish & Hero Color Locking
- Rebuilt `BrandColorEditor` with unified color chip and simplified input array
- Injected hero L-step column with "Locked" badge

### v0.4 — Accurate Steps + Split Preview + Editable Names
- Step numbers derive from L values via `step = round(1000 * (1 - L))`
- Split color preview, adjusted hex display, editable names

### v0.3 — Dynamic Steps + Reordering
- Dynamic shade step array (add/remove/edit) with per-step L sliders
- Brand color row reordering via drag-and-drop

### v0.2 — Horizontal Grid + Adjustments
- Rotated grid (rows = colors, columns = steps, dark left to light right)
- Per-color H/C/L adjustment sliders
- Adaptive UI for light/dark backgrounds

### v0.1 — Initial Build
- OKLCH shade generation engine with culori
- 8 brand colors, global lightness ramp, contrast ratios
- CSS Custom Properties and Tailwind @theme export
