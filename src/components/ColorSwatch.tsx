'use client';

import { memo } from 'react';
import type { Shade, TextOverlay } from '@/lib/types';

interface ColorSwatchProps {
  shade: Shade;
  textOverlay: TextOverlay;
  isClosestToInput?: boolean;
  isExactInput?: boolean;
  bgIsLight: boolean;
  showNearestOutline: boolean;
  showSwatchText: boolean;
}

export default memo(function ColorSwatch({ shade, textOverlay, isClosestToInput, isExactInput, bgIsLight, showNearestOutline, showSwatchText }: ColorSwatchProps) {
  const showWhite = textOverlay === 'white' || textOverlay === 'both';
  const showBlack = textOverlay === 'black' || textOverlay === 'both';
  const autoColor = shade.contrastOnBlack > shade.contrastOnWhite ? '#000' : '#fff';

  // INPUT border uses a consistent color tied to page background, not per-swatch contrast
  const inputRingColor = bgIsLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';

  const boxShadow = isClosestToInput && showNearestOutline
    ? `inset 0 0 0 2.5px ${inputRingColor}`
    : undefined;

  return (
    <div
      className="relative px-1.5 py-1.5 min-h-[72px] flex flex-col justify-between text-[10px] leading-tight font-mono"
      style={{
        backgroundColor: shade.hex,
        boxShadow,
      }}
    >
      {showSwatchText && (
        <>
          <div className="flex items-center justify-between gap-0.5">
            <span className="font-bold text-[11px]" style={{ color: autoColor }}>
              {shade.step}
            </span>
            <span className="flex items-center gap-0.5">
              {isClosestToInput && (
                <span
                  className="text-[7px] font-bold tracking-wider opacity-90"
                  style={{ color: autoColor }}
                  title={isExactInput ? 'Exact input color' : 'Closest step to input color'}
                >
                  {isExactInput ? 'INPUT' : 'NEAREST'}
                </span>
              )}
              {!shade.inGamut && (
                <span
                  title="Gamut-mapped to sRGB"
                  className="inline-block w-1.5 h-1.5 rounded-full ml-0.5 opacity-40"
                  style={{ backgroundColor: autoColor }}
                />
              )}
            </span>
          </div>

          <div className="space-y-0.5 flex-1 flex flex-col justify-center">
            {showWhite && (
              <div className="flex justify-between items-center" style={{ color: '#ffffff' }}>
                <span className="text-[10px] opacity-70">Aa</span>
                <span className="font-medium">{shade.contrastOnWhite.toFixed(1)}</span>
              </div>
            )}
            {showBlack && (
              <div className="flex justify-between items-center" style={{ color: '#000000' }}>
                <span className="text-[10px] opacity-70">Aa</span>
                <span className="font-medium">{shade.contrastOnBlack.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="text-[8px] opacity-60 truncate tracking-wide" style={{ color: autoColor }}>
            {shade.hex}
          </div>
        </>
      )}
    </div>
  );
});
