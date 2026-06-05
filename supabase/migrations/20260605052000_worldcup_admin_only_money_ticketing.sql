-- Admin-only money ticketing -------------------------------------------------
--
-- Money is recorded only when Admin moves tickets out of Admin inventory:
--   admin -> agent
--   admin -> user
--
-- Agent -> user transfers are inventory distribution only. User USDT deposits
-- credit wallet balance for manual review and matching; they do not
-- automatically buy tickets or change the prize/fee pools.

create or replace function public.worldcup_purchase_ticket(
  p_user_id uuid,
  p_tournament_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'ADMIN_TICKET_ASSIGNMENT_REQUIRED';
end;
$$;

create or replace function public.worldcup_credit_deposit(
  p_user_id uuid,
  p_tournament_id uuid,
  p_network text,
  p_address text,
  p_external_id text,
  p_amount numeric,
  p_currency text,
  p_raw jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deposit_id uuid;
  v_tx_id uuid;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  insert into public.worldcup_deposits (
    tournament_id, user_id, network, address, amount, currency, provider, external_id, status, raw, credited_at
  )
  values (
    p_tournament_id, p_user_id, p_network, p_address, p_amount, coalesce(p_currency, 'USDT'),
    'kucoin', p_external_id, 'credited', p_raw, now()
  )
  on conflict (provider, external_id) do nothing
  returning id into v_deposit_id;

  if v_deposit_id is null then
    return null;
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by
  )
  values (
    p_tournament_id, null, p_user_id, p_amount, 'deposit',
    'USDT ' || p_network || ' deposit ' || p_external_id || ' credited for manual admin ticket assignment',
    'reconciler'
  )
  returning id into v_tx_id;

  update public.worldcup_deposits
  set wallet_transaction_id = v_tx_id
  where id = v_deposit_id;

  return v_deposit_id;
end;
$$;

create or replace function public.worldcup_activate_agent_on_personal_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.worldcup_ensure_active_agent_for_user(
    new.tournament_id,
    new.user_id,
    coalesce(nullif(trim(new.assigned_by), ''), 'ticket_activation')
  );

  return new;
end;
$$;

revoke execute on function public.worldcup_purchase_ticket(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_purchase_ticket(uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)
  to service_role;

revoke execute on function public.worldcup_activate_agent_on_personal_ticket()
  from public, anon, authenticated;
grant execute on function public.worldcup_activate_agent_on_personal_ticket()
  to service_role;
