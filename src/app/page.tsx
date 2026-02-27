'use client';

import { useCallback, useRef, useState } from 'react';
import { usePaletteState } from '@/hooks/usePaletteState';
import BrandColorEditor from '@/components/BrandColorEditor';
import ShadeGrid from '@/components/ShadeGrid';
import Header from '@/components/Header';
import OutputSection from '@/components/OutputSection';
import ColorWheel from '@/components/ColorWheel';

export default function Home() {
  const { state, dispatch, families, bgSliderValue, bgIsLight } = usePaletteState();

  const [showHueMap, setShowHueMap] = useState(false);
  const [hueMapWidth, setHueMapWidth] = useState(280);
  const dividerRef = useRef<HTMLDivElement>(null);

  const MIN_WHEEL = 180;
  const MAX_WHEEL = 500;
  const MIN_CARDS = 600;

  const handleDividerPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = hueMapWidth;
    const container = dividerRef.current?.parentElement;
    const containerWidth = container?.clientWidth ?? 1200;

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const maxAllowed = Math.min(MAX_WHEEL, containerWidth - MIN_CARDS);
      const next = Math.max(MIN_WHEEL, Math.min(maxAllowed, startWidth + delta));
      setHueMapWidth(next);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [hueMapWidth]);

  return (
    <div className="min-h-screen transition-colors duration-500 ease-in-out" style={{ backgroundColor: state.backgroundColor }}>
      {/* Sticky controls header */}
      <Header
        state={state}
        dispatch={dispatch}
        bgSliderValue={bgSliderValue}
        bgIsLight={bgIsLight}
      />

      <main className="max-w-[1800px] mx-auto px-6 py-4 space-y-5">
        {/* Source colors + optional hue map */}
        <section>
          <div className="mb-2 flex items-center gap-3">
            <h2 className={`text-xs font-semibold uppercase tracking-widest ${bgIsLight ? 'text-black/60' : 'text-white/60'}`}>
              Source Colors
            </h2>
            <button
              onClick={() => setShowHueMap(v => !v)}
              title={showHueMap ? 'Hide hue map' : 'Show hue map'}
              className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors ${showHueMap
                ? (bgIsLight ? 'bg-black/10 border-black/20 text-black/70' : 'bg-white/15 border-white/20 text-white/70')
                : (bgIsLight ? 'bg-transparent border-black/15 text-black/40 hover:text-black/60 hover:border-black/25' : 'bg-transparent border-white/15 text-white/40 hover:text-white/60 hover:border-white/25')
                }`}
            >
              Hue Map
            </button>
          </div>
          <div className="flex items-start">
            {showHueMap && (
              <>
                <div className="shrink-0 hidden lg:flex lg:items-center lg:justify-center" style={{ width: hueMapWidth }}>
                  <ColorWheel families={families} bgIsLight={bgIsLight} />
                </div>
                {/* Drag divider */}
                <div
                  ref={dividerRef}
                  onPointerDown={handleDividerPointerDown}
                  className={`hidden lg:flex shrink-0 w-3 self-stretch items-center justify-center cursor-col-resize group`}
                  title="Drag to resize"
                >
                  <div className={`w-px h-full transition-colors ${bgIsLight ? 'bg-black/10 group-hover:bg-black/25 group-active:bg-black/40' : 'bg-white/10 group-hover:bg-white/25 group-active:bg-white/40'}`} />
                </div>
              </>
            )}
            <div className="flex-1" style={{ minWidth: MIN_CARDS }}>
              <BrandColorEditor
                brandColors={state.brandColors}
                families={families}
                bgIsLight={bgIsLight}
                onColorChange={(index, hex) => dispatch({ type: 'UPDATE_COLOR', index, hex })}
                onNameChange={(index, name) => dispatch({ type: 'UPDATE_NAME', index, name })}
                onAdjustmentsChange={(index, adjustments) => dispatch({ type: 'UPDATE_ADJUSTMENTS', index, adjustments })}
                onReorder={(from, to) => dispatch({ type: 'REORDER_COLOR', fromIndex: from, toIndex: to })}
                onAddColor={() => dispatch({ type: 'ADD_COLOR' })}
                onRemoveColor={(index) => dispatch({ type: 'REMOVE_COLOR', index })}
              />
            </div>
          </div>
        </section>

        <div className={`w-full h-px ${bgIsLight ? 'bg-black/15' : 'bg-white/15'}`} />

        {/* Shade grid */}
        <section>
          <div className="mb-2 flex justify-between items-end">
            <h2 className={`text-xs font-semibold uppercase tracking-widest ${bgIsLight ? 'text-black/60' : 'text-white/60'}`}>
              Shade Family Ramp
            </h2>
          </div>
          <ShadeGrid
            families={families}
            textOverlay={state.textOverlay}
            bgIsLight={bgIsLight}
            rampConfig={state.rampConfig}
            showNearestOutline={state.showNearestOutline}
            showSwatchText={state.showSwatchText}
            compactView={state.compactView}
            sortByHue={state.sortByHue}
          />
        </section>

        {/* Output values */}
        <section
          className="backdrop-blur-md rounded-xl p-6 border transition-colors duration-300"
          style={{
            backgroundColor: bgIsLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
            borderColor: bgIsLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
          }}
        >
          <OutputSection families={families} bgIsLight={bgIsLight} sortByHue={state.sortByHue} />
        </section>
      </main>
    </div>
  );
}
