"use client";

import { useMemo } from "react";
import type { ShadeFamily } from "@/lib/types";
import { oklchToHex } from "@/lib/color-conversions";

interface ColorWheelProps {
  families: ShadeFamily[];
  bgIsLight: boolean;
}

// SVG dimensions — extra padding around the wheel for labels
const PADDING = 60;
const WHEEL_SIZE = 240;
const SIZE = WHEEL_SIZE + PADDING * 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = WHEEL_SIZE / 2; // 120
const R_INNER = R_OUTER * 0.68; // ~82
const SEGMENTS = 72;
const DEG_PER_SEG = 360 / SEGMENTS;
const MAX_CHROMA = 0.37;
const CHROMA_THRESHOLD = 0.01; // below this, color is achromatic — skip on wheel

/** Convert polar coordinates to SVG cartesian. Hue 0 = top (12 o'clock). */
function polar(
  cx: number,
  cy: number,
  r: number,
  deg: number,
): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Build an SVG arc segment path between two angles at inner/outer radii. */
function arcPath(startDeg: number, endDeg: number): string {
  const os = polar(CX, CY, R_OUTER, startDeg);
  const oe = polar(CX, CY, R_OUTER, endDeg);
  const ie = polar(CX, CY, R_INNER, endDeg);
  const is_ = polar(CX, CY, R_INNER, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${os.x} ${os.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${is_.x} ${is_.y}`,
    "Z",
  ].join(" ");
}

/** Map chroma to a visual radius within the ring band. */
function chromaRadius(c: number): number {
  const t = Math.min(c / MAX_CHROMA, 1);
  return R_INNER + t * (R_OUTER - R_INNER);
}

/** Get dot position from hue and chroma. */
function dotPos(h: number, c: number): { x: number; y: number } {
  return polar(CX, CY, chromaRadius(c), h);
}

type TextAnchor = "start" | "middle" | "end";

/** Compute label position and text-anchor based on hue angle. */
function labelPos(
  h: number,
  c: number,
  nudge: number,
): { x: number; y: number; anchor: TextAnchor } {
  const dotR = chromaRadius(c);
  const r = Math.max(dotR + 12, R_OUTER + 8) + nudge;
  const pt = polar(CX, CY, r, h);
  const norm = ((h % 360) + 360) % 360;
  let anchor: TextAnchor = "middle";
  if (norm > 15 && norm < 165) anchor = "start";
  if (norm > 195 && norm < 345) anchor = "end";
  return { x: pt.x, y: pt.y, anchor };
}

export default function ColorWheel({ families, bgIsLight }: ColorWheelProps) {
  // Pre-compute the 72 ring segment colors (never changes)
  const ringSegments = useMemo(() => {
    const segments: { d: string; color: string }[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const hue = i * DEG_PER_SEG;
      segments.push({
        d: arcPath(hue, hue + DEG_PER_SEG),
        color: oklchToHex(0.7, 0.15, hue),
      });
    }
    return segments;
  }, []);

  // Filter to families with meaningful chroma (skip achromatic)
  const chromaFamilies = useMemo(
    () => families.filter((f) => f.adjustedOklch.c >= CHROMA_THRESHOLD),
    [families],
  );

  // Compute dot data for each family on the wheel
  const colorData = useMemo(() => {
    // Sort by hue to detect label proximity
    const sorted = [...chromaFamilies].sort(
      (a, b) => a.adjustedOklch.h - b.adjustedOklch.h,
    );

    return sorted.map((family, i) => {
      const hasAdj =
        family.brand.hueShift !== 0 ||
        family.brand.saturationShift !== 0 ||
        family.brand.lightnessShift !== 0;

      const adj = dotPos(family.adjustedOklch.h, family.adjustedOklch.c);
      // Only show source dot if base also has chroma
      const showSource = hasAdj && family.baseOklch.c >= CHROMA_THRESHOLD;
      const src = showSource
        ? dotPos(family.baseOklch.h, family.baseOklch.c)
        : null;

      // Nudge label outward if previous color's hue is within 25 degrees
      let nudge = 0;
      if (i > 0) {
        const prevH = sorted[i - 1].adjustedOklch.h;
        const delta = Math.abs(family.adjustedOklch.h - prevH);
        if (delta < 25) nudge = 12;
      }

      const label = labelPos(
        family.adjustedOklch.h,
        family.adjustedOklch.c,
        nudge,
      );

      return { family, hasAdj, adj, src, label };
    });
  }, [chromaFamilies]);

  const dotStroke = bgIsLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)";
  const dimStroke = bgIsLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.3)";
  const labelFill = bgIsLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.75)";
  const centerFill = bgIsLight ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";

  // Don't render if no chromatic colors
  if (colorData.length === 0) return null;

  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-auto"
        role="img"
        aria-label="Color wheel showing brand color positions by hue and chroma"
      >
        {/* Center fill for clean donut look */}
        <circle cx={CX} cy={CY} r={R_INNER - 1} fill={centerFill} />

        {/* Hue ring (72 arc segments) */}
        {ringSegments.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            fill={seg.color}
            stroke={seg.color}
            strokeWidth={0.5}
          />
        ))}

        {/* Connecting lines: source -> adjusted */}
        {colorData
          .filter((d) => d.src)
          .map((d) => (
            <line
              key={`line-${d.family.brand.id}`}
              x1={d.src!.x}
              y1={d.src!.y}
              x2={d.adj.x}
              y2={d.adj.y}
              stroke={d.family.adjustedHex}
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.5}
            />
          ))}

        {/* Source dots (dimmed) */}
        {colorData
          .filter((d) => d.src)
          .map((d) => (
            <circle
              key={`src-${d.family.brand.id}`}
              cx={d.src!.x}
              cy={d.src!.y}
              r={4}
              fill={d.family.brand.hex}
              stroke={dimStroke}
              strokeWidth={1}
              opacity={0.4}
            />
          ))}

        {/* Adjusted dots */}
        {colorData.map((d) => (
          <circle
            key={`adj-${d.family.brand.id}`}
            cx={d.adj.x}
            cy={d.adj.y}
            r={6}
            fill={d.family.adjustedHex}
            stroke={dotStroke}
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {colorData.map((d) => (
          <text
            key={`label-${d.family.brand.id}`}
            x={d.label.x}
            y={d.label.y}
            textAnchor={d.label.anchor}
            dominantBaseline="central"
            fill={labelFill}
            fontSize={9}
            fontWeight={600}
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {d.family.brand.name}
          </text>
        ))}
      </svg>
    </div>
  );
}
