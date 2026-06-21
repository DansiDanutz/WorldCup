import type { Metadata } from "next";
import Link from "next/link";

import { KickoffCountdown } from "@/components/kickoff-countdown";

// First whistle: Mexico vs South Africa, Estadio Azteca, June 11 2026, 13:00 UTC-6.
const FIRST_KICKOFF_AT = "2026-06-11T19:00:00.000Z";

export const metadata: Metadata = {
  title: "World Cup 2026 Prediction Game · WorldCup26",
  description:
    "Pick 3 teams before the FIFA World Cup 2026 kicks off on June 11. Compete against football fans worldwide and climb the global leaderboard.",
  openGraph: {
    title: "World Cup 2026 Prediction Game · WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 kicks off on June 11. Compete against football fans worldwide and climb the global leaderboard.",
    url: "/play",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Prediction Game · WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 kicks off on June 11. Compete against football fans worldwide and climb the global leaderboard.",
  },
};

const TEAMS = [
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "England" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇺🇸", name: "USA" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pick 3 Teams",
    desc: "Choose your 3 teams before the World Cup kicks off on June 11.",
  },
  {
    step: "2",
    title: "Earn Points",
    desc: "Your teams earn points for every win, draw, and goal scored throughout the tournament.",
  },
  {
    step: "3",
    title: "Climb the Leaderboard",
    desc: "Compete against football fans worldwide. The best predictions rise to the top.",
  },
];

export default function PlayPage() {
  return (
    <main style={{ fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)", background: "var(--background, #f7faf9)", color: "var(--text, #0c1d1a)", minHeight: "100vh", margin: 0, padding: 0 }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--green, #106b4f)", letterSpacing: "-0.02em" }}>WorldCup26</span>
        </Link>
        <Link
          href="/login"
          style={{
            background: "var(--green, #106b4f)",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Play Free
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "60px 24px 48px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{
          display: "inline-block",
          background: "var(--green-soft, #e5f3ee)",
          color: "var(--green, #106b4f)",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "6px 14px",
          borderRadius: 999,
          marginBottom: 20,
        }}>
          ⚽ World Cup 2026 — Starts June 11
        </div>

        <h1 style={{
          font: "800 clamp(36px, 6vw, 64px)/1 var(--font-sans, Inter, sans-serif)",
          margin: "0 0 20px",
          letterSpacing: "-0.03em",
          color: "var(--text, #0c1d1a)",
        }}>
          The Ultimate<br />
          <span style={{ color: "var(--green, #106b4f)" }}>Football Prediction</span><br />
          Challenge
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2.5vw, 20px)",
          color: "var(--muted, #5d6f69)",
          lineHeight: 1.6,
          margin: "0 auto 36px",
          maxWidth: 560,
        }}>
          Pick 3 teams before the FIFA World Cup 2026 kicks off.
          Earn points as your teams progress. Compete against football fans worldwide.
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "var(--green, #106b4f)",
            color: "#fff",
            padding: "16px 40px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 18,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            boxShadow: "0 8px 32px rgba(16,107,79,0.25)",
          }}
        >
          Join the Challenge →
        </Link>

        <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted, #5d6f69)" }}>
          Kicks off June 11 · 104 matches · 48 nations
        </p>
      </section>

      {/* COUNTDOWN */}
      <section style={{ maxWidth: 760, margin: "0 auto 48px", padding: "0 24px" }}>
        <KickoffCountdown kickoffAt={FIRST_KICKOFF_AT} ctaHref="/login" />
      </section>

      {/* TEAM GRID */}
      <section style={{ maxWidth: 760, margin: "0 auto 56px", padding: "0 24px" }}>
        <p style={{ textAlign: "center", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted, #5d6f69)", marginBottom: 20 }}>
          48 Nations Competing
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}>
          {TEAMS.map((t) => (
            <div
              key={t.name}
              style={{
                background: "#fff",
                border: "1.5px solid var(--border, #d8e3df)",
                borderRadius: 12,
                padding: "16px 12px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(17,43,36,0.04)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{t.flag}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text, #0c1d1a)" }}>{t.name}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted, #5d6f69)", marginTop: 14 }}>
          + 40 more nations
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--border, #d8e3df)", borderBottom: "1px solid var(--border, #d8e3df)", padding: "56px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontWeight: 800, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green, #106b4f)", marginBottom: 8 }}>
            How It Works
          </p>
          <h2 style={{ textAlign: "center", font: "800 clamp(24px, 4vw, 36px)/1.1 var(--font-sans, Inter, sans-serif)", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
            Simple. Competitive. Free to join.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--green-soft, #e5f3ee)",
                  color: "var(--green, #106b4f)",
                  fontWeight: 800,
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 17, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--muted, #5d6f69)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 }}>
          {[
            { value: "48", label: "Nations" },
            { value: "104", label: "Matches" },
            { value: "3", label: "Picks per player" },
            { value: "Free", label: "Entry" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "#fff",
              border: "1.5px solid var(--border, #d8e3df)",
              borderRadius: 12,
              padding: "24px 16px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(17,43,36,0.04)",
            }}>
              <div style={{ fontWeight: 800, fontSize: 32, color: "var(--green, #106b4f)", letterSpacing: "-0.02em", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "var(--muted, #5d6f69)", marginTop: 6, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "48px 24px 80px", maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ font: "800 clamp(26px, 4vw, 40px)/1.1 var(--font-sans, Inter, sans-serif)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Ready to predict the winners?
        </h2>
        <p style={{ fontSize: 16, color: "var(--muted, #5d6f69)", margin: "0 0 32px", lineHeight: 1.6 }}>
          The World Cup starts June 11. Pick your 3 teams before kick-off and compete against fans worldwide.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "var(--green, #106b4f)",
            color: "#fff",
            padding: "16px 44px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 18,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            boxShadow: "0 8px 32px rgba(16,107,79,0.25)",
          }}
        >
          Start Predicting →
        </Link>
        <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted, #5d6f69)" }}>
          Free to join · No card needed · Takes 2 minutes
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border, #d8e3df)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--muted, #5d6f69)", margin: 0 }}>
          © 2026 WorldCup26 ·{" "}
          <Link href="/terms" style={{ color: "var(--muted, #5d6f69)" }}>Terms</Link>
          {" · "}
          <Link href="/privacy" style={{ color: "var(--muted, #5d6f69)" }}>Privacy</Link>
        </p>
      </footer>
    </main>
  );
}
