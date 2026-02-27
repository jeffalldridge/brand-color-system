'use client';

import { useReducer, useMemo, useEffect, useState } from 'react';
import { DEFAULT_BRAND_COLORS, DEFAULT_RAMP_CONFIG } from '@/lib/brand-colors';
import { generateAllFamilies } from '@/lib/color-engine';
import { sortedSteps, stepFromL } from '@/lib/lightness-ramp';
import type { BrandColor, TextOverlay, RampConfig, ShadeFamily, ShadeStep } from '@/lib/types';

export interface PaletteState {
  brandColors: BrandColor[];
  backgroundColor: string;
  textOverlay: TextOverlay;
  rampConfig: RampConfig;
  showNearestOutline: boolean;
  showSwatchText: boolean;
  compactView: boolean;
  matchIntensity: boolean;
  sortByHue: boolean;
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
  | { type: 'UPDATE_STEP'; index: number; updates: Partial<ShadeStep> }
  | { type: 'ADD_STEP' }
  | { type: 'REMOVE_STEP'; index: number }
  | { type: 'SORT_STEPS' }
  | { type: 'SET_SHOW_NEAREST_OUTLINE'; value: boolean }
  | { type: 'SET_SHOW_SWATCH_TEXT'; value: boolean }
  | { type: 'SET_COMPACT_VIEW'; value: boolean }
  | { type: 'SET_MATCH_INTENSITY'; value: boolean }
  | { type: 'SET_SORT_BY_HUE'; value: boolean }
  | { type: 'SET_HERO'; id: string }
  | { type: 'TOGGLE_VISIBILITY'; index: number }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: PaletteState };

function grayFromSlider(value: number): string {
  const v = Math.round((value / 100) * 255);
  const hex = v.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

const initialState: PaletteState = {
  brandColors: DEFAULT_BRAND_COLORS,
  backgroundColor: '#333333', // 80% black (20% lightness)
  textOverlay: 'both',
  rampConfig: DEFAULT_RAMP_CONFIG,
  showNearestOutline: true,
  showSwatchText: true,
  compactView: false,
  matchIntensity: false,
  sortByHue: true,
};

function reducer(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case 'UPDATE_COLOR': {
      if (state.brandColors[action.index]?.locked) return state;
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
        locked: false,
        visible: true,
        hueShift: 0,
        saturationShift: 0,
        lightnessShift: 0,
      };
      return { ...state, brandColors: [...state.brandColors, newColor] };
    }
    case 'REMOVE_COLOR': {
      if (state.brandColors.length <= 1) return state; // keep at least one
      const target = state.brandColors[action.index];
      if (!target) return state;
      const updated = [...state.brandColors];
      updated.splice(action.index, 1);
      return { ...state, brandColors: updated };
    }
    case 'SET_BACKGROUND':
      return { ...state, backgroundColor: grayFromSlider(action.value) };
    case 'SET_TEXT_OVERLAY':
      return { ...state, textOverlay: action.mode };
    case 'UPDATE_STEP': {
      const steps = [...state.rampConfig.steps];
      steps[action.index] = { ...steps[action.index], ...action.updates };
      return { ...state, rampConfig: { steps } };
    }
    case 'ADD_STEP': {
      const steps = [...state.rampConfig.steps];
      // Insert a new step: pick a value between the last two lightest
      const sorted = sortedSteps(steps);
      const lightest = sorted[sorted.length - 1];
      const secondLightest = sorted.length > 1 ? sorted[sorted.length - 2] : { step: lightest.step + 100, l: lightest.l - 0.1 };
      const newL = (lightest.l + secondLightest.l) / 2;
      steps.push({ step: stepFromL(newL), l: newL });
      return { ...state, rampConfig: { steps: sortedSteps(steps) } };
    }
    case 'REMOVE_STEP': {
      if (state.rampConfig.steps.length <= 2) return state; // minimum 2 steps
      const steps = [...state.rampConfig.steps];
      steps.splice(action.index, 1);
      return { ...state, rampConfig: { steps } };
    }
    case 'SORT_STEPS': {
      return { ...state, rampConfig: { steps: sortedSteps(state.rampConfig.steps) } };
    }
    case 'SET_SHOW_NEAREST_OUTLINE':
      return { ...state, showNearestOutline: action.value };
    case 'SET_SHOW_SWATCH_TEXT':
      return { ...state, showSwatchText: action.value };
    case 'SET_COMPACT_VIEW':
      return { ...state, compactView: action.value };
    case 'SET_MATCH_INTENSITY':
      return { ...state, matchIntensity: action.value };
    case 'SET_SORT_BY_HUE':
      return { ...state, sortByHue: action.value };
    case 'TOGGLE_VISIBILITY': {
      const target = state.brandColors[action.index];
      if (!target) return state;
      // Hero must stay visible (but if no hero, any color can be hidden)
      if (target.locked) return state;
      const updated = [...state.brandColors];
      updated[action.index] = { ...updated[action.index], visible: !updated[action.index].visible };
      return { ...state, brandColors: updated };
    }
    case 'SET_HERO': {
      const target = state.brandColors.find(bc => bc.id === action.id);
      if (!target) return state;
      // Toggle off if clicking the current hero
      if (target.locked) {
        const updated = state.brandColors.map(bc => ({ ...bc, locked: false }));
        return { ...state, brandColors: updated };
      }
      // Set new hero
      const updated = state.brandColors.map(bc => ({
        ...bc,
        locked: bc.id === action.id,
        visible: bc.id === action.id ? true : bc.visible,
      }));
      return { ...state, brandColors: updated };
    }
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
      const saved = localStorage.getItem('palette-state-v1');
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
      localStorage.setItem('palette-state-v1', JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const families: ShadeFamily[] = useMemo(
    () => generateAllFamilies(state.brandColors, state.rampConfig, state.matchIntensity),
    [state.brandColors, state.rampConfig, state.matchIntensity],
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
