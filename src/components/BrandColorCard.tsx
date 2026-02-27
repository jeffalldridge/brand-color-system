'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { BrandColor, OklchColor } from '@/lib/types';

export interface BrandColorCardProps {
    color: BrandColor;
    index: number;
    bgIsLight: boolean;
    hasAdjustments: boolean;
    adjustedHex: string;
    canRemove: boolean;
    baseOklch: OklchColor | null;
    onColorChange: (index: number, hex: string) => void;
    onNameChange: (index: number, name: string) => void;
    onAdjustmentsChange: (index: number, adjustments: Partial<Pick<BrandColor, 'hueShift' | 'saturationShift' | 'lightnessShift'>>) => void;
    onRemove: (index: number) => void;
}

export default function BrandColorCard({
    color, index, bgIsLight, hasAdjustments, adjustedHex, canRemove, baseOklch,
    onColorChange, onNameChange, onAdjustmentsChange, onRemove,
}: BrandColorCardProps) {
    // Local state for revealing HCL sliders
    const [showAdjustmentsLocal, setShowAdjustmentsLocal] = useState(false);

    // DND Kit hook setup
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: color.id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})` : undefined,
        transition,
        zIndex: isDragging ? 10 : 1,
        boxShadow: isDragging ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : undefined,
        opacity: isDragging ? 0.9 : 1,
    };

    const txtMuted = bgIsLight ? 'text-black/60' : 'text-white/60';
    const txtVal = bgIsLight ? 'text-black/70' : 'text-white/70';
    const cardBg = bgIsLight ? 'bg-white/70 border border-black/[0.12] hover:border-black/25' : 'bg-black/50 border border-white/[0.15] hover:border-white/30';

    // Slider thumb/track colors driven by CSS custom properties (see globals.css .custom-range)
    const sliderVars = {
        '--slider-color': bgIsLight ? '#000' : '#fff',
        '--slider-track': bgIsLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)',
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-xl overflow-hidden transition-[box-shadow,border-color] duration-200 ${cardBg} shadow-sm group`}
        >
            {/* Top Bar - Color display area and drag handle */}
            <div
                className="w-full h-10 relative overflow-hidden flex cursor-grab active:cursor-grabbing group/header"
                {...attributes}
                {...listeners}
            >
                {hasAdjustments ? (
                    <>
                        <div
                            className="h-full flex-1 transition-colors"
                            style={{ backgroundColor: color.hex }}
                            title={`Source: ${color.hex}`}
                        />
                        <div
                            className="h-full flex-1 transition-colors relative"
                            style={{ backgroundColor: adjustedHex }}
                            title={`Adjusted: ${adjustedHex}`}
                        >
                            {/* Visual Divider */}
                            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/30 mix-blend-overlay" />
                        </div>
                    </>
                ) : (
                    <div
                        className="w-full h-full transition-colors"
                        style={{ backgroundColor: color.hex }}
                    />
                )}

                {/* Drag Handle Overlay - Shows vertical lines on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover/header:bg-black/20 backdrop-blur-[2px] opacity-0 group-hover/header:opacity-100 transition-all flex items-center justify-center">
                    <div className="flex gap-[3px] opacity-70">
                        <div className="w-[2px] h-3 bg-white rounded-full"></div>
                        <div className="w-[2px] h-3 bg-white rounded-full"></div>
                        <div className="w-[2px] h-3 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col">
                {/* Name Row */}
                <div className={`px-1.5 pt-1.5 pb-1 border-b ${bgIsLight ? 'border-black/5' : 'border-white/5'}`}>
                    <input
                        type="text"
                        value={color.name}
                        placeholder="Name"
                        onChange={(e) => onNameChange(index, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') (e.target as HTMLInputElement).blur(); }}
                        className={`w-full text-sm font-semibold px-1 py-1 rounded border-transparent focus:outline-none transition-colors ${bgIsLight ? 'text-black focus:bg-black/5' : 'text-white focus:bg-white/10'
                            } bg-transparent ${bgIsLight ? 'placeholder-black/30' : 'placeholder-white/30'} truncate`}
                    />
                </div>

                {/* Action Row: Hex Input + Adjust Toggle */}
                <div className="px-2 py-1.5 flex gap-1 items-center justify-between">
                    <input
                        type="text"
                        value={color.hex}
                        placeholder="Hex"
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9a-fA-F]{0,6}$/.test(val) || val === '#') {
                                onColorChange(index, val);
                            }
                        }}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') (e.target as HTMLInputElement).blur(); }}
                        className={`min-w-0 flex-1 text-[10px] font-mono px-1 py-1 rounded border border-transparent focus:outline-none transition-colors uppercase ${bgIsLight ? 'text-black/80 hover:bg-black/5 focus:bg-black/5' : 'text-white/80 hover:bg-white/10 focus:bg-white/10'
                            }`}
                    />

                    <div className="flex items-center gap-1 shrink-0">
                        {/* Adjust Toggle */}
                        <button
                            onClick={() => setShowAdjustmentsLocal(!showAdjustmentsLocal)}
                            className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${showAdjustmentsLocal
                                ? (bgIsLight ? 'bg-black/10 text-black' : 'bg-white/20 text-white')
                                : (bgIsLight ? 'text-black/40 hover:bg-black/5 hover:text-black/70' : 'text-white/40 hover:bg-white/10 hover:text-white/70')
                                }`}
                            title="Toggle color adjustments (HCL)"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
                                <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
                                <line x1="1" y1="14" x2="7" y2="14"></line>
                                <line x1="9" y1="8" x2="15" y2="8"></line>
                                <line x1="17" y1="16" x2="23" y2="16"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Adjustment diff: source → adjusted */}
                {hasAdjustments && (
                    <div className={`px-2 text-[9px] font-mono flex items-center justify-between pb-1 mt-[-2px] ${txtVal}`}>
                        <span className="opacity-60">adj:</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full border ${bgIsLight ? 'border-black/20' : 'border-white/20'}`} style={{ backgroundColor: color.hex }} title={`Source: ${color.hex}`} />
                            <span className="opacity-50">→</span>
                            <div className={`w-2 h-2 rounded-full border ${bgIsLight ? 'border-black/20' : 'border-white/20'}`} style={{ backgroundColor: adjustedHex }} title={`Adjusted: ${adjustedHex}`} />
                            <span className={`font-semibold tracking-wider ${bgIsLight ? 'text-black/80' : 'text-white/80'}`}>{adjustedHex.toUpperCase()}</span>
                        </div>
                    </div>
                )}

                {/* Adjustment Sliders */}
                {showAdjustmentsLocal && (
                    <div className="flex flex-col gap-2 relative mt-1 px-2 pb-2" style={sliderVars}>
                        {(() => {
                            const bH = baseOklch?.h ?? 0;
                            const bC = baseOklch?.c ?? 0;
                            const bL = baseOklch?.l ?? 0.5;

                            // Computed absolute values (round to avoid SSR/client hydration mismatch)
                            const absH = Math.round(((bH + color.hueShift) % 360 + 360) % 360 * 10000) / 10000;
                            const absC = Math.round((bC > 0.005
                                ? Math.max(0, bC * (1 + color.saturationShift / 100))
                                : Math.max(0, (color.saturationShift / 100) * 0.15)) * 10000) / 10000;
                            const absL = Math.round(Math.max(0, Math.min(1, bL + color.lightnessShift)) * 10000) / 10000;

                            const round4 = (n: number) => Math.round(n * 10000) / 10000;
                            const hueOriginPct = round4((bH / 360) * 100);
                            const chromaMax = round4(bC > 0.005 ? bC * 2 : 0.15);
                            const chromaOriginPct = bC > 0.005 ? 50 : 0;
                            const lightnessOriginPct = round4(bL * 100);

                            const markerColor = bgIsLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';

                            const sliders = [
                                {
                                    label: 'H',
                                    absValue: `${Math.round(absH)}°`,
                                    delta: color.hueShift !== 0 ? `${color.hueShift > 0 ? '+' : ''}${color.hueShift}` : null,
                                    min: 0, max: 360, step: 1,
                                    value: absH,
                                    originPct: hueOriginPct,
                                    onChange: (v: number) => {
                                        const shift = v - bH;
                                        const normalized = ((shift + 540) % 360) - 180;
                                        onAdjustmentsChange(index, { hueShift: Math.round(normalized) });
                                    },
                                },
                                {
                                    label: 'C',
                                    absValue: absC.toFixed(3),
                                    delta: color.saturationShift !== 0 ? `${color.saturationShift > 0 ? '+' : ''}${color.saturationShift}%` : null,
                                    min: 0, max: chromaMax, step: 0.001,
                                    value: Math.min(absC, chromaMax),
                                    originPct: chromaOriginPct,
                                    onChange: (v: number) => {
                                        if (bC > 0.005) {
                                            const s = ((v / bC) - 1) * 100;
                                            onAdjustmentsChange(index, { saturationShift: Math.round(Math.max(-100, Math.min(100, s))) });
                                        } else {
                                            const s = (v / 0.15) * 100;
                                            onAdjustmentsChange(index, { saturationShift: Math.round(Math.max(-100, Math.min(100, s))) });
                                        }
                                    },
                                },
                                {
                                    label: 'L',
                                    absValue: absL.toFixed(2),
                                    delta: color.lightnessShift !== 0 ? `${color.lightnessShift > 0 ? '+' : ''}${color.lightnessShift.toFixed(2)}` : null,
                                    min: 0, max: 1, step: 0.01,
                                    value: absL,
                                    originPct: lightnessOriginPct,
                                    onChange: (v: number) => {
                                        const shift = v - bL;
                                        onAdjustmentsChange(index, { lightnessShift: parseFloat(shift.toFixed(2)) });
                                    },
                                },
                            ];

                            return sliders.map((s) => (
                                <div key={s.label} className="group/slider">
                                    <div className="flex justify-between items-baseline opacity-70 group-hover/slider:opacity-100 transition-opacity">
                                        <label className={`text-[9px] ${txtMuted} uppercase tracking-wider font-medium`}>{s.label}</label>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-[9px] font-mono font-semibold ${bgIsLight ? 'text-black/80' : 'text-white/80'}`}>{s.absValue}</span>
                                            {s.delta && (
                                                <span className={`text-[8px] font-mono ${txtMuted}`}>{s.delta}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        {/* Origin marker */}
                                        <div
                                            className="absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none z-10"
                                            style={{
                                                left: `${s.originPct}%`,
                                                backgroundColor: markerColor,
                                            }}
                                        />
                                        <input
                                            type="range" min={s.min} max={s.max} step={s.step}
                                            value={s.value}
                                            onChange={(e) => s.onChange(Number(e.target.value))}
                                            className="custom-range w-full appearance-none bg-transparent relative z-20"
                                        />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                {/* Footer: Remove */}
                {canRemove && (
                    <div className="px-1.5 pb-1.5">
                        <button
                            onClick={() => onRemove(index)}
                            className="w-full py-1 text-[9px] uppercase tracking-wider font-bold text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Remove this color"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
