insert into public.worldcup_agents (
  tournament_id,
  user_id,
  email,
  display_name,
  active,
  created_by,
  updated_at
)
select
  t.id,
  p.user_id,
  p.email,
  p.display_name,
  true,
  'owner-bootstrap',
  now()
from public.worldcup_tournaments t
join public.worldcup_referral_profiles p
  on lower(p.email) = 'semebitcoin@gmail.com'
where t.slug = 'fifa-world-cup-2026'
on conflict (tournament_id, user_id)
do update set
  email = excluded.email,
  display_name = excluded.display_name,
  active = true,
  updated_at = now();
