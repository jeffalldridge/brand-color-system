import { ImageResponse } from "next/og";

export const alt = "Brand Color Explorer — OKLCH shade generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OG image rendered at build time.
 * Shows a grid of colour swatches that conveys "color tool" at a glance.
 */
export default function OgImage() {
  // Representative palette – 7 hues × 5 lightness stops
  const hues = [250, 280, 180, 145, 30, 350, 210]; // blue, purple, teal, green, orange, rose, slate
  const stops = [0.3, 0.45, 0.6, 0.75, 0.9]; // OKLCH lightness approximations

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          padding: "48px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Title area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Brand Color Explorer
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 400,
            }}
          >
            Perceptually uniform shade families in OKLCH
          </div>
        </div>

        {/* Swatch grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
          }}
        >
          {hues.map((h, ri) => (
            <div key={ri} style={{ display: "flex", gap: "6px", flex: 1 }}>
              {stops.map((l, ci) => {
                // Convert OKLCH-ish values to rough HSL for ImageResponse
                // (ImageResponse doesn't support oklch())
                const saturation = 70 + (l - 0.5) * -30;
                const lightness = Math.round(l * 100);
                return (
                  <div
                    key={ci}
                    style={{
                      flex: 1,
                      borderRadius: "8px",
                      backgroundColor: `hsl(${h}, ${saturation}%, ${lightness}%)`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
          }}
        >
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }}>
            OKLCH · sRGB · Display P3 · CSS · Tailwind · Design Tokens
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
