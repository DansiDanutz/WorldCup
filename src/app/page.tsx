import { Dashboard } from "@/components/dashboard";
import { getPublicPaidActionGates } from "@/lib/paid-action-gates";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getDashboardData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServiceSupabaseClient();
  const [data, publicPaidActionGates] = await Promise.all([
    getDashboardData(),
    getPublicPaidActionGates(supabase),
  ]);

  return (
    <Dashboard
      {...data}
      publicPaidActionGates={publicPaidActionGates}
    />
  );
}
