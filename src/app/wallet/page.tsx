import { WalletScreen } from "@/components/wallet-screen";
import { getPublicPaidActionGates } from "@/lib/paid-action-gates";
import { createServerReadSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wallet & Deposits",
};

export default async function WalletPage() {
  const publicPaidActionGates = await getPublicPaidActionGates(createServerReadSupabaseClient());

  return (
    <WalletScreen
      publicPaidActionGates={publicPaidActionGates}
    />
  );
}
