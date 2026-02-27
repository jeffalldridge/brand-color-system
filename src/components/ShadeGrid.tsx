"use client";

import { useId } from "react";
import type {
  GamutTarget,
  ShadeFamily,
  TextOverlay,
  RampConfig,
} from "@/lib/types";
import { sortedSteps } from "@/lib/lightness-ramp";
import ColorSwatch from "./ColorSwatch";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ShadeGridProps {
  families: ShadeFamily[];
  textOverlay: TextOverlay;
  bgIsLight: boolean;
  rampConfig: RampConfig;
  showNearestOutline: boolean;
  showSwatchText: boolean;
  gapSize: number;
  gamutTarget: GamutTarget;
  onReorderRow?: (fromId: string, toId: string) => void;
}

interface SortableRowProps {
  family: ShadeFamily;
  numShades: number;
  gapSize: number;
  textOverlay: TextOverlay;
  bgIsLight: boolean;
  showNearestOutline: boolean;
  showSwatchText: boolean;
  gamutLabel: string;
  txt: string;
  txtMuted: string;
}

function SortableRow({
  family,
  numShades,
  gapSize,
  textOverlay,
  bgIsLight,
  showNearestOutline,
  showSwatchText,
  gamutLabel,
  txt,
  txtMuted,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: family.brand.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch group" aria-roledescription="sortable">
      {/* Accent strokes — absolutely positioned in the page margins */}
      <div
        className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full -translate-x-2 transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ backgroundColor: family.adjustedHex }}
      />
      <div
        className={`absolute right-0 top-1.5 bottom-1.5 w-0.5 rounded-full translate-x-2 transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ backgroundColor: family.adjustedHex }}
      />
      {/* Name column — drag handle */}
      <div
        className={`w-24 shrink-0 mr-2 flex items-center py-1 px-2 rounded-md cursor-grab active:cursor-grabbing select-none transition-colors ${bgIsLight ? "group-hover:bg-black/[0.04]" : "group-hover:bg-white/[0.04]"}`}
        aria-label={`Drag to reorder ${family.brand.name}`}
        {...attributes}
        {...listeners}
      >
        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm font-semibold ${txt} truncate transition-colors ${bgIsLight ? "group-hover:text-black" : "group-hover:text-white"}`}
          >
            {family.brand.name}
          </span>
          <span className={`text-[11px] font-mono tracking-wider ${txtMuted}`}>
            {family.adjustedHex.toUpperCase()}
          </span>
        </div>
      </div>
      {/* Swatch grid */}
      <div
        className="flex-1 grid"
        style={{
          gridTemplateColumns: `repeat(${numShades}, minmax(0, 1fr))`,
          gap: `${gapSize}px`,
        }}
      >
        {family.shades.map((shade) => {
          const isClosest = shade.step === family.closestStep;
          const isExact =
            isClosest &&
            shade.hex.toLowerCase() === family.adjustedHex.toLowerCase();
          return (
            <div
              key={shade.step}
              className={`overflow-hidden relative ${gapSize > 0 ? "rounded-md" : ""}`}
            >
              <ColorSwatch
                shade={shade}
                textOverlay={textOverlay}
                isClosestToInput={isClosest}
                isExactInput={isExact}
                bgIsLight={bgIsLight}
                showNearestOutline={showNearestOutline}
                showSwatchText={showSwatchText}
                gamutLabel={gamutLabel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ShadeGrid({
  families,
  textOverlay,
  bgIsLight,
  rampConfig,
  showNearestOutline,
  showSwatchText,
  gapSize,
  gamutTarget,
  onReorderRow,
}: ShadeGridProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const dndId = useId();

  if (families.length === 0) return null;

  const steps = rampConfig.steps;
  const sorted = sortedSteps(steps);
  const numShades = sorted.length;

  const txt = bgIsLight ? "text-black/80" : "text-white/80";
  const txtMuted = bgIsLight ? "text-black/60" : "text-white/60";
  const gamutLabel = gamutTarget === "p3" ? "P3" : "sRGB";

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over && onReorderRow) {
      onReorderRow(String(active.id), String(over.id));
    }
  };

  const itemIds = families.map((f) => f.brand.id);

  return (
    <div className="pt-4">
      {/* Column header labels */}
      <div className="flex items-center mb-2">
        <div className="w-24 shrink-0 mr-2 pr-2">
          <span
            className={`text-[10px] ${txtMuted} uppercase tracking-wider font-medium cursor-default`}
            title="Tailwind shade numbers mapped to OKLCH lightness values (L)"
          >
            Shade
          </span>
        </div>
        <div
          className="flex-1 grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${numShades}, minmax(0, 1fr))`,
          }}
        >
          {sorted.map((s, sortedIdx) => (
            <div
              key={`${s.step}-${sortedIdx}`}
              className="flex items-baseline justify-center whitespace-nowrap px-0.5 cursor-default"
              title={`Step ${s.step} — OKLCH lightness ${s.l.toFixed(2)} (Tailwind shade number, dark → light)`}
            >
              <span
                className={`text-[11px] font-bold font-mono ${txt}`}
              >
                {s.step}
              </span>
              <span className={`text-[9px] font-mono ${txtMuted} mx-[2px]`}>
                /
              </span>
              <span className={`text-[9px] font-mono ${txtMuted}`}>
                {s.l.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Color rows — sortable */}
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div
            className="relative flex flex-col"
            style={{ gap: `${gapSize}px` }}
          >
            {families.map((family) => (
              <SortableRow
                key={family.brand.id}
                family={family}
                numShades={numShades}
                gapSize={gapSize}
                textOverlay={textOverlay}
                bgIsLight={bgIsLight}
                showNearestOutline={showNearestOutline}
                showSwatchText={showSwatchText}
                gamutLabel={gamutLabel}
                txt={txt}
                txtMuted={txtMuted}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
