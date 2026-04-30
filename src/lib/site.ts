/**
 * Single source of truth for site URL + path configuration.
 *
 * Read by:
 *   - next.config.mjs (basePath / assetPrefix)
 *   - app/layout.tsx (metadataBase, JSON-LD, OG image URLs)
 *   - app/sitemap.ts
 *   - app/robots.ts
 *   - app/manifest.ts
 *
 * Override at build time with NEXT_PUBLIC_SITE_URL and
 * NEXT_PUBLIC_BASE_PATH for fork / preview environments.
 */

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jeffalldridge.github.io";

export const BASE_PATH =
    process.env.NEXT_PUBLIC_BASE_PATH ?? "/brand-color-system";

/** Absolute URL of the site root (no trailing slash). */
export const CANONICAL_URL = `${SITE_URL}${BASE_PATH}`;

/** Prepend the base path to an asset path that begins with `/`. */
export function withBasePath(path: string): string {
    if (!BASE_PATH) return path;
    if (!path.startsWith("/")) return path;
    return `${BASE_PATH}${path}`;
}

export const APP_NAME = "Brand Color Explorer";

export const APP_DESCRIPTION =
    "A free color tool by Tent Studios. Generate perceptually uniform shade families from any brand color using OKLCH. Export to CSS, Tailwind v4, W3C Design Tokens, ASE, and ACO — ready for production.";
