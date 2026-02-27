"use client";

import type { TextOverlay } from "@/lib/types";

interface TextOverlayToggleProps {
  value: TextOverlay;
  bgIsLight: boolean;
  onChange: (value: TextOverlay) => void;
}

const OPTIONS: { label: string; value: TextOverlay }[] = [
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
  { label: "Both", value: "both" },
];

export default function TextOverlayToggle({
  value,
  bgIsLight,
  onChange,
}: TextOverlayToggleProps) {
  const txt = bgIsLight ? "text-black/80" : "text-white/80";
  const border = bgIsLight ? "border-black/20" : "border-white/20";
  const activeClass = bgIsLight
    ? "bg-black/15 text-black"
    : "bg-white/20 text-white";
  const inactiveClass = bgIsLight
    ? "bg-transparent text-black/50 hover:text-black/70"
    : "bg-transparent text-white/50 hover:text-white/70";

  return (
    <div className="flex items-center gap-3">
      <label className={`text-xs font-medium whitespace-nowrap ${txt}`}>
        Text Overlay
      </label>
      <div className={`flex rounded-md overflow-hidden border ${border}`}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              value === opt.value ? activeClass : inactiveClass
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
