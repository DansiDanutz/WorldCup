import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getServerReadSupabaseKey } from "@/lib/supabase";

describe("server Supabase env selection", () => {
  it("keeps service-role access preferred when configured", () => {
    assert.equal(
      getServerReadSupabaseKey({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        VERCEL_ENV: "preview",
      }),
      "service-role-key",
    );
  });

  it("lets preview read-only pages fall back to anon Supabase access", () => {
    assert.equal(
      getServerReadSupabaseKey({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        VERCEL_ENV: "preview",
      }),
      "anon-key",
    );
  });

  it("still requires the service role in production", () => {
    assert.throws(
      () =>
        getServerReadSupabaseKey({
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
          VERCEL_ENV: "production",
        }),
      /SUPABASE_SERVICE_ROLE_KEY/,
    );
  });
});
