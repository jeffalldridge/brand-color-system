# Icon & Image Generators

These files were originally Next.js dynamic image routes (`src/app/icon.tsx`, `src/app/opengraph-image.tsx`, etc.) that generate icons and social images at build time using `next/og` `ImageResponse`.

## What they produce

| Generator | Output | Size |
|-----------|--------|------|
| `icon.tsx` | PNG favicon (colour wheel dots) | 32 × 32 |
| `apple-icon.tsx` | Apple touch icon | 180 × 180 |
| `icon-192-route/route.tsx` | PWA icon | 192 × 192 |
| `icon-512-route/route.tsx` | PWA icon | 512 × 512 |
| `opengraph-image.tsx` | OG / Twitter card image | 1200 × 630 |

## How to regenerate

1. Temporarily move the desired generator(s) back into `src/app/`
2. Run `npm run dev`
3. Fetch the image: `curl -o public/<name>.png http://localhost:3000/<route>`
4. Move the generator back here

The current static images in `public/` were rendered from these generators and are placeholder/reference assets — replace with final designs as needed.
