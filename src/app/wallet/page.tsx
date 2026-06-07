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
  missing: ["account setup window"],
  message: "Account setup is open until June 18, 2026.",
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
