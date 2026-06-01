-- Cross-instance rate limiting.
--
-- The application-layer limiter is per-process, which is ineffective on a
-- serverless runtime where each request may hit a fresh instance. This adds an
-- atomic fixed-window counter shared by all instances. The app keeps the
-- in-memory limiter only as a fallback when this function is unavailable.

create table if not exists public.worldcup_rate_limits (
  key text primary key,
  count integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table public.worldcup_rate_limits enable row level security;
-- No policies: only the service role (and the SECURITY DEFINER function) touch
-- this table.

create or replace function public.worldcup_rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz := v_now - make_interval(secs => p_window_seconds);
  v_count integer;
begin
  -- Single atomic upsert: reset the counter when the current window has
  -- elapsed, otherwise increment it. The on-conflict path locks the row, so
  -- concurrent requests cannot race the counter.
  insert into public.worldcup_rate_limits (key, count, window_started_at)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set
      count = case
        when public.worldcup_rate_limits.window_started_at < v_window_start then 1
        else public.worldcup_rate_limits.count + 1
      end,
      window_started_at = case
        when public.worldcup_rate_limits.window_started_at < v_window_start then v_now
        else public.worldcup_rate_limits.window_started_at
      end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;
