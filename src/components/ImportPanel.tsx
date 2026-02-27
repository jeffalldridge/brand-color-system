"use client";

import { useState, useMemo } from "react";
import {
  parseImportText,
  type ParsedColor,
  type ParseResult,
} from "@/lib/import-parser";

interface ImportPanelProps {
  bgIsLight: boolean;
  currentColorCount: number;
  onImport: (colors: ParsedColor[]) => void;
  onClose: () => void;
}

const FORMAT_LABELS: Record<ParseResult["format"], string> = {
  hex: "Hex List",
  css: "CSS Custom Properties",
  tailwind: "Tailwind @theme",
  tokens: "Design Tokens",
};

const PLACEHOLDER = `Paste your color system here…

Supported formats:
• Hex values — one per line (#e11d48, #ea580c, …)
• CSS variables — :root { --brand-red-500: #c2000b; … }
• Tailwind @theme — oklch(0.5 0.22 25.6)
• Design Tokens JSON — { "red": { "500": { "$value": "#c2000b" } } }`;

export default function ImportPanel({
  bgIsLight,
  currentColorCount,
  onImport,
  onClose,
}: ImportPanelProps) {
  const [text, setText] = useState("");

  const result = useMemo(() => parseImportText(text), [text]);
  const hasColors = result.colors.length > 0;

  const txt = bgIsLight ? "text-black/80" : "text-white/80";
  const txtMuted = bgIsLight ? "text-black/50" : "text-white/50";
  const border = bgIsLight ? "border-black/15" : "border-white/15";
  const inputBg = bgIsLight ? "bg-black/[0.03]" : "bg-white/[0.05]";
  const btnPrimary = bgIsLight
    ? "bg-black/80 text-white hover:bg-black/90"
    : "bg-white/80 text-black hover:bg-white/90";
  const btnSecondary = bgIsLight
    ? "text-black/50 hover:text-black/70"
    : "text-white/50 hover:text-white/70";

  const handleImport = () => {
    if (!hasColors) return;
    const confirmed = window.confirm(
      `This will replace your current ${currentColorCount} source color${currentColorCount !== 1 ? "s" : ""} with ${result.colors.length} imported color${result.colors.length !== 1 ? "s" : ""}. Continue?`,
    );
    if (confirmed) {
      onImport(result.colors);
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 mb-4 space-y-3 transition-colors ${border} ${inputBg}`}
    >
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={6}
        className={`w-full rounded-lg border px-3 py-2 text-xs font-mono resize-y transition-colors focus:outline-none ${border} ${txt} ${
          bgIsLight
            ? "bg-white/60 placeholder-black/30 focus:border-black/30"
            : "bg-black/40 placeholder-white/25 focus:border-white/30"
        }`}
        autoFocus
      />

      {/* Status line */}
      {text.trim() && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format badge */}
          <span
            className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${border} ${txtMuted}`}
          >
            {FORMAT_LABELS[result.format]}
          </span>

          {/* Count */}
          {hasColors && (
            <span className={`text-[11px] ${txt}`}>
              {result.colors.length} color
              {result.colors.length !== 1 ? "s" : ""} detected
              {result.truncated && (
                <span className={`${txtMuted}`}> (limited to 12)</span>
              )}
            </span>
          )}

          {/* Error */}
          {result.error && (
            <span className="text-[11px] text-red-500/80">{result.error}</span>
          )}
        </div>
      )}

      {/* Preview swatches */}
      {hasColors && (
        <div className="flex flex-wrap gap-2">
          {result.colors.map((color, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-sm shrink-0 border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className={`text-[10px] font-medium ${txt}`}>
                {color.name}
              </span>
              <span className={`text-[9px] font-mono ${txtMuted}`}>
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleImport}
          disabled={!hasColors}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
            hasColors
              ? btnPrimary
              : bgIsLight
                ? "bg-black/10 text-black/30 cursor-not-allowed"
                : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {hasColors
            ? `Import ${result.colors.length} Color${result.colors.length !== 1 ? "s" : ""}`
            : "Import"}
        </button>
        <button
          onClick={onClose}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${btnSecondary}`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
