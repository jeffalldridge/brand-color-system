'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ShadeFamily, TextOverlay, RampConfig, ShadeStep } from '@/lib/types';
import { sortedSteps, stepFromL } from '@/lib/lightness-ramp';
import { sortFamilies } from '@/lib/color-engine';
import ColorSwatch from './ColorSwatch';

interface ShadeGridProps {
  families: ShadeFamily[];
  textOverlay: TextOverlay;
  bgIsLight: boolean;
  rampConfig: RampConfig;
  showNearestOutline: boolean;
  showSwatchText: boolean;
  compactView: boolean;
  sortByHue: boolean;
  onUpdateStep: (index: number, updates: Partial<ShadeStep>) => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onSortSteps: () => void;
}

export default function ShadeGrid({
  families, textOverlay, bgIsLight, rampConfig, showNearestOutline, showSwatchText, compactView, sortByHue,
  onUpdateStep, onAddStep, onRemoveStep, onSortSteps,
}: ShadeGridProps) {

  // Track which step is being edited (by its real index in rampConfig.steps)
  const [editingRealIndex, setEditingRealIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const sortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track purely local L values during dragging so we don't recalculate global color families on every pixel move
  const [localLValues, setLocalLValues] = useState<Record<number, number>>({});

  // Schedule auto-sort after a pause
  const scheduleSort = useCallback(() => {
    if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
    sortTimerRef.current = setTimeout(() => {
      onSortSteps();
    }, 800);
  }, [onSortSteps]);

  // Clean up pending sort timer on unmount
  useEffect(() => {
    return () => {
      if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
    };
  }, []);

  if (families.length === 0) return null;

  const steps = rampConfig.steps;
  const sorted = sortedSteps(steps);
  const numShades = sorted.length;

  const txt = bgIsLight ? 'text-black/80' : 'text-white/80';
  const txtMuted = bgIsLight ? 'text-black/60' : 'text-white/60';
  const btnClass = bgIsLight
    ? 'border-black/30 text-black/70 hover:text-black hover:bg-black/5'
    : 'border-white/40 text-white/70 hover:text-white hover:bg-white/10';

  // Identify the hero color's locked step
  const lockedFamily = families.find(f => f.brand.locked);
  const lockedStep = lockedFamily?.closestStep ?? null;

  // Filter to visible families only for display
  const visibleFamilies = families.filter(f => f.brand.visible !== false);
  const sortedFamilies = sortByHue ? sortFamilies(visibleFamilies) : visibleFamilies;

  const commitLChange = (realIndex: number, stepKey: number, finalL: number) => {
    onUpdateStep(realIndex, { l: finalL, step: stepFromL(finalL) });
    scheduleSort();

    setLocalLValues(prev => {
      const next = { ...prev };
      delete next[stepKey];
      return next;
    });
  };

  const handleStepNameCommit = (realIndex: number, newName: number, nextRealIndex?: number | null) => {
    // Derive L from the new step number so the column moves to the correct position
    const newL = Math.max(0.01, Math.min(0.99, 1 - newName / 1000));
    onUpdateStep(realIndex, { step: newName, l: newL });
    onSortSteps();

    if (nextRealIndex !== undefined && nextRealIndex !== null) {
      // Tab to next/prev step: open its editor
      const nextStep = steps[nextRealIndex];
      if (nextStep) {
        setEditingRealIndex(nextRealIndex);
        setEditValue(String(nextStep.step));
      } else {
        setEditingRealIndex(null);
      }
    } else {
      setEditingRealIndex(null);
    }
  };

  return (
    <div className="pt-4">
      {/* Column header controls */}
      <div className="flex items-end mb-4">
        <div className="w-24 shrink-0 pr-2 flex flex-col gap-2 pb-2">
          <span className={`text-[10px] ${txtMuted} uppercase tracking-wider font-medium`}>Shade</span>
          <button
            onClick={onAddStep}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${btnClass} font-medium`}
            title="Add a new shade column"
          >
            + Add
          </button>
        </div>
        <div
          className="flex-1 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${numShades}, minmax(0, 1fr))` }}
        >
          {sorted.map((s, sortedIdx) => {
            const isLocked = s.step === lockedStep;
            const realIndex = steps.findIndex(orig => orig.step === s.step && orig.l === s.l);
            const displayL = localLValues[sortedIdx] !== undefined ? localLValues[sortedIdx] : s.l;

            // Find next/prev editable (non-locked) column indices for Tab navigation
            const getAdjacentEditableIndex = (direction: 1 | -1): number | null => {
              for (let i = sortedIdx + direction; i >= 0 && i < sorted.length; i += direction) {
                const candidate = sorted[i];
                if (candidate.step !== lockedStep) {
                  return steps.findIndex(orig => orig.step === candidate.step && orig.l === candidate.l);
                }
              }
              return null;
            };

            return (
              <div key={`${s.step}-${sortedIdx}`} className="flex flex-col items-center px-1 group/col relative">
                {/* Editable step number */}
                {editingRealIndex === realIndex && !isLocked ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    value={editValue}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || /^\d+$/.test(v)) setEditValue(v);
                    }}
                    onBlur={() => {
                      // Use a microtask so Tab-triggered blur doesn't race with keyDown setting the next index
                      setTimeout(() => {
                        setEditingRealIndex(prev => {
                          // If keyDown already moved us to a new index, don't reset
                          if (prev !== realIndex) return prev;
                          const val = parseInt(editValue);
                          if (!isNaN(val) && val > 0 && val <= 1000) {
                            const newL = Math.max(0.01, Math.min(0.99, 1 - val / 1000));
                            onUpdateStep(realIndex, { step: val, l: newL });
                            onSortSteps();
                          }
                          return null;
                        });
                      }, 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        const val = parseInt(editValue);
                        const nextIdx = getAdjacentEditableIndex(e.shiftKey ? -1 : 1);
                        if (!isNaN(val) && val > 0 && val <= 1000) {
                          handleStepNameCommit(realIndex, val, nextIdx);
                        } else if (nextIdx !== null) {
                          // Invalid value — discard edit but still move
                          const nextStep = steps[nextIdx];
                          if (nextStep) {
                            setEditingRealIndex(nextIdx);
                            setEditValue(String(nextStep.step));
                          }
                        } else {
                          setEditingRealIndex(null);
                        }
                      } else if (e.key === 'Enter') {
                        const val = parseInt(editValue);
                        if (!isNaN(val) && val > 0 && val <= 1000) {
                          handleStepNameCommit(realIndex, val);
                        } else {
                          setEditingRealIndex(null);
                        }
                      } else if (e.key === 'Escape') {
                        setEditingRealIndex(null);
                      }
                    }}
                    className={`w-16 text-center text-sm font-bold font-mono rounded-md border-2 px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${bgIsLight ? 'bg-white border-black/30 text-black' : 'bg-black/40 border-white/40 text-white'
                      }`}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 min-h-[32px] justify-end">
                    <button
                      onClick={() => { if (!isLocked) { setEditingRealIndex(realIndex); setEditValue(String(s.step)); } }}
                      className={`text-sm font-bold font-mono ${txt} ${isLocked ? 'cursor-default' : `cursor-text rounded-md px-2 py-0.5 -mx-2 transition-colors ${bgIsLight ? 'hover:bg-black/10' : 'hover:bg-white/10'}`} tracking-wide`}
                      title={isLocked ? 'Hero step' : 'Click to edit step number'}
                    >
                      {s.step}
                    </button>
                  </div>
                )}

                {/* L value display */}
                <span className={`text-[10px] font-mono mt-1 ${txtMuted}`}>
                  {displayL.toFixed(2)}
                </span>

                {/* L slider */}
                <input
                  type="range"
                  min={5}
                  max={99}
                  step={0.5}
                  value={displayL * 100}
                  onChange={(e) => {
                    if (!isLocked) {
                      setLocalLValues(prev => ({ ...prev, [sortedIdx]: Number(e.target.value) / 100 }));
                    }
                  }}
                  onPointerUp={() => {
                    if (!isLocked && localLValues[sortedIdx] !== undefined) {
                      commitLChange(realIndex, sortedIdx, localLValues[sortedIdx]);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full mt-2 custom-range ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                  style={{
                    '--slider-track': bgIsLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                    '--slider-color': bgIsLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
                  } as React.CSSProperties}
                />

                {/* Remove / Hero label */}
                <div className="h-5 mt-4 flex items-center justify-center">
                  {isLocked ? (
                    <span
                      className="text-[8px] uppercase tracking-wider font-bold px-1 py-0.5 rounded border"
                      style={{
                        color: lockedFamily?.adjustedHex,
                        backgroundColor: `${lockedFamily?.adjustedHex}15`,
                        borderColor: `${lockedFamily?.adjustedHex}30`,
                      }}
                    >
                      Hero
                    </span>
                  ) : numShades > 2 ? (
                    <span className="opacity-0 group-hover/col:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRemoveStep(realIndex)}
                        className={`text-[9px] uppercase tracking-wider font-bold text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded transition-colors`}
                        title="Remove this shade"
                      >
                        Remove
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap between header and color rows */}
      <div className="h-4" />

      {/* Color rows */}
      <div className={compactView ? 'relative' : 'space-y-1 relative'}>
        {sortedFamilies.map((family) => (
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
