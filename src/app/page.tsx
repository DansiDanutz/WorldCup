import { Dashboard } from "@/components/dashboard";
import { DashboardMatchScheduleUpgrade } from "@/components/dashboard-match-schedule-upgrade";
import { LegendCardsPromo } from "@/components/legend-cards-promo";
import { getPublicPaidActionGates } from "@/lib/paid-action-gates";
import { createServerReadSupabaseClient } from "@/lib/supabase";
import { getDashboardData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerReadSupabaseClient();
  const [data, publicPaidActionGates] = await Promise.all([
    getDashboardData(),
    getPublicPaidActionGates(supabase),
  ]);

  return (
    <>
      <Dashboard
        {...data}
        publicPaidActionGates={publicPaidActionGates}
      />
      <LegendCardsPromo />
      <DashboardMatchScheduleUpgrade
        matches={data.matches}
        stages={data.stages}
        teams={data.teams}
      />
    </>
  );
}
