import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Brand Color Explorer";
const APP_DESCRIPTION =
  "Generate perceptually uniform shade families from brand colors using OKLCH. Export to CSS custom properties, Tailwind @theme, W3C Design Tokens, ASE, and ACO.";

export const metadata: Metadata = {
  metadataBase: new URL("https://brand-color-system.vercel.app"),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "OKLCH",
    "color palette",
    "shade generator",
    "brand colors",
    "Tailwind CSS",
    "design tokens",
    "perceptual color",
    "gamut mapping",
    "Display P3",
    "sRGB",
  ],
  authors: [{ name: "Jeff Alldridge" }],
  creator: "Jeff Alldridge",
  openGraph: {
    type: "website",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
