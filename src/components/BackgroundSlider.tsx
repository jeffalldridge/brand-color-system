'use client';

interface BackgroundSliderProps {
  value: number;
  bgIsLight: boolean;
  onChange: (value: number) => void;
}

export default function BackgroundSlider({ value, bgIsLight, onChange }: BackgroundSliderProps) {
  const txt = bgIsLight ? 'text-black/80' : 'text-white/80';
  const border = bgIsLight ? 'border-black/20' : 'border-white/20';

  return (
    <div className="flex items-center gap-3">
      <label className={`text-xs font-medium whitespace-nowrap ${txt}`}>Background</label>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-sm bg-white border ${border}`} />
        <input
          type="range"
          min={0}
          max={100}
          value={100 - value}
          onChange={(e) => onChange(100 - Number(e.target.value))}
          className="w-32 hover:opacity-80 transition-opacity custom-range"
          style={{
            '--slider-color': bgIsLight ? '#000' : '#fff',
            '--slider-track': bgIsLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)',
          } as React.CSSProperties}
        />
        <div className={`w-4 h-4 rounded-sm bg-black border ${border}`} />
      </div>
    </div>
  );
}
