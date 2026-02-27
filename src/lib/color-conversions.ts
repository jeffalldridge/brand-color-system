import {
  parse,
  converter,
  formatHex,
  formatRgb,
  formatHsl,
  displayable,
  toGamut,
} from "culori";
import type { GamutTarget, OklchColor } from "./types";

const toOklch = converter("oklch");
const toRgbColor = converter("rgb");
const toP3Color = converter("p3");
const gamutMapSrgb = toGamut("rgb", "oklch");
const gamutMapP3 = toGamut("p3", "oklch");

function getGamutMapper(target: GamutTarget) {
  return target === "p3" ? gamutMapP3 : gamutMapSrgb;
}

export function hexToOklch(hex: string): OklchColor | null {
  const parsed = parse(hex);
  if (!parsed) return null;
  const oklch = toOklch(parsed);
  return {
    l: oklch.l,
    c: oklch.c ?? 0,
    h: oklch.h ?? 0,
  };
}

export function oklchToHex(
  l: number,
  c: number,
  h: number,
  gamut: GamutTarget = "srgb",
): string {
  const color = { mode: "oklch" as const, l, c, h };
  const mapped = getGamutMapper(gamut)(color);
  return formatHex(mapped);
}

export function isInGamut(
  l: number,
  c: number,
  h: number,
  gamut: GamutTarget = "srgb",
): boolean {
  const color = { mode: "oklch" as const, l, c, h };
  if (gamut === "p3") {
    // Convert to P3 space and check if all channels are within [0, 1]
    return displayable(toP3Color(color));
  }
  return displayable(color);
}

export function oklchToRgbString(
  l: number,
  c: number,
  h: number,
  gamut: GamutTarget = "srgb",
): string {
  const color = { mode: "oklch" as const, l, c, h };
  const mapped = getGamutMapper(gamut)(color);
  return formatRgb(mapped);
}

export function oklchToHslString(
  l: number,
  c: number,
  h: number,
  gamut: GamutTarget = "srgb",
): string {
  const color = { mode: "oklch" as const, l, c, h };
  const mapped = getGamutMapper(gamut)(color);
  return formatHsl(mapped);
}

export function oklchToCssString(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

export function oklchToRgbValues(
  l: number,
  c: number,
  h: number,
  gamut: GamutTarget = "srgb",
): { r: number; g: number; b: number } {
  const color = { mode: "oklch" as const, l, c, h };
  const mapped = getGamutMapper(gamut)(color);
  const rgb = toRgbColor(mapped);
  return { r: rgb.r, g: rgb.g, b: rgb.b };
}
