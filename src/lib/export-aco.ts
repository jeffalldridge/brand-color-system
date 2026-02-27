import type { ShadeFamily } from './types';

/**
 * Generate an ACO (Adobe Color Swatch) file.
 * Writes both Version 1 (unnamed, backward-compatible) and Version 2 (named).
 * Compatible with Photoshop, GIMP, Krita, Affinity Photo.
 */

function hexToRgb256(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  // ACO RGB uses 0-65535 range (multiply 0-255 by 256, not 257)
  const r = parseInt(h.substring(0, 2), 16) * 256;
  const g = parseInt(h.substring(2, 4), 16) * 256;
  const b = parseInt(h.substring(4, 6), 16) * 256;
  return [r, g, b];
}

// Build the ACO color name: "BrandName Step" (e.g. "Blue 500")
function acoColorName(family: ShadeFamily, shade: { step: number }): string {
  return `${family.brand.name} ${shade.step}`;
}

export function generateAcoFile(families: ShadeFamily[]): ArrayBuffer {
  // Collect all colors in order
  const entries: { name: string; r: number; g: number; b: number }[] = [];
  for (const family of families) {
    for (const shade of family.shades) {
      const [r, g, b] = hexToRgb256(shade.hex);
      entries.push({ name: acoColorName(family, shade), r, g, b });
    }
  }

  const count = entries.length;

  // V1: 4 bytes header + 10 bytes per color
  const v1Size = 4 + count * 10;

  // V2: 4 bytes header + (10 + 4 + (name.length+1)*2) bytes per color
  let v2Size = 4;
  for (const e of entries) {
    v2Size += 10 + 4 + (e.name.length + 1) * 2;
  }

  const buffer = new ArrayBuffer(v1Size + v2Size);
  const view = new DataView(buffer);
  let offset = 0;

  // --- Version 1 ---
  view.setUint16(offset, 1, false); offset += 2; // version
  view.setUint16(offset, count, false); offset += 2; // count

  for (const e of entries) {
    view.setUint16(offset, 0, false); offset += 2; // color space: 0 = RGB
    view.setUint16(offset, e.r, false); offset += 2;
    view.setUint16(offset, e.g, false); offset += 2;
    view.setUint16(offset, e.b, false); offset += 2;
    view.setUint16(offset, 0, false); offset += 2; // padding (z)
  }

  // --- Version 2 ---
  view.setUint16(offset, 2, false); offset += 2; // version
  view.setUint16(offset, count, false); offset += 2; // count

  for (const e of entries) {
    view.setUint16(offset, 0, false); offset += 2; // color space: 0 = RGB
    view.setUint16(offset, e.r, false); offset += 2;
    view.setUint16(offset, e.g, false); offset += 2;
    view.setUint16(offset, e.b, false); offset += 2;
    view.setUint16(offset, 0, false); offset += 2; // padding (z)

    // V2 extra: 2 bytes padding + 2 bytes name length + UTF-16 BE name + null
    view.setUint16(offset, 0, false); offset += 2; // padding
    view.setUint16(offset, e.name.length + 1, false); offset += 2; // name length (incl. null)
    for (let i = 0; i < e.name.length; i++) {
      view.setUint16(offset, e.name.charCodeAt(i), false); offset += 2;
    }
    view.setUint16(offset, 0, false); offset += 2; // null terminator
  }

  return buffer;
}
