-- Prize payout settlement.
--
-- Turns the leaderboard + prize pool into an auditable set of payout records
-- and matching wallet credits. Referred winners owe their inviter the agreed
-- percentage, so each winning place is split into a prize credit (net of any
-- referral owed) and a referral credit to the inviter. Idempotent: re-running
-- never double-pays because payout rows are uniquely keyed and wallet credits
-- are only written alongside a newly inserted payout row.

create table if not exists public.worldcup_payouts (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  entry_id uuid references public.worldcup_entries(id) on delete set null,
  user_id uuid not null,
  payout_type text not null check (payout_type in ('prize', 'referral')),
  rank integer,
  amount numeric(12,2) not null check (amount > 0),
  wallet_transaction_id uuid references public.worldcup_wallet_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tournament_id, payout_type, entry_id, user_id)
);

create index if not exists worldcup_payouts_tournament_idx
  on public.worldcup_payouts (tournament_id, rank);
create index if not exists worldcup_payouts_user_idx
  on public.worldcup_payouts (user_id);

alter table public.worldcup_payouts enable row level security;

drop policy if exists "worldcup_payouts_owner_read" on public.worldcup_payouts;
create policy "worldcup_payouts_owner_read"
on public.worldcup_payouts for select to public
using (auth.uid() = user_id);

create or replace function public.worldcup_settle_payouts(p_tournament_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_gross numeric;
  v_fee numeric;
  v_net_cents bigint;
  v_participants integer;
  v_paid_places integer;
  v_weights integer[] := array[35, 20, 13, 9, 7, 5, 4, 3, 2, 2];
  v_total_weight integer := 0;
  v_allocated_cents bigint := 0;
  v_created integer := 0;
  v_place_cents bigint;
  v_referral_cents bigint;
  v_prize_cents bigint;
  v_tx_id uuid;
  r record;
  i integer;
begin
  select status, prize_pool_amount, prize_pool_fee_percent
  into v_status, v_gross, v_fee
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if v_status is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  if v_status <> 'completed' then
    raise exception 'TOURNAMENT_NOT_COMPLETED';
  end if;

  if v_gross is null or v_gross <= 0 then
    raise exception 'PRIZE_POOL_NOT_SET';
  end if;

  v_net_cents := round(v_gross * (1 - coalesce(v_fee, 0) / 100) * 100);

  select count(*) into v_participants
  from public.worldcup_entries
  where tournament_id = p_tournament_id and status = 'locked';

  if v_participants = 0 then
    return 0;
  end if;

  if v_participants >= 100 then
    v_paid_places := 10;
  else
    v_paid_places := greatest(1, ceil(v_participants * 0.10)::integer);
  end if;

  v_paid_places := least(v_paid_places, array_length(v_weights, 1), v_participants);

  for i in 1 .. v_paid_places loop
    v_total_weight := v_total_weight + v_weights[i];
  end loop;

  for r in
    select
      ranked.entry_id,
      ranked.user_id,
      ranked.position
    from (
      select
        e.id as entry_id,
        e.user_id,
        row_number() over (
          order by coalesce(lb.total_points, 0) desc, e.locked_at asc nulls last, e.id
        ) as position
      from public.worldcup_entries e
      left join public.worldcup_awarded_leaderboard lb on lb.entry_id = e.id
      where e.tournament_id = p_tournament_id and e.status = 'locked'
    ) ranked
    where ranked.position <= v_paid_places
    order by ranked.position
  loop
    if r.position = v_paid_places then
      v_place_cents := v_net_cents - v_allocated_cents;
    else
      v_place_cents := round(v_net_cents * v_weights[r.position]::numeric / v_total_weight);
    end if;

    v_allocated_cents := v_allocated_cents + v_place_cents;

    if r.user_id is null or v_place_cents <= 0 then
      continue;
    end if;

    -- Referral owed to the inviter of this winning entry, if any.
    v_referral_cents := 0;
    declare
      v_inviter uuid;
      v_fee_percent numeric;
    begin
      select inviter_user_id, referral_fee_percent
      into v_inviter, v_fee_percent
      from public.worldcup_referrals
      where tournament_id = p_tournament_id and entry_id = r.entry_id;

      if v_inviter is not null and v_fee_percent is not null then
        v_referral_cents := floor(v_place_cents * v_fee_percent / 100);

        if v_referral_cents > 0 then
          insert into public.worldcup_payouts (tournament_id, entry_id, user_id, payout_type, rank, amount)
          values (p_tournament_id, r.entry_id, v_inviter, 'referral', r.position, v_referral_cents / 100.0)
          on conflict (tournament_id, payout_type, entry_id, user_id) do nothing;

          if found then
            insert into public.worldcup_wallet_transactions
              (tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by)
            values
              (p_tournament_id, null, v_inviter, v_referral_cents / 100.0, 'referral_payout',
               'Referral share of rank ' || r.position || ' prize', 'settlement')
            returning id into v_tx_id;

            update public.worldcup_payouts
            set wallet_transaction_id = v_tx_id
            where tournament_id = p_tournament_id and payout_type = 'referral'
              and entry_id = r.entry_id and user_id = v_inviter;

            v_created := v_created + 1;
          end if;
        end if;
      end if;
    end;

    v_prize_cents := v_place_cents - v_referral_cents;

    if v_prize_cents > 0 then
      insert into public.worldcup_payouts (tournament_id, entry_id, user_id, payout_type, rank, amount)
      values (p_tournament_id, r.entry_id, r.user_id, 'prize', r.position, v_prize_cents / 100.0)
      on conflict (tournament_id, payout_type, entry_id, user_id) do nothing;

      if found then
        insert into public.worldcup_wallet_transactions
          (tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by)
        values
          (p_tournament_id, null, r.user_id, v_prize_cents / 100.0, 'prize_payout',
           'Prize for rank ' || r.position, 'settlement')
        returning id into v_tx_id;

        update public.worldcup_payouts
        set wallet_transaction_id = v_tx_id
        where tournament_id = p_tournament_id and payout_type = 'prize'
          and entry_id = r.entry_id and user_id = r.user_id;

        v_created := v_created + 1;
      end if;
    end if;
  end loop;

  return v_created;
end;
$$;
