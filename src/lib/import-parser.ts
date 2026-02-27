import { oklchToHex, hexToOklch } from "./color-conversions";

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
      // Check if it looks like design tokens (nested objects with $value)
      const keys = Object.keys(obj);
      for (const key of keys) {
        const val = obj[key];
        if (val && typeof val === "object" && !Array.isArray(val)) {
          // Check for $value in sub-keys or direct $value
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

  // Check for CSS custom properties with hex values
  if (/--[\w-]+\s*:\s*#[0-9a-fA-F]{3,8}/i.test(text)) {
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
 * Clean a CSS variable name into a human-readable color name.
 * Strips common prefixes and the step number suffix.
 * "--color-c-yellow-500" → "yellow"
 * "--c-tone-200" → "tone"
 * "--brand-dark-blue-500" → "dark-blue"
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
  // Strip known prefixes
  return slug
    .replace(/^(c|color|brand|clr|col)-/, "")
    .replace(/^(tw|css)-/, "");
}

// ────────────────────────────────────────────
// Format parsers
// ────────────────────────────────────────────

function parseHexList(text: string): ParsedColor[] {
  const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
  const matches = text.match(hexPattern) || [];

  // Deduplicate and validate
  const seen = new Set<string>();
  const colors: ParsedColor[] = [];

  for (const raw of matches) {
    const hex = raw.toLowerCase();
    // Only accept 3, 4, 6, or 8 digit hex (standard CSS hex lengths)
    const digits = hex.slice(1);
    if (![3, 4, 6, 8].includes(digits.length)) continue;

    // Normalize shorthand to 6-digit
    let normalized = hex;
    if (digits.length === 3) {
      normalized = `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
    }

    if (seen.has(normalized)) continue;

    // Validate with culori
    const oklch = hexToOklch(normalized);
    if (!oklch) continue;

    seen.add(normalized);
    colors.push({
      name: `Color ${colors.length + 1}`,
      hex: normalized,
    });
  }

  return colors;
}

function parseCssVars(text: string): ParsedColor[] {
  // Match: --name-step: #hex;
  const varPattern = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g;

  // Group by family
  const families = new Map<string, { step: number; hex: string }[]>();

  let match;
  while ((match = varPattern.exec(text)) !== null) {
    const parsed = extractFamilyAndStep(`--${match[1]}`);
    if (!parsed) continue;

    const { family, step } = parsed;
    if (!families.has(family)) families.set(family, []);
    families.get(family)!.push({ step, hex: match[2] });
  }

  // For each family, pick step 500 (or closest)
  const colors: ParsedColor[] = [];
  for (const [slug, steps] of families) {
    const best = pickBestStep(steps);
    if (!best) continue;

    // Validate hex
    const oklch = hexToOklch(best.hex);
    if (!oklch) continue;

    const name = titleCase(cleanFamilySlug(slug));
    colors.push({ name, hex: best.hex.toLowerCase() });
  }

  return colors;
}

function parseTailwindTheme(text: string): ParsedColor[] {
  // Match: --color-name-step: oklch(L C H);
  const varPattern =
    /--([\w-]+)\s*:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;

  // Group by family — collect C and H (they're constant per family)
  const families = new Map<
    string,
    { step: number; l: number; c: number; h: number }[]
  >();

  let match;
  while ((match = varPattern.exec(text)) !== null) {
    const parsed = extractFamilyAndStep(`--${match[1]}`);
    if (!parsed) continue;

    const { family, step } = parsed;
    const l = parseFloat(match[2]);
    const c = parseFloat(match[3]);
    const h = parseFloat(match[4]);

    if (isNaN(l) || isNaN(c) || isNaN(h)) continue;

    if (!families.has(family)) families.set(family, []);
    families.get(family)!.push({ step, l, c, h });
  }

  // For each family, use C and H from any step (they're constant), set L=0.5 for the source
  const colors: ParsedColor[] = [];
  for (const [slug, steps] of families) {
    if (steps.length === 0) continue;

    // Use C and H from the first entry (they're the same across all steps)
    const { c, h } = steps[0];
    const hex = oklchToHex(0.5, c, h);

    const name = titleCase(cleanFamilySlug(slug));
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

    // Skip metadata keys
    if ("$value" in family && typeof family.$value === "string") continue;

    // Find the 500 step, or closest to 500
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
        const hex = (stepVal as Record<string, unknown>).$value;
        if (typeof hex === "string") {
          stepEntries.push({ step, hex });
        }
      }
    }

    const best = pickBestStep(stepEntries);
    if (!best) continue;

    // Validate hex
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
      error: "No valid colors found. Try pasting hex values, CSS variables, Tailwind @theme, or design tokens JSON.",
    };
  }

  const truncated = colors.length > MAX_COLORS;
  if (truncated) {
    colors = colors.slice(0, MAX_COLORS);
  }

  return { colors, format, truncated };
}
