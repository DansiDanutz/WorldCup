-- Function execution lockdown — closes the PostgREST "side door" on privileged RPCs.
--
-- Audit findings addressed (see docs/AUDIT_2026-06-02.md): C-1, C-2, H-1.
--
-- Problem: every worldcup_* routine is defined in the `public` schema, so by
-- default Postgres grants EXECUTE to PUBLIC and PostgREST exposes each one as
-- POST /rest/v1/rpc/<name>. Several are SECURITY DEFINER and derive the acting
-- user from a PARAMETER rather than auth.uid() (the legitimate caller is the
-- trusted server, acting on a verified user's behalf via the service role):
--   * worldcup_wallet_transfer(p_from_user_id, p_to_user_id, ...)  -> could move
--     balances between arbitrary accounts.
--   * worldcup_create_entry(p_user_id, ...)                        -> could forge
--     entries and skip the API-layer age/consent and ticket gates.
-- With no REVOKE anywhere in the migration history, those functions are callable
-- directly with the public anon key, bypassing the Next.js authorization layer.
--
-- Fix: restrict EXECUTE on public functions to the service_role only. The app
-- only ever calls these RPCs through the service-role client
-- (src/lib/supabase.ts -> createServiceSupabaseClient); the browser Supabase
-- client never calls .rpc() and never writes worldcup_* tables directly, so this
-- does not affect legitimate traffic. uuid_generate_v4()/gen_random_uuid()
-- column defaults keep working because inserts run as the service role or inside
-- a SECURITY DEFINER owner context, both of which retain EXECUTE below.

-- 1. Remove the implicit PUBLIC grant (and any explicit anon/authenticated grant)
--    from all existing functions in the schema.
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon, authenticated;

-- 2. Keep the trusted server role fully functional.
grant execute on all functions in schema public to service_role;

-- 3. Stop functions added to this schema in the future from silently defaulting
--    to PUBLIC execute (prevents this class of bug from recurring). New routines
--    that genuinely need anon/authenticated access must grant it explicitly.
alter default privileges in schema public revoke execute on functions from public;

-- 4. Remove a dead, unguarded privilege-escalation routine. worldcup_finalize_entry
--    is SECURITY DEFINER, flips ANY entry to status='locked' purely by id with no
--    ownership check, and is no longer called by the application (superseded by
--    worldcup_create_entry, which locks atomically on creation).
drop function if exists public.worldcup_finalize_entry(uuid);
