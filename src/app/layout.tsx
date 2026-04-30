import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
    APP_DESCRIPTION,
    APP_NAME,
    CANONICAL_URL,
    SITE_URL,
} from "@/lib/site";

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
    title: APP_NAME,
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
    icons: {
        icon: [
            { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
        apple: [{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
        type: "website",
        title: APP_NAME,
        description: APP_DESCRIPTION,
        siteName: APP_NAME,
        url: CANONICAL_URL,
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Brand Color Explorer — OKLCH shade generator",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: APP_NAME,
        description: APP_DESCRIPTION,
        images: ["/og-image.png"],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: APP_NAME,
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: "#1a1a1a",
    colorScheme: "dark light",
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: CANONICAL_URL,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
        "@type": "Organization",
        name: "Tent Studios, LLC",
        url: "https://tentstudios.com",
        founder: { "@type": "Person", name: "Jeff Alldridge" },
    },
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
