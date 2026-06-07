import { ImageResponse } from "next/og";

// Branded social-share card. The product is referral-driven (WhatsApp / link
// shares), so a clean on-brand preview is part of the core UX.
export const runtime = "edge";
export const alt = "WorldCup — Predict the Game · WorldCup26";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(160deg, #0e5f46, #106b4f)",
          color: "#ffffff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="54"
              height="54"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#106b4f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 800, letterSpacing: -1 }}>
            WorldCup
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 58, fontWeight: 800 }}>
            <span style={{ display: "flex" }}>Predict the Game ·&nbsp;</span>
            <span style={{ display: "flex", color: "#f0c060" }}>WorldCup26</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.85)" }}>
            Pick 3 teams free. Track your private points preview.
          </div>
        </div>

        <div style={{ display: "flex", gap: 36, fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
          <div style={{ display: "flex" }}>48 teams</div>
          <div style={{ display: "flex" }}>104 matches</div>
          <div style={{ display: "flex" }}>Coefficients 1.00–3.00</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
