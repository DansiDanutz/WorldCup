import { WalletScreen } from "@/components/wallet-screen";
import type { PaidActionGates } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wallet & Deposits",
};

export default function WalletPage() {
  return (
    <WalletScreen
      publicPaidActionGates={WALLET_ACCOUNT_SETUP_GATES}
    />
  );
}

const accountSetupGate = {
  allowed: false,
  missing: ["paid launch"],
  message: "Free account setup is open. Paid actions are not live yet.",
};

const WALLET_ACCOUNT_SETUP_GATES: PaidActionGates = {
  deposit: accountSetupGate,
  ticket: accountSetupGate,
  entry: {
    allowed: true,
    missing: [],
    message: null,
  },
  withdrawal: {
    allowed: true,
    missing: [],
    message: null,
  },
};
