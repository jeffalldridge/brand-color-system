import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Dynamic favicon — a miniature colour wheel suggesting OKLCH palette tool.
 */
export default function Icon() {
  const segments = [
    { color: "#6366f1", rotate: 0 },   // indigo
    { color: "#8b5cf6", rotate: 60 },   // purple
    { color: "#14b8a6", rotate: 120 },  // teal
    { color: "#22c55e", rotate: 180 },  // green
    { color: "#f97316", rotate: 240 },  // orange
    { color: "#f43f5e", rotate: 300 },  // rose
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          borderRadius: "6px",
        }}
      >
        {/* Simplified colour dots in a ring */}
        <div style={{ display: "flex", position: "relative", width: 24, height: 24 }}>
          {segments.map((s, i) => {
            const angle = (i / segments.length) * Math.PI * 2 - Math.PI / 2;
            const r = 9;
            const x = 12 + r * Math.cos(angle) - 3;
            const y = 12 + r * Math.sin(angle) - 3;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: s.color,
                }}
              />
            );
          })}
        </div>
      </div>
    ),
    { ...size },
  );
}
