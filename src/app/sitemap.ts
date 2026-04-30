import type { MetadataRoute } from "next";
import { CANONICAL_URL } from "@/lib/site";

// Required for `output: 'export'` — emits sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: CANONICAL_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
