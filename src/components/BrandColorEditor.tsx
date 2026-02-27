"use client";

import { useMemo, useId } from "react";
import type { BrandColor, ShadeFamily } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import BrandColorCard from "./BrandColorCard";

interface BrandColorEditorProps {
  brandColors: BrandColor[];
  families: ShadeFamily[];
  bgIsLight: boolean;
  onColorChange: (index: number, hex: string) => void;
  onNameChange: (index: number, name: string) => void;
  onAdjustmentsChange: (
    index: number,
    adjustments: Partial<
      Pick<BrandColor, "hueShift" | "saturationShift" | "lightnessShift">
    >,
  ) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddColor: () => void;
  onRemoveColor: (index: number) => void;
}

export default function BrandColorEditor({
  brandColors,
  families,
  bgIsLight,
  onColorChange,
  onNameChange,
  onAdjustmentsChange,
  onReorder,
  onAddColor,
  onRemoveColor,
}: BrandColorEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = brandColors.findIndex((item) => item.id === active.id);
      const newIndex = brandColors.findIndex((item) => item.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const itemIds = brandColors.map((c) => c.id);
  const familyMap = useMemo(
    () => new Map(families.map((f) => [f.brand.id, f])),
    [families],
  );

  const id = useId();

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
        <div
          className="grid gap-3 pb-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          }}
        >
          {brandColors.map((color, index) => {
            const family = familyMap.get(color.id);
            const hasAdjustments =
              color.hueShift !== 0 ||
              color.saturationShift !== 0 ||
              color.lightnessShift !== 0;
            const adjustedHex = family?.adjustedHex ?? color.hex;

            return (
              <div key={color.id} className="min-w-0 flex flex-col">
                <BrandColorCard
                  color={color}
                  index={index}
                  bgIsLight={bgIsLight}
                  hasAdjustments={hasAdjustments}
                  adjustedHex={adjustedHex}
                  canRemove={brandColors.length > 1}
                  baseOklch={family?.baseOklch ?? null}
                  onColorChange={onColorChange}
                  onNameChange={onNameChange}
                  onAdjustmentsChange={onAdjustmentsChange}
                  onRemove={onRemoveColor}
                />
              </div>
            );
          })}
          {/* Add Color card */}
          <div className="min-w-0 flex flex-col">
            <button
              onClick={onAddColor}
              className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[110px] h-full transition-colors ${
                bgIsLight
                  ? "border-black/15 text-black/40 hover:border-black/30 hover:text-black/60 hover:bg-black/[0.03]"
                  : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
              title="Add a new source color"
            >
              <span className="text-2xl font-light leading-none">+</span>
              <span className="text-[10px] uppercase tracking-wider font-medium">
                Add Color
              </span>
            </button>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
