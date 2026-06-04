import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WorldCup26 referral invite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function LoginOpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 64,
          background: "linear-gradient(135deg, #061611 0%, #0d5f45 48%, #f0c060 140%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 36,
            padding: 54,
            background:
              "radial-gradient(circle at 82% 18%, rgba(255,226,154,0.34), transparent 26%), rgba(4,18,15,0.56)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div
                style={{
                  width: 82,
                  height: 82,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
                  background: "linear-gradient(180deg, #ffe29a, #e7b24e)",
                }}
              >
                <svg
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#08251b"
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 40, fontWeight: 900 }}>WorldCup26</div>
                <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.74)" }}>
                  Prediction leaderboard
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                padding: "12px 18px",
                borderRadius: 999,
                color: "#08251b",
                background: "#ffe29a",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              Referral invite
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", maxWidth: 850, fontSize: 76, lineHeight: 0.95, fontWeight: 950 }}>
              Pick 3 teams. Climb the World Cup leaderboard.
            </div>
            <div style={{ display: "flex", maxWidth: 760, fontSize: 30, color: "rgba(255,255,255,0.82)" }}>
              Join with your invite link before FIFA World Cup 2026.
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            {["Use invite code", "Track your rank", "Top places paid"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
