import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "ticket-purchase", { limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Sign in with Google first.", 401);
  }

  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return jsonError("Invalid session.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  return jsonError(
    "Tickets are assigned manually by Admin after cash or USDT payment is verified.",
    403,
  );
}
