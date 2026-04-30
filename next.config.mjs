/** @type {import('next').NextConfig} */

// Single source of truth for the site URL is src/lib/site.ts. We can't import
// TS into next.config.mjs, so the same values are mirrored here from
// environment variables (with the same defaults). Keep them in sync.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/brand-color-system";

const nextConfig = {
    // Static HTML export — the build emits ./out/ which is what GitHub Pages
    // serves directly. No Node server, no API routes.
    output: "export",

    // GitHub Pages serves at /<repo-name>/ for project repos. basePath +
    // assetPrefix tell Next.js to emit URLs under that prefix so links and
    // asset references work without us hand-editing every absolute path.
    basePath: BASE_PATH,
    assetPrefix: BASE_PATH,

    // Avoid trailing-slash mismatches between Next's default and how GitHub
    // Pages rewrites URLs.
    trailingSlash: true,

    // The Image Optimization API requires a Node runtime; turn it off so
    // <Image> serves raw files from /out/.
    images: {
        unoptimized: true,
    },

    // Disable the "x-powered-by" header (it's static export anyway, but the
    // dev server still emits it).
    poweredByHeader: false,

    // Strict mode catches issues in dev without affecting prod output.
    reactStrictMode: true,
};

export default nextConfig;
