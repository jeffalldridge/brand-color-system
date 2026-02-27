import {
  hexToOklch,
  oklchToHex,
  oklchToRgbString,
  oklchToHslString,
  oklchToCssString,
  oklchToRgbValues,
  isInGamut,
} from "./color-conversions";
import { generateLightnessRamp } from "./lightness-ramp";
import { relativeLuminance, contrastRatio } from "./contrast";
import type {
  BrandColor,
  GamutTarget,
  OklchColor,
  RampConfig,
  Shade,
  ShadeFamily,
} from "./types";

function applyAdjustments(base: OklchColor, brand: BrandColor): OklchColor {
  const h = (base.h + brand.hueShift + 360) % 360;
  // Chroma: multiplicative when base has chroma, additive fallback for achromatic inputs
  // so grayscale colors can gain saturation via the slider
  const shift = brand.saturationShift / 100;
  const c =
    base.c > 0.005
      ? Math.max(0, base.c * (1 + shift))
      : Math.max(0, shift * 0.15); // additive: ±100% maps to ±0.15 chroma
  const l = Math.max(0, Math.min(1, base.l + brand.lightnessShift));
  return { l, c, h };
}

export function generateShadeFamily(
  brand: BrandColor,
  ramp: Map<number, number>,
  gamut: GamutTarget = "srgb",
): ShadeFamily | null {
  const baseOklch = hexToOklch(brand.hex);
  if (!baseOklch) return null;

  const adjusted = applyAdjustments(baseOklch, brand);
  const adjustedHex = oklchToHex(adjusted.l, adjusted.c, adjusted.h, gamut);
  const shades: Shade[] = [];

  for (const [step, targetL] of ramp) {
    const l = targetL;
    const c = adjusted.c;
    const h = adjusted.h;

    const hex = oklchToHex(l, c, h, gamut);
    const rgb = oklchToRgbString(l, c, h, gamut);
    const hsl = oklchToHslString(l, c, h, gamut);
    const oklchCss = oklchToCssString(l, c, h);
    const inGamut = isInGamut(l, c, h, gamut);

    const rgbVals = oklchToRgbValues(l, c, h, gamut);
    const lum = relativeLuminance(rgbVals.r, rgbVals.g, rgbVals.b);
    const contrastOnWhite = contrastRatio(1, lum);
    const contrastOnBlack = contrastRatio(lum, 0);

    shades.push({
      step,
      oklch: { l, c, h },
      hex,
      rgb,
      hsl,
      oklchCss,
      contrastOnWhite,
      contrastOnBlack,
      inGamut,
    });
  }

  // Sort by L ascending (dark first → light last) for left-to-right display
  shades.sort((a, b) => a.oklch.l - b.oklch.l);

  // Find the shade step closest to the adjusted input color (accounts for hue/chroma/lightness shifts)
  let closestStep = shades[0].step;
  let closestDist = Infinity;
  for (const shade of shades) {
    // Perceptual distance in OKLCH: weight L heavily, include chroma and hue
    const dL = shade.oklch.l - adjusted.l;
    const dC = shade.oklch.c - adjusted.c;
    const dH = ((shade.oklch.h - adjusted.h + 540) % 360) - 180; // shortest arc
    const dist = Math.sqrt(dL * dL + dC * dC + (dH / 360) * (dH / 360));
    if (dist < closestDist) {
      closestDist = dist;
      closestStep = shade.step;
    }
  }

  return {
    brand,
    baseOklch,
    adjustedOklch: adjusted,
    adjustedHex,
    shades,
    closestStep,
  };
}

export function generateAllFamilies(
  brandColors: BrandColor[],
  rampConfig: RampConfig,
  gamut: GamutTarget = "srgb",
): ShadeFamily[] {
  const ramp = generateLightnessRamp(rampConfig);

  return brandColors
    .map((bc) => generateShadeFamily(bc, ramp, gamut))
    .filter((f): f is ShadeFamily => f !== null);
}

/** Sort families by hue ascending. */
export function sortFamilies(families: ShadeFamily[]): ShadeFamily[] {
  return [...families].sort((a, b) => a.adjustedOklch.h - b.adjustedOklch.h);
}
