import { oklchToHex, hexToOklch, cssColorToHex } from "./color-conversions";

export interface ParsedColor {
  name: string;
  hex: string;
}

export interface ParseResult {
  colors: ParsedColor[];
  format: "hex" | "css" | "tailwind" | "tokens";
  truncated: boolean;
  error?: string;
}

const MAX_COLORS = 12;

type Format = ParseResult["format"];

function detectFormat(text: string): Format {
  // Try JSON first
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed);
      const keys = Object.keys(obj);
      for (const key of keys) {
        const val = obj[key];
        if (val && typeof val === "object" && !Array.isArray(val)) {
          // Flat tokens: top-level key has $value directly
          if ("$value" in val && typeof val.$value === "string") {
            return "tokens";
          }
          // Nested tokens: sub-keys have $value
          const subKeys = Object.keys(val);
          for (const sk of subKeys) {
            if (
              val[sk] &&
              typeof val[sk] === "object" &&
              "$value" in val[sk]
            ) {
              return "tokens";
            }
          }
        }
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Check for oklch() values → Tailwind
  if (/oklch\s*\(/i.test(text)) {
    return "tailwind";
  }

  // Check for CSS custom properties with any value (hex, rgb, hsl, etc.)
  if (/--[\w-]+\s*:\s*[^;}\n]+/i.test(text)) {
    return "css";
  }

  // Fallback: hex list
  return "hex";
}

/** Titlecase a slug: "dark-blue" → "Dark Blue", "yellow" → "Yellow" */
function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Extract family and step from a CSS variable name.
 * "--color-c-yellow-500" → { family: "c-yellow", step: 500 }
 * "--primary" → null (no step number)
 */
function extractFamilyAndStep(varName: string): {
  family: string;
  step: number;
} | null {
  // Remove leading -- and optional "color-" prefix (Tailwind uses --color-)
  const cleaned = varName.replace(/^--/, "").replace(/^color-/, "");

  // Match trailing number as the step
  const stepMatch = cleaned.match(/-(\d+)$/);
  if (!stepMatch) return null;

  const step = parseInt(stepMatch[1], 10);
  const family = cleaned.replace(/-\d+$/, "");

  return { family, step };
}

/**
 * Strip common single-letter or short prefixes from family names.
 * "c-yellow" → "yellow", "brand-blue" → "blue", "color-red" → "red"
 * But preserve multi-word names: "dark-blue" stays "dark-blue"
 */
function cleanFamilySlug(slug: string): string {
  return slug
    .replace(/^(c|color|brand|clr|col)-/, "")
    .replace(/^(tw|css)-/, "");
}

/**
 * Try to resolve a CSS value string to a 6-digit hex color.
 * Handles #hex, rgb(), hsl(), oklch(), named colors via culori.
 */
