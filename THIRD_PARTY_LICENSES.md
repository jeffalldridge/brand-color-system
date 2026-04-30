# Third-Party Licenses

This project uses the following third-party software. Each is used under
the terms of its own license. See the individual project's repository for
the full license text.

## Runtime dependencies

| Package | License | Use |
|---|---|---|
| [`next`](https://github.com/vercel/next.js) | MIT | App Router, static export |
| [`react`](https://github.com/facebook/react) | MIT | UI |
| [`react-dom`](https://github.com/facebook/react) | MIT | UI |
| [`culori`](https://github.com/Evercoder/culori) | MIT | OKLCH conversions, gamut mapping (CSS Color Level 4) |
| [`@dnd-kit/core`](https://github.com/clauderic/dnd-kit) | MIT | Drag-and-drop primitives |
| [`@dnd-kit/sortable`](https://github.com/clauderic/dnd-kit) | MIT | Sortable list helpers |

## Build / dev dependencies

| Package | License | Use |
|---|---|---|
| [`typescript`](https://github.com/microsoft/TypeScript) | Apache-2.0 | Type checking |
| [`tailwindcss`](https://github.com/tailwindlabs/tailwindcss) | MIT | CSS framework (v4, CSS-first config) |
| [`@tailwindcss/postcss`](https://github.com/tailwindlabs/tailwindcss) | MIT | Tailwind PostCSS plugin |
| [`eslint`](https://github.com/eslint/eslint) | MIT | Linting |
| [`eslint-config-next`](https://github.com/vercel/next.js) | MIT | Next.js ESLint config |

## Fonts

- **Geist** and **Geist Mono** by Vercel — [SIL Open Font License 1.1](https://github.com/vercel/geist-font/blob/main/LICENSE.TXT). Loaded via `next/font/google` and shipped as static assets in the build output.

## Icon design

- The app icon dot ring uses a six-color palette derived from common
  modern UI accent colors. Original design.
- Icon Composer source files live at `docs/icon-source.icon/`.

## Attribution

- Color science fundamentals: [CSS Color Level 4 specification](https://www.w3.org/TR/css-color-4/)
  for OKLCH and gamut mapping; Björn Ottosson for the OKLab / OKLCH color
  spaces.
- Tailwind v4's `@theme` directive and step naming convention informed the
  default 50–950 shade scale.

## Notes

- This project does not bundle any GPL- or copyleft-licensed code.
- All dependencies are MIT- or Apache-2.0-licensed (or compatible).
