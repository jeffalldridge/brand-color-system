'use client';

import { useState, useRef, useEffect } from 'react';
import type { PaletteState, PaletteAction } from '@/hooks/usePaletteState';

interface GlobalSettingsDropdownProps {
    state: PaletteState;
    dispatch: React.Dispatch<PaletteAction>;
    bgIsLight: boolean;
}

export default function GlobalSettingsDropdown({ state, dispatch, bgIsLight }: GlobalSettingsDropdownProps) {
    const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={settingsRef}>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-2 transition-all ${showSettings
                    ? (bgIsLight ? 'border-black/30 bg-black/5 text-black' : 'border-white/30 bg-white/10 text-white')
                    : (bgIsLight ? 'border-black/20 text-black/70 hover:text-black hover:bg-black/5' : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10')
                    }`}
                title="Advanced view options & settings"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
            </button>

            {showSettings && (
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 py-1 flex flex-col ${bgIsLight ? 'bg-white border-black/10 shadow-black/5' : 'bg-[#1a1a1a] border-white/10 shadow-black/50'
                    }`}>
                    <div className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider ${bgIsLight ? 'text-black/40' : 'text-white/40'}`}>
                        Advanced
                    </div>
                    {([
                        { label: 'Match Intensity', active: state.matchIntensity, action: () => dispatch({ type: 'SET_MATCH_INTENSITY', value: !state.matchIntensity }) },
                        { label: 'Sort by Hue', active: state.sortByHue, action: () => dispatch({ type: 'SET_SORT_BY_HUE', value: !state.sortByHue }) },
                    ] as const).map((toggle) => (
                        <button
                            key={toggle.label}
                            onClick={toggle.action}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${bgIsLight ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'
                                }`}
                        >
                            {toggle.label}
                            {toggle.active && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
