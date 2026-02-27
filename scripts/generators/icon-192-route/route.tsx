import { ImageResponse } from "next/og";

const SIZE = 192;
const COLORS = ["#6366f1", "#8b5cf6", "#14b8a6", "#22c55e", "#f97316", "#f43f5e"];

export async function GET() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: SIZE * 0.66,
            height: SIZE * 0.66,
          }}
        >
          {COLORS.map((color, i) => {
            const angle = (i / COLORS.length) * Math.PI * 2 - Math.PI / 2;
            const r = SIZE * 0.22;
            const dotSize = SIZE * 0.16;
            const cx = (SIZE * 0.66) / 2;
            const x = cx + r * Math.cos(angle) - dotSize / 2;
            const y = cx + r * Math.sin(angle) - dotSize / 2;
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
    { width: SIZE, height: SIZE },
  );
}
