-- Make entry creation and wallet transfers atomic and race-safe.
--
-- Previously the API route created an entry, inserted picks, finalized, then
-- consumed a ticket as separate calls; a mid-sequence failure left partial
-- state, and concurrent requests could each see the same "available" ticket.
-- Wallet transfers computed the balance in application code with no lock, so
-- two concurrent transfers could double-spend.

-- Allow settlement transactions in the ledger ------------------------------
alter table public.worldcup_wallet_transactions
  drop constraint if exists worldcup_wallet_transactions_transaction_type_check;

alter table public.worldcup_wallet_transactions
  add constraint worldcup_wallet_transactions_transaction_type_check
  check (transaction_type in ('transfer', 'admin_credit', 'admin_debit', 'prize_payout', 'referral_payout'));

-- Atomic, ticket-gated entry creation --------------------------------------
create or replace function public.worldcup_create_entry(
  p_user_id uuid,
  p_tournament_id uuid,
  p_display_name text,
  p_team_ids text[],
  p_referral_code text,
  p_referrer_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_ticket_id uuid;
  v_entry_id uuid;
  v_inviter_percent integer;
  v_team_id text;
  v_slot integer;
begin
  if array_length(p_team_ids, 1) is distinct from 3 then
    raise exception 'INVALID_TEAM_COUNT';
  end if;

  -- Serialize per user+tournament so a player cannot consume two tickets or
  -- create two entries through concurrent requests.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_tournament_id::text));

  select status into v_status
  from public.worldcup_tournaments
  where id = p_tournament_id
  for share;

  if v_status is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  -- Late entries remain open while teams are still selectable (enforced
  -- per-team by the pick-cutoff trigger). Only fully closed states block.
  if v_status not in ('open', 'in_progress') then
    raise exception 'TEAM_SELECTION_CLOSED';
  end if;

  select id into v_ticket_id
  from public.worldcup_tickets
  where tournament_id = p_tournament_id
    and user_id = p_user_id
    and consumed_at is null
  order by assigned_at
  for update skip locked
  limit 1;

  if v_ticket_id is null then
    raise exception 'NO_TICKET';
  end if;

  if p_referrer_user_id is not null then
    v_inviter_percent := case
      when exists (
        select 1 from public.worldcup_entries inviter_entry
        where inviter_entry.tournament_id = p_tournament_id
          and inviter_entry.user_id = p_referrer_user_id
          and inviter_entry.referrer_user_id is not null
      ) then 5
      else 3
    end;
  else
    v_inviter_percent := 0;
  end if;

  insert into public.worldcup_entries (
    tournament_id, user_id, display_name, status,
    referral_code, referrer_user_id, referral_fee_percent,
    referral_terms_accepted_at, auth_provider
  )
  values (
    p_tournament_id, p_user_id, p_display_name, 'draft',
    nullif(p_referral_code, ''), p_referrer_user_id, v_inviter_percent,
    case when p_referrer_user_id is not null then now() else null end, 'google'
  )
  returning id into v_entry_id;

  -- Picks (triggers enforce max-3 and the per-team cutoff).
  v_slot := 1;
  foreach v_team_id in array p_team_ids loop
    insert into public.worldcup_entry_teams (entry_id, team_id, pick_slot)
    values (v_entry_id, v_team_id, v_slot);
    v_slot := v_slot + 1;
  end loop;

  update public.worldcup_entries
  set status = 'locked', locked_at = coalesce(locked_at, now())
  where id = v_entry_id;

  update public.worldcup_tickets
  set consumed_by_entry_id = v_entry_id, consumed_at = now()
  where id = v_ticket_id and consumed_at is null;

  if p_referrer_user_id is not null then
    insert into public.worldcup_referrals (
      tournament_id, entry_id, inviter_user_id, invited_user_id,
      referral_code, referral_fee_percent, accepted_at
    )
    values (
      p_tournament_id, v_entry_id, p_referrer_user_id, p_user_id,
      p_referral_code, v_inviter_percent, now()
    )
    on conflict (tournament_id, invited_user_id) do update
      set entry_id = excluded.entry_id,
          referral_code = excluded.referral_code,
          referral_fee_percent = excluded.referral_fee_percent,
          accepted_at = excluded.accepted_at;
  end if;

  return v_entry_id;
end;
$$;

-- Atomic, balance-checked wallet transfer ----------------------------------
create or replace function public.worldcup_wallet_transfer(
  p_tournament_id uuid,
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_note text,
  p_created_by text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_transfer_id uuid;
begin
  if p_from_user_id = p_to_user_id then
    raise exception 'SAME_ACCOUNT';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Lock the sender's ledger for the duration of the transaction so a
  -- concurrent transfer cannot read a stale balance and overdraw.
  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':' || p_from_user_id::text));

  select coalesce(sum(
    case
      when to_user_id = p_from_user_id then amount
      when from_user_id = p_from_user_id then -amount
      else 0
    end
  ), 0)
  into v_balance
  from public.worldcup_wallet_transactions
  where tournament_id = p_tournament_id
    and (from_user_id = p_from_user_id or to_user_id = p_from_user_id);

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by
  )
  values (
    p_tournament_id, p_from_user_id, p_to_user_id, p_amount, 'transfer', nullif(p_note, ''), coalesce(p_created_by, 'admin')
  )
  returning id into v_transfer_id;

  return v_transfer_id;
end;
$$;
