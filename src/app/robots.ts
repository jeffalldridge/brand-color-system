import type { MetadataRoute } from "next";
import { CANONICAL_URL } from "@/lib/site";

// Required for `output: 'export'` — emits robots.txt at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${CANONICAL_URL}/sitemap.xml`,
    };
}
