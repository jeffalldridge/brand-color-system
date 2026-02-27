'use client';

import { useReducer, useMemo, useEffect, useState } from 'react';
import { DEFAULT_BRAND_COLORS, DEFAULT_RAMP_CONFIG } from '@/lib/brand-colors';
import { generateAllFamilies } from '@/lib/color-engine';
import type { BrandColor, GamutTarget, TextOverlay, RampConfig, ShadeFamily } from '@/lib/types';

export interface PaletteState {
  brandColors: BrandColor[];
  backgroundColor: string;
  textOverlay: TextOverlay;
  rampConfig: RampConfig;
  showNearestOutline: boolean;
  showSwatchText: boolean;
  compactView: boolean;
  sortByHue: boolean;
  gamutTarget: GamutTarget;
}

export type PaletteAction =
  | { type: 'UPDATE_COLOR'; index: number; hex: string }
  | { type: 'UPDATE_NAME'; index: number; name: string }
  | { type: 'UPDATE_ADJUSTMENTS'; index: number; adjustments: Partial<Pick<BrandColor, 'hueShift' | 'saturationShift' | 'lightnessShift'>> }
  | { type: 'REORDER_COLOR'; fromIndex: number; toIndex: number }
  | { type: 'ADD_COLOR' }
  | { type: 'REMOVE_COLOR'; index: number }
  | { type: 'SET_BACKGROUND'; value: number }
  | { type: 'SET_TEXT_OVERLAY'; mode: TextOverlay }
  | { type: 'SET_SHOW_NEAREST_OUTLINE'; value: boolean }
  | { type: 'SET_SHOW_SWATCH_TEXT'; value: boolean }
  | { type: 'SET_COMPACT_VIEW'; value: boolean }
  | { type: 'SET_SORT_BY_HUE'; value: boolean }
  | { type: 'SET_GAMUT_TARGET'; value: GamutTarget }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: PaletteState };

function grayFromSlider(value: number): string {
  const v = Math.round((value / 100) * 255);
  const hex = v.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

const initialState: PaletteState = {
  brandColors: DEFAULT_BRAND_COLORS,
  backgroundColor: '#333333',
  textOverlay: 'both',
  rampConfig: DEFAULT_RAMP_CONFIG,
  showNearestOutline: true,
  showSwatchText: true,
  compactView: false,
  sortByHue: true,
  gamutTarget: 'srgb',
};

function reducer(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case 'UPDATE_COLOR': {
      const updated = [...state.brandColors];
      updated[action.index] = { ...updated[action.index], hex: action.hex };
      return { ...state, brandColors: updated };
    }
    case 'UPDATE_NAME': {
      const updated = [...state.brandColors];
      updated[action.index] = { ...updated[action.index], name: action.name };
      return { ...state, brandColors: updated };
    }
    case 'UPDATE_ADJUSTMENTS': {
      const updated = [...state.brandColors];
      updated[action.index] = { ...updated[action.index], ...action.adjustments };
      return { ...state, brandColors: updated };
    }
    case 'REORDER_COLOR': {
      const updated = [...state.brandColors];
      const [moved] = updated.splice(action.fromIndex, 1);
      updated.splice(action.toIndex, 0, moved);
      return { ...state, brandColors: updated };
    }
    case 'ADD_COLOR': {
      const id = `color-${Date.now()}`;
      const newColor: BrandColor = {
        id,
        name: 'New Color',
        hex: '#6366f1',
        hueShift: 0,
        saturationShift: 0,
        lightnessShift: 0,
      };
      return { ...state, brandColors: [...state.brandColors, newColor] };
    }
    case 'REMOVE_COLOR': {
      if (state.brandColors.length <= 1) return state;
      const updated = [...state.brandColors];
      updated.splice(action.index, 1);
      return { ...state, brandColors: updated };
    }
    case 'SET_BACKGROUND':
      return { ...state, backgroundColor: grayFromSlider(action.value) };
    case 'SET_TEXT_OVERLAY':
      return { ...state, textOverlay: action.mode };
    case 'SET_SHOW_NEAREST_OUTLINE':
      return { ...state, showNearestOutline: action.value };
    case 'SET_SHOW_SWATCH_TEXT':
      return { ...state, showSwatchText: action.value };
    case 'SET_COMPACT_VIEW':
      return { ...state, compactView: action.value };
    case 'SET_SORT_BY_HUE':
      return { ...state, sortByHue: action.value };
    case 'SET_GAMUT_TARGET':
      return { ...state, gamutTarget: action.value };
    case 'RESET':
      return initialState;
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

export function usePaletteState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('palette-state-v2');
      if (saved) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever state changes after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('palette-state-v2', JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const families: ShadeFamily[] = useMemo(
    () => generateAllFamilies(state.brandColors, state.rampConfig, state.gamutTarget),
    [state.brandColors, state.rampConfig, state.gamutTarget],
  );

  const bgSliderValue = useMemo(() => {
    const hex = state.backgroundColor.replace('#', '');
    const v = parseInt(hex.substring(0, 2), 16);
    return Math.round((v / 255) * 100);
  }, [state.backgroundColor]);

  const bgIsLight = useMemo(() => {
    const hex = state.backgroundColor.replace('#', '');
    const v = parseInt(hex.substring(0, 2), 16);
    return v > 140;
  }, [state.backgroundColor]);

  return { state, dispatch, families, bgSliderValue, bgIsLight };
}
