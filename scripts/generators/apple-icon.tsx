import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — colour wheel dots on dark background.
 */
export default function AppleIcon() {
  const colors = ["#6366f1", "#8b5cf6", "#14b8a6", "#22c55e", "#f97316", "#f43f5e"];

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
          borderRadius: "40px",
        }}
      >
        <div style={{ display: "flex", position: "relative", width: 120, height: 120 }}>
          {colors.map((color, i) => {
            const angle = (i / colors.length) * Math.PI * 2 - Math.PI / 2;
            const r = 42;
            const dotSize = 28;
            const x = 60 + r * Math.cos(angle) - dotSize / 2;
            const y = 60 + r * Math.sin(angle) - dotSize / 2;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  backgroundColor: color,
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