function resolveToHex(value: string): string | null {
  const trimmed = value.trim().replace(/;$/, "").trim();

  // Try direct hex match first (fastest path)
  const hexMatch = trimmed.match(/^(#[0-9a-fA-F]{3,8})\b/);
  if (hexMatch) {
    const hex = hexMatch[1].toLowerCase();
    const digits = hex.slice(1);
    if ([3, 4, 6, 8].includes(digits.length)) {
      // Normalize shorthand to 6-digit
      if (digits.length === 3) {
        return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
      }
      if (digits.length === 4) {
        return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
      }
      return hex.slice(0, 7); // Strip alpha from 8-digit
    }
  }

  // Fall through to culori's universal parser (handles rgb, hsl, oklch, named, etc.)
  return cssColorToHex(trimmed);
}

// ────────────────────────────────────────────
// Format parsers
// ────────────────────────────────────────────

function parseHexList(text: string): ParsedColor[] {
  const colors: ParsedColor[] = [];
  const seen = new Set<string>();

  // Pass 1: Extract #hex values
  const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
  const hexMatches = text.match(hexPattern) || [];

  for (const raw of hexMatches) {
    const hex = resolveToHex(raw);
    if (!hex) continue;
    if (seen.has(hex)) continue;

    const oklch = hexToOklch(hex);
    if (!oklch) continue;

    seen.add(hex);
    colors.push({ name: `Color ${colors.length + 1}`, hex });
  }

  // Pass 2: Extract rgb(), hsl(), oklch() functional notation
  const funcPattern = /(?:rgb|hsl|oklch)a?\s*\([^)]+\)/gi;
  const funcMatches = text.match(funcPattern) || [];

  for (const raw of funcMatches) {
    const hex = resolveToHex(raw);
    if (!hex) continue;
    if (seen.has(hex)) continue;

    const oklch = hexToOklch(hex);
    if (!oklch) continue;

    seen.add(hex);
    colors.push({ name: `Color ${colors.length + 1}`, hex });
  }

  return colors;
}

function parseCssVars(text: string): ParsedColor[] {
  // Match any CSS custom property: --name: value
  const varPattern = /--([\w-]+)\s*:\s*([^;}\n]+)/g;

  // Collect all parsed vars
  const familyMap = new Map<string, { step: number; hex: string }[]>();
  const standalone: { varName: string; hex: string }[] = [];

  let match;
  while ((match = varPattern.exec(text)) !== null) {
    const varName = match[1];
    const rawValue = match[2].trim();

    // Resolve value to hex (handles #hex, rgb(), hsl(), oklch(), etc.)
    const hex = resolveToHex(rawValue);
    if (!hex) continue;

    // Validate
    const oklch = hexToOklch(hex);
    if (!oklch) continue;

    // Check if it has a family + step number
    const familyStep = extractFamilyAndStep(`--${varName}`);

    if (familyStep) {
      const { family, step } = familyStep;
      if (!familyMap.has(family)) familyMap.set(family, []);
      familyMap.get(family)!.push({ step, hex });
    } else {
      // Standalone var without step number (--primary, --brand-red, etc.)
      standalone.push({ varName, hex });
    }
  }

  const colors: ParsedColor[] = [];

  // Process families: pick step closest to 500
  for (const [slug, steps] of familyMap) {
    const best = pickBestStep(steps);
    if (!best) continue;

    const name = titleCase(cleanFamilySlug(slug));
    colors.push({ name, hex: best.hex.toLowerCase() });
  }

  // Process standalone vars: use the variable name directly
  for (const { varName, hex } of standalone) {
    // Clean up the variable name for display
    const cleaned = varName
      .replace(/^(color-|c-|brand-|clr-|col-)/, "")
      .replace(/^(tw-|css-)/, "");
    const name = titleCase(cleaned);
    colors.push({ name, hex: hex.toLowerCase() });
  }

  return colors;
}

function parseTailwindTheme(text: string): ParsedColor[] {
  // Match: --name-step: oklch(L C H); — handles both decimal (0.657) and percent (65.7%) lightness
  const varPattern =
    /--([\w-]+)\s*:\s*oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*\)/g;

  // Group by family
  const familyMap = new Map<
    string,
    { step: number; l: number; c: number; h: number }[]
  >();
  const standalone: { varName: string; l: number; c: number; h: number }[] = [];

  let match;
  while ((match = varPattern.exec(text)) !== null) {
    const varName = match[1];
    // Parse L — handle percent syntax (65.7% → 0.657) or decimal (0.657)
    let l = parseFloat(match[2]);
    if (match[2].endsWith("%")) {
      l = l / 100;
    }
    const c = parseFloat(match[3]);
    const h = parseFloat(match[4]);

    if (isNaN(l) || isNaN(c) || isNaN(h)) continue;

    // Check if it has a family + step number
    const familyStep = extractFamilyAndStep(`--${varName}`);

    if (familyStep) {
      const { family, step } = familyStep;
      if (!familyMap.has(family)) familyMap.set(family, []);
      familyMap.get(family)!.push({ step, l, c, h });
    } else {
      // Standalone oklch var without step number
      standalone.push({ varName, l, c, h });
    }
  }

  const colors: ParsedColor[] = [];

  // Process families: use C and H from any step, set L=0.5 for source
  for (const [slug, steps] of familyMap) {
    if (steps.length === 0) continue;
    const { c, h } = steps[0];
    const hex = oklchToHex(0.5, c, h);
    const name = titleCase(cleanFamilySlug(slug));
    colors.push({ name, hex });
  }

  // Process standalone oklch vars
  for (const { varName, l, c, h } of standalone) {
    const hex = oklchToHex(l, c, h);
    const cleaned = varName
      .replace(/^(color-|c-|brand-|clr-|col-)/, "")
      .replace(/^(tw-|css-)/, "");
    const name = titleCase(cleaned);
    colors.push({ name, hex });
  }

  return colors;
}

