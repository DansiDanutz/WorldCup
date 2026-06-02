import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv, requireEnv } from "@/lib/env";

let browserSupabaseClient: ReturnType<typeof createClient> | null = null;

export function createPublicSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createBrowserSupabaseClient() {
  if (browserSupabaseClient) {
    return browserSupabaseClient;
  }

  const { url, anonKey } = getPublicSupabaseEnv();

  browserSupabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  return browserSupabaseClient;
}

export function createServerReadSupabaseClient() {
  const { url } = getPublicSupabaseEnv();

  return createSupabaseClient(url, getServerReadSupabaseKey());
}

export function createServiceSupabaseClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createSupabaseClient(url, serviceRoleKey);
}

function createSupabaseClient(url: string, key: string) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getServerReadSupabaseKey(
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    return env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (env.VERCEL_ENV === "production") {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
