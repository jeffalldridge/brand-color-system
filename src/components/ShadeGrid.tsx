'use client';

import type { GamutTarget, ShadeFamily, TextOverlay, RampConfig } from '@/lib/types';
import { sortedSteps } from '@/lib/lightness-ramp';
import ColorSwatch from './ColorSwatch';

interface ShadeGridProps {
  families: ShadeFamily[];
  textOverlay: TextOverlay;
  bgIsLight: boolean;
  rampConfig: RampConfig;
  showNearestOutline: boolean;
  showSwatchText: boolean;
  compactView: boolean;
  gamutTarget: GamutTarget;
}

export default function ShadeGrid({
  families, textOverlay, bgIsLight, rampConfig, showNearestOutline, showSwatchText, compactView, gamutTarget,
}: ShadeGridProps) {

  if (families.length === 0) return null;

  const steps = rampConfig.steps;
  const sorted = sortedSteps(steps);
  const numShades = sorted.length;

  const txt = bgIsLight ? 'text-black/80' : 'text-white/80';
  const txtMuted = bgIsLight ? 'text-black/60' : 'text-white/60';
  const gamutLabel = gamutTarget === 'p3' ? 'P3' : 'sRGB';

  return (
    <div className="pt-4 overflow-x-auto">
      {/* Column header labels */}
      <div className="flex items-end mb-4">
        <div className="w-24 shrink-0 pr-2 flex flex-col gap-2 pb-2">
          <span className={`text-[10px] ${txtMuted} uppercase tracking-wider font-medium`}>Shade</span>
        </div>
        <div
          className="flex-1 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${numShades}, minmax(0, 1fr))` }}
        >
          {sorted.map((s, sortedIdx) => (
            <div key={`${s.step}-${sortedIdx}`} className="flex flex-col items-center px-1">
              <span className={`text-sm font-bold font-mono ${txt} tracking-wide`}>
                {s.step}
              </span>
              <span className={`text-[10px] font-mono mt-1 ${txtMuted}`}>
                {s.l.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gap between header and color rows */}
      <div className="h-4" />

      {/* Color rows */}
      <div className={compactView ? 'relative' : 'space-y-1 relative'}>
        {families.map((family) => (
          <div
            key={family.brand.id}
            className="flex items-stretch group"
          >
            <div className="w-24 shrink-0 flex flex-col justify-center pr-3 py-1">
              <span className={`text-sm font-semibold ${txt} truncate transition-colors ${bgIsLight ? 'group-hover:text-black' : 'group-hover:text-white'}`}>
                {family.brand.name}
              </span>
              <span className={`text-[11px] font-mono tracking-wider ${txtMuted}`}>
                {family.adjustedHex.toUpperCase()}
              </span>
            </div>
            <div
              className={`flex-1 grid ${compactView ? 'gap-0' : 'gap-1'}`}
              style={{ gridTemplateColumns: `repeat(${numShades}, minmax(0, 1fr))` }}
            >
              {family.shades.map((shade) => {
                const isClosest = shade.step === family.closestStep;
                const isExact = isClosest && shade.hex.toLowerCase() === family.adjustedHex.toLowerCase();
                return (
                  <div key={shade.step} className={compactView ? 'overflow-hidden relative' : 'rounded-md overflow-hidden relative'}>
                    <ColorSwatch
                      shade={shade}
                      textOverlay={textOverlay}
                      isClosestToInput={isClosest}
                      isExactInput={isExact}
                      bgIsLight={bgIsLight}
                      showNearestOutline={showNearestOutline}
                      showSwatchText={showSwatchText}
                      gamutLabel={gamutLabel}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
