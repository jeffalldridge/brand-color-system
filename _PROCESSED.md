# _PROCESSED

Content that has been superseded, removed, or swept during cleanup. Safe to delete this file once reviewed.

---

## Removed: Hero System (v0.1 fork cleanup, 2026-02-27)

The hero color system from the original color-palette v1.2 was stripped in the fork to brand-color-system. All brand colors are now equal peers — no locked hex, no pinned column, no hero badge.

**Removed actions:**
- `SET_HERO` — transferred hero status to another color
- `TOGGLE_VISIBILITY` — hid/showed colors from grid (hero couldn't be hidden)
- `SET_MATCH_INTENSITY` — blended chroma toward hero's at locked step
- `SET_COMPACT_VIEW` — replaced by `SET_GAP_SIZE` with 4 levels (Flush/Tight/Normal/Wide)

**Removed state fields:**
- `BrandColor.locked: boolean` — marked the hero color
- `BrandColor.visible: boolean` — controlled grid/export inclusion
- `matchIntensity: boolean` — global chroma blending toggle

**Removed component:**
- `GlobalSettingsDropdown.tsx` — advanced options dropdown (Match Intensity, Sort by Hue). Sort by Hue moved to Header row 2 inline toggles.

## Removed: Old Default Brand Colors

The original 8 colors (F5-branded) were replaced with 7 generic colors:

**Old defaults:**
| Name | Hex | Role |
|------|-----|------|
| F5 Red | `#e4002b` | Default hero |
| Eggplant | `#832cb6` | Secondary |
| River | `#1041aa` | Secondary |
| Bay | `#0272b0` | Secondary |
| Surf | `#009b92` | Secondary |
| Jade | `#00963a` | Secondary |
| Tangerine | `#f79027` | Secondary |
| Raspberry | `#ac2782` | Secondary |

**New defaults:**
Blue, Purple, Teal, Green, Orange, Rose, Tones (generic palette)

## Removed: Template SVGs (2026-02-27)

Deleted unused Next.js starter template files from `public/`:
- `file.svg`
- `globe.svg`
- `next.svg`
- `vercel.svg`
- `window.svg`

## Stale README Sections

The README.md was rewritten to remove references to:
- Hero color system (hero badges, locked hex, pinned columns, hero transfer)
- Visibility toggles
- Match Intensity
- Compact view (replaced by gap size)
- F5-branded color names
- Display gamut indicator badge (replaced by icon + P3 toggle)
- 20 actions (now 16)
- GlobalSettingsDropdown component
