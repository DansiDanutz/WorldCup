-- Scope per-entry match points to the owning player.
--
-- Audit finding M-1 (docs/AUDIT_2026-06-02.md): worldcup_entry_match_points was
-- readable by anyone holding the anon key, exposing every competitor's per-match
-- awarded points, coefficients and final_points. The table is never read
-- directly by the application -- the
-- leaderboard is served through owner-privileged views that aggregate it -- so
-- restricting the direct read policy to the owning player does not change any
-- application behaviour. Writes remain locked to the SECURITY DEFINER point
-- functions (there is no INSERT/UPDATE/DELETE policy).

drop policy if exists "worldcup_entry_match_points_read" on public.worldcup_entry_match_points;

create policy "worldcup_entry_match_points_owner_read"
on public.worldcup_entry_match_points
for select
to authenticated
using (
  exists (
    select 1
    from public.worldcup_entries e
    where e.id = worldcup_entry_match_points.entry_id
      and e.user_id = auth.uid()
  )
);
