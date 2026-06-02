import { LoginRegister } from "@/components/login-register";
import { getPublicPaidActionGates } from "@/lib/paid-action-gates";
import { createServerReadSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const publicPaidActionGates = await getPublicPaidActionGates(createServerReadSupabaseClient());

  return (
    <LoginRegister
      publicPaidActionGates={publicPaidActionGates}
    />
  );
}
