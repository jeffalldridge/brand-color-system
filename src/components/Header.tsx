"use client";

import type { PaletteState, PaletteAction } from "@/hooks/usePaletteState";
import BackgroundSlider from "./BackgroundSlider";
import TextOverlayToggle from "./TextOverlayToggle";

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
  // Icon color from first brand color
  const iconColor = state.brandColors[0]?.hex ?? "#2563eb";

  return (
    <header
      className={`sticky top-0 z-20 backdrop-blur-xl border-b shadow-sm transition-colors ${bgIsLight ? "bg-white/70 border-black/15" : "bg-black/60 border-white/15"}`}
    >
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        {/* Row 1: Icon + Title + gamut toggle | Background slider + Reset */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-md shrink-0"
              style={{ backgroundColor: iconColor }}
              title={`First brand color: ${iconColor}`}
            />
            <h1
              className={`text-lg font-bold tracking-tight ${bgIsLight ? "text-black" : "text-white"}`}
            >
              Brand Color System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <BackgroundSlider
              value={bgSliderValue}
              bgIsLight={bgIsLight}
              onChange={(v) => dispatch({ type: "SET_BACKGROUND", value: v })}
            />
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to reset the entire palette and ramp configuration to default?",
                  )
                ) {
                  dispatch({ type: "RESET" });
                }
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border border-transparent transition-all shrink-0 ${bgIsLight ? "text-red-600 hover:bg-red-50" : "text-red-400 hover:bg-red-950/30"}`}
              title="Reset entire palette to default"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Row 2: Text Overlay | View toggles | Gap size | ... | sRGB/P3 (right) */}
        <div className="flex items-center gap-4 flex-wrap mt-3">
          {/* Text overlay */}
          <TextOverlayToggle
            value={state.textOverlay}
            bgIsLight={bgIsLight}
            onChange={(mode) => dispatch({ type: "SET_TEXT_OVERLAY", mode })}
          />

          {/* View toggles */}
          <div
            role="group"
            aria-label="View toggles"
            className={`flex rounded-md overflow-hidden border ${bgIsLight ? "border-black/20" : "border-white/20"}`}
          >
            {(
              [
                {
                  label: "Sort by Hue",
                  title: "Sort shade rows by hue angle instead of source order",
                  active: state.sortByHue,
                  action: () =>
                    dispatch({
                      type: "SET_SORT_BY_HUE",
                      value: !state.sortByHue,
                    }),
                },
                {
                  label: "Nearest Input",
                  title:
                    "Show outline ring on the shade closest to each color's original hex",
                  active: state.showNearestOutline,
                  action: () =>
                    dispatch({
                      type: "SET_SHOW_NEAREST_OUTLINE",
                      value: !state.showNearestOutline,
                    }),
                },
                {
                  label: "Labels",
                  title:
                    "Show step numbers, contrast ratios, and hex values on swatches",
                  active: state.showSwatchText,
                  action: () =>
                    dispatch({
                      type: "SET_SHOW_SWATCH_TEXT",
                      value: !state.showSwatchText,
                    }),
                },
              ] as const
            ).map((toggle) => (
              <button
                key={toggle.label}
                onClick={toggle.action}
                title={toggle.title}
                aria-pressed={toggle.active}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  toggle.active
                    ? bgIsLight
                      ? "bg-black/15 text-black"
                      : "bg-white/20 text-white"
                    : bgIsLight
                      ? "bg-transparent text-black/50 hover:text-black/70"
                      : "bg-transparent text-white/50 hover:text-white/70"
                }`}
              >
                {toggle.label}
              </button>
            ))}
          </div>

          {/* Gap size control */}
          <div
            role="group"
            aria-label="Gap size"
            className={`flex rounded-md overflow-hidden border ${bgIsLight ? "border-black/20" : "border-white/20"}`}
          >
            {(
              [
                { label: "Flush", value: 0, title: "No gaps between swatches" },
                {
                  label: "Tight",
                  value: 4,
                  title: "4px gaps between swatches",
                },
                {
                  label: "Normal",
                  value: 8,
                  title: "8px gaps — see background between swatches",
                },
                {
                  label: "Wide",
                  value: 16,
                  title: "16px gaps — more background visible",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  dispatch({ type: "SET_GAP_SIZE", value: opt.value })
                }
                title={opt.title}
                aria-pressed={state.gapSize === opt.value}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  state.gapSize === opt.value
                    ? bgIsLight
                      ? "bg-black/15 text-black"
                      : "bg-white/20 text-white"
                    : bgIsLight
                      ? "bg-transparent text-black/50 hover:text-black/70"
                      : "bg-transparent text-white/50 hover:text-white/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Spacer to push gamut toggle right */}
          <div className="flex-1" />

          {/* Gamut target */}
          <div
            role="group"
            aria-label="Gamut target"
            className={`flex rounded-md overflow-hidden border ${bgIsLight ? "border-black/20" : "border-white/20"}`}
          >
            {(["srgb", "p3"] as const).map((g) => (
              <button
                key={g}
                onClick={() => dispatch({ type: "SET_GAMUT_TARGET", value: g })}
                title={
                  g === "srgb"
                    ? "Clamp colors to sRGB gamut"
                    : "Clamp colors to Display P3 gamut (wider)"
                }
                aria-pressed={state.gamutTarget === g}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  state.gamutTarget === g
                    ? bgIsLight
                      ? "bg-black/15 text-black"
                      : "bg-white/20 text-white"
                    : bgIsLight
                      ? "bg-transparent text-black/50 hover:text-black/70"
                      : "bg-transparent text-white/50 hover:text-white/70"
                }`}
              >
                {g === "srgb" ? "sRGB" : "P3"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
