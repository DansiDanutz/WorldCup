import { Dashboard } from "@/components/dashboard";
import { getDashboardData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();

  return <Dashboard {...data} />;
}
