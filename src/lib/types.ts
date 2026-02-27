export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  hueShift: number;
  saturationShift: number;
  lightnessShift: number;
}

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface ShadeStep {
  step: number; // the "name" — e.g. 500, 200, etc.
  l: number; // OKLCH lightness value
}

export interface Shade {
  step: number;
  oklch: OklchColor;
  hex: string;
  rgb: string;
  hsl: string;
  oklchCss: string;
  contrastOnWhite: number;
  contrastOnBlack: number;
  inGamut: boolean;
}

export interface ShadeFamily {
  brand: BrandColor;
  baseOklch: OklchColor;
  adjustedOklch: OklchColor;
  adjustedHex: string;
  shades: Shade[];
  closestStep: number;
}

export type TextOverlay = "white" | "black" | "both";

export type GamutTarget = "srgb" | "p3";

export interface RampConfig {
  steps: ShadeStep[]; // always sorted dark (high step#, low L) → light (low step#, high L)
}
