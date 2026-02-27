import type { BrandColor, RampConfig } from "./types";

export const DEFAULT_BRAND_COLORS: BrandColor[] = [
  {
    id: "blue",
    name: "Blue",
    hex: "#2563eb",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
  {
    id: "purple",
    name: "Purple",
    hex: "#7c3aed",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#0d9488",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
  {
    id: "green",
    name: "Green",
    hex: "#16a34a",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
  {
    id: "orange",
    name: "Orange",
    hex: "#ea580c",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
  {
    id: "rose",
    name: "Rose",
    hex: "#e11d48",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
  {
    id: "tones",
    name: "Tones",
    hex: "#737373",
    hueShift: 0,
    saturationShift: 0,
    lightnessShift: 0,
  },
];

// Standard Tailwind CSS shade steps mapped to OKLCH lightness values.
// step = round(1000 × (1 − L)), so L = 1 − step/1000
export const TAILWIND_STEPS = [
  { step: 950, l: 0.05 },
  { step: 900, l: 0.1 },
  { step: 800, l: 0.2 },
  { step: 700, l: 0.3 },
  { step: 600, l: 0.4 },
  { step: 500, l: 0.5 },
  { step: 400, l: 0.6 },
  { step: 300, l: 0.7 },
  { step: 200, l: 0.8 },
  { step: 100, l: 0.9 },
  { step: 50, l: 0.95 },
];

export const DEFAULT_RAMP_CONFIG: RampConfig = { steps: TAILWIND_STEPS };
