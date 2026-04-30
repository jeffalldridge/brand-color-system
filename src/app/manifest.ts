import type { MetadataRoute } from "next";
import {
    APP_DESCRIPTION,
    APP_NAME,
    BASE_PATH,
    withBasePath,
} from "@/lib/site";

// Required for `output: 'export'` — emits manifest.webmanifest at build time.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_NAME,
        short_name: "Colors",
        description: APP_DESCRIPTION,
        start_url: `${BASE_PATH}/`,
        scope: `${BASE_PATH}/`,
        display: "standalone",
        background_color: "#1a1a1a",
        theme_color: "#1a1a1a",
        icons: [
            {
                src: withBasePath("/icon-192.png"),
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: withBasePath("/icon-512.png"),
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: withBasePath("/icon-maskable-192.png"),
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: withBasePath("/icon-maskable-512.png"),
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
