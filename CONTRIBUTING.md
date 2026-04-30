# Contributing

Thanks for the interest. This is a small, single-maintainer design tool, so
contributions are welcome but the bar is "matches the existing code's polish."

## Getting set up

```sh
git clone https://github.com/jeffalldridge/brand-color-system
cd brand-color-system
npm install
npm run dev    # http://localhost:3000
```

## Before sending a PR

- Run `npm run lint` — clean.
- Run `npm run build` — completes, no new warnings.
- For UI changes, attach a before/after screenshot.
- Keep commits focused. Conventional Commit prefixes (`feat:`, `fix:`,
  `refactor:`, `docs:`, `chore:`) help auto-changelog tools.

## What kinds of contributions fit

- Bug fixes — especially edge cases in OKLCH ↔ sRGB / P3 gamut mapping,
  hydration mismatches, or drag-and-drop quirks on touch devices.
- New import or export formats (Figma plugin, Adobe ACB, etc.).
- Accessibility improvements — keyboard navigation, screen reader
  labelling, focus management.
- Tests for any uncovered logic in `src/lib/` (color-engine,
  lightness-ramp, contrast, export-*).
- Performance improvements when palettes get large.
- Documentation improvements.

## What probably doesn't fit (without discussion first)

- Server / API routes — the app is intentionally fully static.
- A backend or accounts — the app is intentionally fully static.
- Changing the algorithm in `color-engine.ts` substantially — file an
  issue first to talk through it.
- Adding heavyweight dependencies. The total install is small for a
  reason.

## Code style

Follow the existing patterns:

- TypeScript strict mode.
- React 19, Next.js 16 App Router, all interactive components are
  `'use client'`.
- Tailwind CSS v4 with CSS-first config (`@theme` in `globals.css`); no
  `tailwind.config.ts`.
- Pure logic in `src/lib/` (no React); React in `src/components/`; state
  in `src/hooks/usePaletteState.ts`.
- Each file has one clear responsibility.

## Filing issues

For bugs include the browser + version, the steps to reproduce, and a
screenshot if it's visual. For features, describe the use case before the
proposed solution.

## Security

For security-sensitive issues, see [`SECURITY.md`](SECURITY.md) — please
don't open public issues for those.
