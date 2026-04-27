import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BookEasy - Réservez vos rendez-vous en Polynésie française";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0C1B2A 0%, #132D46 50%, #0066FF 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0066FF, #00B4D8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "white",
              }}
            >
              Book
            </span>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 800,
                background: "linear-gradient(90deg, #0066FF, #00B4D8)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Easy
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "900px",
            marginBottom: "20px",
          }}
        >
          Réservez vos rendez-vous en ligne
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Coiffeurs, spas, tatoueurs et plus en Polynésie française
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, #0066FF, #00B4D8, #0066FF)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
