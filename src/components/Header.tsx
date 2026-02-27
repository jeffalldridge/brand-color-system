'use client';

import { useSyncExternalStore } from 'react';
import type { PaletteState, PaletteAction } from '@/hooks/usePaletteState';
import BackgroundSlider from './BackgroundSlider';
import TextOverlayToggle from './TextOverlayToggle';
import GlobalSettingsDropdown from './GlobalSettingsDropdown';

interface HeaderProps {
    state: PaletteState;
    dispatch: React.Dispatch<PaletteAction>;
    bgSliderValue: number;
    bgIsLight: boolean;
}

export default function Header({
    state,
    dispatch,
    bgSliderValue,
    bgIsLight,
}: HeaderProps) {
    // Detect display gamut for informational badge
    const displayGamut = useSyncExternalStore(
        () => () => { },
        () => {
            if (window.matchMedia('(color-gamut: rec2020)').matches) return 'rec2020' as const;
            if (window.matchMedia('(color-gamut: p3)').matches) return 'p3' as const;
            return 'srgb' as const;
        },
        () => 'srgb' as const,
    );

    return (
        <header className={`sticky top-0 z-20 backdrop-blur-xl border-b shadow-sm transition-colors ${bgIsLight ? 'bg-white/70 border-black/15' : 'bg-black/60 border-white/15'}`}>
            <div className="max-w-[1800px] mx-auto px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${bgIsLight ? 'text-black' : 'text-white'}`}>
                        Brand Color System
                        <span
                            className={`text-[8px] font-mono font-normal uppercase tracking-wider px-1.5 py-0.5 rounded border ${bgIsLight ? 'border-black/15 text-black/40' : 'border-white/15 text-white/40'}`}
                            title={`Display supports ${displayGamut.toUpperCase()} gamut`}
                        >
                            {displayGamut}
                        </span>
                    </h1>
                    <div className="flex items-center gap-6 flex-wrap">
                        <BackgroundSlider
                            value={bgSliderValue}
                            bgIsLight={bgIsLight}
                            onChange={(v) => dispatch({ type: 'SET_BACKGROUND', value: v })}
                        />
                        <TextOverlayToggle
                            value={state.textOverlay}
                            bgIsLight={bgIsLight}
                            onChange={(mode) => dispatch({ type: 'SET_TEXT_OVERLAY', mode })}
                        />

                        {/* Gamut target toggle */}
                        <div className={`flex rounded-md overflow-hidden border ${bgIsLight ? 'border-black/20' : 'border-white/20'}`}>
                            {(['srgb', 'p3'] as const).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => dispatch({ type: 'SET_GAMUT_TARGET', value: g })}
                                    title={g === 'srgb' ? 'Clamp colors to sRGB gamut' : 'Clamp colors to Display P3 gamut (wider)'}
                                    className={`px-3 py-1 text-xs font-medium transition-colors ${state.gamutTarget === g
                                        ? (bgIsLight ? 'bg-black/15 text-black' : 'bg-white/20 text-white')
                                        : (bgIsLight ? 'bg-transparent text-black/50 hover:text-black/70' : 'bg-transparent text-white/50 hover:text-white/70')
                                        }`}
                                >
                                    {g === 'srgb' ? 'sRGB' : 'P3'}
                                </button>
                            ))}
                        </div>

                        {/* View toggles */}
                        <div className={`flex rounded-md overflow-hidden border ${bgIsLight ? 'border-black/20' : 'border-white/20'}`}>
                            {([
                                { label: 'Nearest Input', title: 'Show outline ring on the shade closest to each color\'s original hex', active: state.showNearestOutline, action: () => dispatch({ type: 'SET_SHOW_NEAREST_OUTLINE', value: !state.showNearestOutline }) },
                                { label: 'Labels', title: 'Show step numbers, contrast ratios, and hex values on swatches', active: state.showSwatchText, action: () => dispatch({ type: 'SET_SHOW_SWATCH_TEXT', value: !state.showSwatchText }) },
                                { label: 'Compact', title: 'Remove gaps, rounded corners, and shadows for flush color comparison', active: state.compactView, action: () => dispatch({ type: 'SET_COMPACT_VIEW', value: !state.compactView }) },
                            ] as const).map((toggle) => (
                                <button
                                    key={toggle.label}
                                    onClick={toggle.action}
                                    title={toggle.title}
                                    className={`px-3 py-1 text-xs font-medium transition-colors ${toggle.active
                                        ? (bgIsLight ? 'bg-black/15 text-black' : 'bg-white/20 text-white')
                                        : (bgIsLight ? 'bg-transparent text-black/50 hover:text-black/70' : 'bg-transparent text-white/50 hover:text-white/70')
                                        }`}
                                >
                                    {toggle.label}
                                </button>
                            ))}
                        </div>

                        <GlobalSettingsDropdown state={state} dispatch={dispatch} bgIsLight={bgIsLight} />
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to reset the entire palette and ramp configuration to default?')) {
                                    dispatch({ type: 'RESET' });
                                }
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md border border-transparent transition-all ${bgIsLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-950/30'}`}
                            title="Reset entire palette to default"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
