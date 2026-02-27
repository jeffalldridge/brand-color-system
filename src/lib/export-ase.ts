import type { ShadeFamily } from "./types";

// Converts a hex string to an array of 3 RGB values, scaled [0,1]
function hexToRgb01(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");

  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  return [r, g, b];
}

// Write a UTF-16 BE string to the DataView and return the new offset
// ASE strings: uint16 length (including null terminator), then UTF-16 BE chars, then 0x0000
function writeString(view: DataView, offset: number, str: string): number {
  const len = str.length;
  view.setUint16(offset, len + 1, false); // false = big-endian
  offset += 2;

  for (let i = 0; i < len; i++) {
    view.setUint16(offset, str.charCodeAt(i), false);
    offset += 2;
  }
  // Null terminator
  view.setUint16(offset, 0, false);
  offset += 2;

  return offset;
}

// Byte length of a writeString() call: 2 (length prefix) + (len+1)*2 (chars + null)
function stringByteLen(str: string): number {
  return 2 + (str.length + 1) * 2;
}

// Build the ASE color name: "BrandName Step" (e.g. "Blue 500")
function aseColorName(family: ShadeFamily, shade: { step: number }): string {
  return `${family.brand.name} ${shade.step}`;
}

export function generateAseFile(families: ShadeFamily[]): ArrayBuffer {
  // Calculate the total size needed for the ArrayBuffer
  let numBlocks = 0;
  let totalDataLength = 0;

  for (const family of families) {
    // Group start block data: string
    numBlocks++;
    totalDataLength += stringByteLen(family.brand.name);

    // Color block data: string + model(4) + 3×float32(12) + type(2)
    for (const shade of family.shades) {
      numBlocks++;
      totalDataLength +=
        stringByteLen(aseColorName(family, shade)) + 4 + 12 + 2;
    }

    // Group end block (no data)
    numBlocks++;
  }

  // ASE Header = 12 bytes (Signature 4 + Version 4 + NumBlocks 4)
  // Each block header = 6 bytes (Type 2 + Length 4)
  const bufferSize = 12 + numBlocks * 6 + totalDataLength;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  let offset = 0;

  // --- HEADER ---
  // Signature "ASEF"
  view.setUint8(offset++, 0x41); // A
  view.setUint8(offset++, 0x53); // S
  view.setUint8(offset++, 0x45); // E
  view.setUint8(offset++, 0x46); // F

  // Version 1.0
  view.setUint16(offset, 1, false);
  offset += 2;
  view.setUint16(offset, 0, false);
  offset += 2;

  // Number of blocks
  view.setUint32(offset, numBlocks, false);
  offset += 4;

  // --- BLOCKS ---
  for (const family of families) {
    // Group Start Block (0xC001)
    view.setUint16(offset, 0xc001, false);
    offset += 2;
    view.setUint32(offset, stringByteLen(family.brand.name), false);
    offset += 4;
    offset = writeString(view, offset, family.brand.name);

    // Color entries
    for (const shade of family.shades) {
      // Color Block (0x0001)
      view.setUint16(offset, 0x0001, false);
      offset += 2;

      const colorName = aseColorName(family, shade);
      const colorDataLength = stringByteLen(colorName) + 4 + 12 + 2;
      view.setUint32(offset, colorDataLength, false);
      offset += 4;

      // Color name
      offset = writeString(view, offset, colorName);

      // Color model "RGB "
      view.setUint8(offset++, 0x52); // R
      view.setUint8(offset++, 0x47); // G
      view.setUint8(offset++, 0x42); // B
      view.setUint8(offset++, 0x20); // space

      // Color values (3 × float32, [0,1])
      const [r, g, b] = hexToRgb01(shade.hex);
      view.setFloat32(offset, r, false);
      offset += 4;
      view.setFloat32(offset, g, false);
      offset += 4;
      view.setFloat32(offset, b, false);
      offset += 4;

      // Color type (0 = Global, 1 = Spot, 2 = Normal)
      view.setUint16(offset, 0, false);
      offset += 2;
    }

    // Group End Block (0xC002)
    view.setUint16(offset, 0xc002, false);
    offset += 2;
    view.setUint32(offset, 0, false);
    offset += 4;
  }

  return buffer;
}
