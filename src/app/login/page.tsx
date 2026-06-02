import { LoginRegister } from "@/components/login-register";
import { getPublicPaidActionGates } from "@/lib/paid-action-gates";
import { createServiceSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const publicPaidActionGates = await getPublicPaidActionGates(createServiceSupabaseClient());

  return (
    <LoginRegister
      publicPaidActionGates={publicPaidActionGates}
    />
  );
}
