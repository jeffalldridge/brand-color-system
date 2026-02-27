import type { ShadeFamily } from "./types";

/**
 * Generate a W3C Design Tokens (DTCG) JSON file.
 * Compatible with Tokens Studio, Style Dictionary, Figma plugins, Penpot.
 * Exports both hex values and OKLCH components.
 */

interface TokenValue {
  $type: "color";
  $value: string;
  $extensions?: { oklch: { l: number; c: number; h: number } };
}

interface TokenGroup {
  $type?: "color";
  $description?: string;
  [key: string]: TokenValue | TokenGroup | string | undefined;
}

export function generateDesignTokens(families: ShadeFamily[]): string {
  const root: Record<string, TokenGroup> = {};

  for (const family of families) {
    const group: TokenGroup = {
      $type: "color",
      $description: `${family.brand.name} shade family`,
    };

    for (const shade of family.shades) {
      const token: TokenValue = {
        $type: "color",
        $value: shade.hex.toLowerCase(),
        $extensions: {
          oklch: {
            l: Math.round(shade.oklch.l * 1000) / 1000,
            c: Math.round(shade.oklch.c * 1000) / 1000,
            h: Math.round(shade.oklch.h * 10) / 10,
          },
        },
      };
      group[String(shade.step)] = token;
    }

    // Use a CSS-safe key: lowercase, hyphens for spaces
    const key = family.brand.name.toLowerCase().replace(/\s+/g, "-");
    root[key] = group;
  }

  return JSON.stringify(root, null, 2) + "\n";
}
