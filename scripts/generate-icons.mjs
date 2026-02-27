/**
 * Generate all PWA/web icons from the Brand Color Explorer dot-ring design.
 *
 * Usage: node scripts/generate-icons.mjs
 *
 * Outputs:
 *   public/apple-icon-180.png     — light bg, optimized for Apple Liquid Glass auto-conversion
 *   public/icon-192.png           — dark bg, standard PWA icon
 *   public/icon-512.png           — dark bg, standard PWA icon
 *   public/icon-maskable-192.png  — dark bg, maskable safe zone for Android
 *   public/icon-maskable-512.png  — dark bg, maskable safe zone for Android
 *   public/icon-32.png            — dark bg, favicon
 *   public/icon-transparent-1024.png — transparent, for Icon Composer / design use
 */

import sharp from "sharp";

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // purple
  "#14b8a6", // teal
  "#22c55e", // green
  "#f97316", // orange
  "#f43f5e", // rose
];

/**
 * Generate SVG of the dot ring at a given size.
 * @param {number} size - Canvas size in px
 * @param {string|null} bg - Background color (null = transparent)
 * @param {number} ringScale - Ring radius as fraction of size (0.32 = standard, smaller for maskable safe zone)
 * @param {number} dotScale - Dot radius as fraction of size
 */
function makeSvg(size, bg, ringScale = 0.32, dotScale = 0.11) {
  const center = size / 2;
  const ringR = size * ringScale;
  const dotR = size * dotScale;

  const circles = COLORS.map((color, i) => {
    const angle = (i / COLORS.length) * Math.PI * 2 - Math.PI / 2;
    const cx = center + ringR * Math.cos(angle);
    const cy = center + ringR * Math.sin(angle);
    return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${dotR.toFixed(2)}" fill="${color}" />`;
  }).join("\n  ");

  const bgRect = bg
    ? `<rect width="${size}" height="${size}" fill="${bg}" />`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgRect}
  ${circles}
</svg>`;
}

async function generate(filename, size, bg, ringScale, dotScale) {
  const svg = makeSvg(size, bg, ringScale, dotScale);
  await sharp(Buffer.from(svg)).png().toFile(`public/${filename}`);
  console.log(`  ✓ ${filename} (${size}×${size})`);
}

console.log("Generating icons...\n");

await Promise.all([
  // Apple touch icon — WHITE background for optimal Liquid Glass auto-conversion
  generate("apple-icon-180.png", 180, "#ffffff"),

  // Standard PWA icons — dark background
  generate("icon-192.png", 192, "#1a1a1a"),
  generate("icon-512.png", 512, "#1a1a1a"),

  // Maskable icons — dark bg, content pulled inward to 72% safe zone
  // ringScale 0.24 + dotScale 0.085 keeps dots within the safe circle
  generate("icon-maskable-192.png", 192, "#1a1a1a", 0.24, 0.085),
  generate("icon-maskable-512.png", 512, "#1a1a1a", 0.24, 0.085),

  // Favicon
  generate("icon-32.png", 32, "#1a1a1a", 0.28, 0.09),

  // Transparent 1024 — for Icon Composer / design reference
  generate("icon-transparent-1024.png", 1024, null),
]);

console.log("\nDone!");