function parseDesignTokens(text: string): ParsedColor[] {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(text.trim());
  } catch {
    return [];
  }

  const colors: ParsedColor[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const family = value as Record<string, unknown>;

    // Case 1: Flat token — top-level key has $value directly
    // e.g. { "primary": { "$value": "#e11d48", "$type": "color" } }
    if ("$value" in family && typeof family.$value === "string") {
      const hex = resolveToHex(family.$value);
      if (!hex) continue;
      const oklch = hexToOklch(hex);
      if (!oklch) continue;
      const name = titleCase(cleanFamilySlug(key));
      colors.push({ name, hex: hex.toLowerCase() });
      continue;
    }

    // Case 2: Nested token — sub-keys are step numbers with $value
    // e.g. { "c-yellow": { "500": { "$value": "#984d00" }, ... } }
    const stepEntries: { step: number; hex: string }[] = [];
    for (const [stepKey, stepVal] of Object.entries(family)) {
      if (stepKey.startsWith("$")) continue; // skip $type, $description
      const step = parseInt(stepKey, 10);
      if (isNaN(step)) continue;
      if (
        stepVal &&
        typeof stepVal === "object" &&
        "$value" in (stepVal as Record<string, unknown>)
      ) {
        const rawHex = (stepVal as Record<string, unknown>).$value;
        if (typeof rawHex === "string") {
          const hex = resolveToHex(rawHex);
          if (hex) stepEntries.push({ step, hex });
        }
      }
    }

    const best = pickBestStep(stepEntries);
    if (!best) continue;

    const oklch = hexToOklch(best.hex);
    if (!oklch) continue;

    const name = titleCase(cleanFamilySlug(key));
    colors.push({ name, hex: best.hex.toLowerCase() });
  }

  return colors;
}

/** From a list of { step, ... } entries, pick the one closest to step 500 */
function pickBestStep<T extends { step: number }>(entries: T[]): T | null {
  if (entries.length === 0) return null;
  let best = entries[0];
  let bestDist = Math.abs(best.step - 500);
  for (const entry of entries) {
    const dist = Math.abs(entry.step - 500);
    if (dist < bestDist) {
      best = entry;
      bestDist = dist;
    }
  }
  return best;
}

// ────────────────────────────────────────────
// Error message helpers
// ────────────────────────────────────────────

function buildErrorMessage(text: string, format: Format): string {
  // Detect what the user might have been trying to paste
  const hints: string[] = [];

  if (/\b(red|blue|green|orange|purple|pink|yellow|cyan|white|black)\b/i.test(text) && !/#|rgb|hsl/.test(text)) {
    hints.push("CSS named colors (\"red\", \"blue\") aren't supported — use hex (#ff0000) or rgb() values.");
  }

  if (/\$[\w-]+\s*:/.test(text)) {
    hints.push("SCSS/Sass variables detected — the hex values were extracted but names were lost. Try CSS custom properties (--name: #hex) instead.");
  }

  if (format === "css" && !/\d+/.test(text.replace(/#[0-9a-fA-F]+/g, ""))) {
    // CSS vars detected but no step numbers and parsing failed
    hints.push("CSS variables need a color value (hex, rgb, hsl). Check that each variable has a valid value.");
  }

  if (hints.length > 0) {
    return hints[0];
  }

  return "No valid colors found. Supported formats: hex values (#ff6600), CSS variables (--name: #hex), rgb()/hsl() values, Tailwind @theme (oklch), or design tokens JSON.";
}

// ────────────────────────────────────────────
// Main entry point
// ────────────────────────────────────────────

export function parseImportText(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { colors: [], format: "hex", truncated: false, error: undefined };
  }

  const format = detectFormat(trimmed);
  let colors: ParsedColor[];

  switch (format) {
    case "tokens":
      colors = parseDesignTokens(trimmed);
      break;
    case "tailwind":
      colors = parseTailwindTheme(trimmed);
      break;
    case "css":
      colors = parseCssVars(trimmed);
      break;
    case "hex":
    default:
      colors = parseHexList(trimmed);
      break;
  }

  if (colors.length === 0) {
    return {
      colors: [],
      format,
      truncated: false,
      error: buildErrorMessage(trimmed, format),
    };
  }

  const truncated = colors.length > MAX_COLORS;
  if (truncated) {
    colors = colors.slice(0, MAX_COLORS);
  }

  return { colors, format, truncated };
}
