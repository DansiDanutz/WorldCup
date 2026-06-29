import { AdminConsole } from "@/components/admin-console";
import { getDashboardData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { tournament, teams, matches, dueMatches } = await getDashboardData();

  return (
    <AdminConsole tournament={tournament} teams={teams} matches={matches} dueMatches={dueMatches} />
  );
}
