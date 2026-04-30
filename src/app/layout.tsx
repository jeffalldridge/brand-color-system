import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
    APP_DESCRIPTION,
    APP_NAME,
    BASE_PATH,
    CANONICAL_URL,
    SITE_URL,
    withBasePath,
} from "@/lib/site";

// Asset paths that need the basepath prefix so they resolve under
// jeffalldridge.github.io/brand-color-system/<asset>. Without this, relative
// URLs in metadata get re-rooted at the github.io origin and 404.
const OG_IMAGE_PATH = withBasePath("/og-image.png");
const FAVICON_32_PATH = withBasePath("/icon-32.png");
const FAVICON_192_PATH = withBasePath("/icon-192.png");
const APPLE_TOUCH_PATH = withBasePath("/apple-icon-180.png");

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${APP_NAME} — OKLCH brand color palette generator`,
        template: `%s — ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    applicationName: APP_NAME,
    keywords: [
        "OKLCH",
        "color palette generator",
        "shade generator",
        "brand colors",
        "Tailwind CSS v4",
        "design tokens",
        "perceptual color",
        "gamut mapping",
        "Display P3",
        "sRGB",
        "CSS custom properties",
        "color system",
        "design system colors",
        "free color tool",
    ],
    authors: [
        { name: "Jeff Alldridge", url: "https://tentstudios.com" },
        { name: "Tent Studios", url: "https://tentstudios.com" },
    ],
    creator: "Jeff Alldridge / Tent Studios, LLC",
    publisher: "Tent Studios, LLC",
    alternates: {
        canonical: CANONICAL_URL,
    },
    icons: {
        icon: [
            { url: FAVICON_32_PATH, sizes: "32x32", type: "image/png" },
            { url: FAVICON_192_PATH, sizes: "192x192", type: "image/png" },
        ],
        apple: [{ url: APPLE_TOUCH_PATH, sizes: "180x180", type: "image/png" }],
    },
    manifest: withBasePath("/manifest.webmanifest"),
    openGraph: {
        type: "website",
        title: APP_NAME,
        description: APP_DESCRIPTION,
        siteName: APP_NAME,
        url: CANONICAL_URL,
        locale: "en_US",
        images: [
            {
                url: OG_IMAGE_PATH,
                width: 1200,
                height: 630,
                alt: "Brand Color Explorer — OKLCH shade generator",
                type: "image/png",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: APP_NAME,
        description: APP_DESCRIPTION,
        images: [OG_IMAGE_PATH],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: APP_NAME,
    },
    formatDetection: {
        telephone: false,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    category: "design",
};

export const viewport: Viewport = {
    themeColor: "#1a1a1a",
    colorScheme: "dark light",
};

const ABSOLUTE_OG_IMAGE = `${SITE_URL}${OG_IMAGE_PATH}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    alternateName: "Brand Color System",
    description: APP_DESCRIPTION,
    url: CANONICAL_URL,
    applicationCategory: "DesignApplication",
    applicationSubCategory: "ColorTool",
    operatingSystem: "Any (browser)",
    browserRequirements:
        "Requires a modern browser with CSS Color Level 4 support: Safari 16.4+, Chrome 111+, or Firefox 113+.",
    softwareVersion: "0.1.0",
    image: ABSOLUTE_OG_IMAGE,
    screenshot: ABSOLUTE_OG_IMAGE,
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
    },
    license: `${SITE_URL}${BASE_PATH}/`,
    featureList: [
        "OKLCH-based shade family generation",
        "Per-color hue, chroma, and lightness adjustments",
        "Drag-and-drop reordering of brand colors and shade rows",
        "sRGB and Display P3 gamut switching with auto-detection",
        "WCAG contrast ratios against white and black",
        "Imports CSS, Tailwind v4 @theme, plain hex, and W3C Design Tokens (DTCG) JSON",
        "Exports CSS custom properties, Tailwind v4 @theme, DTCG JSON, Adobe ASE, and Adobe ACO",
        "localStorage palette persistence",
        "100% client-side, no telemetry, no accounts",
    ],
    author: {
        "@type": "Person",
        name: "Jeff Alldridge",
        url: "https://tentstudios.com",
    },
    publisher: {
        "@type": "Organization",
        name: "Tent Studios, LLC",
        url: "https://tentstudios.com",
    },
    creator: {
        "@type": "Organization",
        name: "Tent Studios, LLC",
        url: "https://tentstudios.com",
        founder: { "@type": "Person", name: "Jeff Alldridge" },
    },
    sourceOrganization: {
        "@type": "Organization",
        name: "Tent Studios, LLC",
        url: "https://tentstudios.com",
    },
    codeRepository: "https://github.com/jeffalldridge/brand-color-system",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
