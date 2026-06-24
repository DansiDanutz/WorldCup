import Link from "next/link";

import { AdminConsole } from "@/components/admin-console";
import { getDashboardData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { tournament, teams, matches, dueMatches } = await getDashboardData();

  return (
    <>
      <Link
        aria-label="Open account leaderboard audit"
        href="/admin/account-entry-audit"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 60,
          border: "1px solid rgba(16, 107, 79, 0.28)",
          borderRadius: 8,
          padding: "12px 14px",
          color: "#062019",
          background: "#f3c85d",
          boxShadow: "0 14px 30px rgba(17, 43, 36, 0.18)",
          fontWeight: 800,
          textDecoration: "none",
        }}
      >
        Account audit
      </Link>
      <AdminConsole tournament={tournament} teams={teams} matches={matches} dueMatches={dueMatches} />
    </>
  );
}
