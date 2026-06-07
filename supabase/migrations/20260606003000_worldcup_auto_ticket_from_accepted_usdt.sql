-- Accepted USDT deposits can automatically issue the first user ticket.
--
-- Public ticket purchases stay disabled. This RPC is called only by the
-- admin deposit-credit route after a KuCoin-matched claim is accepted. It
-- credits the wallet, then converts one ticket-price chunk into a user ticket
-- through admin inventory and the normal admin financial-movement ledger.

create or replace function public.worldcup_credit_deposit_and_auto_ticket(
  p_user_id uuid,
  p_tournament_id uuid,
  p_network text,
  p_address text,
  p_external_id text,
  p_amount numeric,
  p_currency text,
  p_raw jsonb,
  p_admin_user_id uuid,
  p_created_by text,
  p_auto_ticket boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deposit_id uuid;
  v_ticket_price numeric(12,2);
  v_balance numeric;
  v_existing_tickets integer;
  v_code record;
  v_ticket_id uuid;
  v_movement_id uuid;
  v_created_by text := coalesce(nullif(trim(p_created_by), ''), 'admin');
begin
  v_deposit_id := public.worldcup_credit_deposit(
    p_user_id,
    p_tournament_id,
    p_network,
    p_address,
    p_external_id,
    p_amount,
    p_currency,
    p_raw
  );

  if v_deposit_id is null then
    return jsonb_build_object(
      'credited', false,
      'depositId', null,
      'ticketAssigned', false,
      'reason', 'duplicate_deposit'
    );
  end if;

  if coalesce(p_auto_ticket, true) is false then
    return jsonb_build_object(
      'credited', true,
      'depositId', v_deposit_id,
      'ticketAssigned', false,
      'reason', 'auto_ticket_disabled'
    );
  end if;

  select ticket_price_amount into v_ticket_price
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if not found then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  if coalesce(v_ticket_price, 0) <= 0 then
    raise exception 'INVALID_TICKET_PRICE';
  end if;

  select count(*)::integer into v_existing_tickets
  from public.worldcup_tickets
  where tournament_id = p_tournament_id
    and user_id = p_user_id;

  if v_existing_tickets > 0 then
    return jsonb_build_object(
      'credited', true,
      'depositId', v_deposit_id,
      'ticketAssigned', false,
      'reason', 'user_already_has_ticket'
    );
  end if;

  perform pg_advisory_xact_lock(public.worldcup_wallet_lock_key(p_tournament_id, p_user_id));

  select coalesce(sum(
    case
      when to_user_id = p_user_id then amount
      when from_user_id = p_user_id then -amount
      else 0
    end
  ), 0)
  into v_balance
  from public.worldcup_wallet_transactions
  where tournament_id = p_tournament_id
    and (from_user_id = p_user_id or to_user_id = p_user_id);

  if v_balance < v_ticket_price then
    return jsonb_build_object(
      'credited', true,
      'depositId', v_deposit_id,
      'ticketAssigned', false,
      'reason', 'balance_below_ticket_price'
    );
  end if;

  if p_admin_user_id is null then
    raise exception 'ADMIN_ACCOUNT_REQUIRED';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':admin-ticket-inventory'));

  select *
  into v_code
  from public.worldcup_ticket_codes
  where tournament_id = p_tournament_id
    and status = 'admin'
    and admin_user_id = p_admin_user_id
  order by ticket_number asc
  limit 1
  for update skip locked;

  if not found then
    raise exception 'INSUFFICIENT_ADMIN_CODES';
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id,
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    note,
    created_by
  )
  values (
    p_tournament_id,
    p_user_id,
    null,
    v_ticket_price,
    'ticket_purchase',
    'Entry ticket automatically issued from accepted USDT deposit ' || p_external_id,
    v_created_by
  );

  insert into public.worldcup_tickets (
    tournament_id,
    user_id,
    price_amount,
    assigned_by
  )
  values (
    p_tournament_id,
    p_user_id,
    v_ticket_price,
    v_created_by || ':accepted_usdt_deposit'
  )
  returning id into v_ticket_id;

  update public.worldcup_ticket_codes
     set status = 'redeemed',
         kind = 'paid',
         redeemed_by_user_id = p_user_id,
         redeemed_at = now(),
         ticket_id = v_ticket_id
   where id = v_code.id;

  insert into public.worldcup_ticket_financial_movements (
    tournament_id,
    movement_type,
    payment_method,
    source_admin_user_id,
    target_user_id,
    quantity,
    ticket_price_amount,
    total_amount,
    note,
    metadata,
    created_by
  )
  values (
    p_tournament_id,
    'admin_to_user',
    'usdt',
    p_admin_user_id,
    p_user_id,
    1,
    v_ticket_price,
    v_ticket_price,
    'Automatic first ticket from accepted USDT deposit.',
    jsonb_build_object(
      'autoTicketFromDepositId', v_deposit_id,
      'externalId', p_external_id,
      'userTicketNumbers', jsonb_build_array(
        jsonb_build_object('ticketNumber', v_code.ticket_number, 'code', v_code.code)
      )
    ),
    v_created_by
  )
  returning id into v_movement_id;

  insert into public.worldcup_ticket_financial_movement_codes (
    movement_id,
    ticket_code_id,
    ticket_number,
    code,
    movement_role
  )
  values (
    v_movement_id,
    v_code.id,
    v_code.ticket_number,
    v_code.code,
    'user_ticket'
  );

  return jsonb_build_object(
    'credited', true,
    'depositId', v_deposit_id,
    'ticketAssigned', true,
    'ticketId', v_ticket_id,
    'movementId', v_movement_id,
    'ticketPriceAmount', v_ticket_price,
    'ticketNumber', v_code.ticket_number
  );
end;
$$;

revoke execute on function public.worldcup_credit_deposit_and_auto_ticket(
  uuid, uuid, text, text, text, numeric, text, jsonb, uuid, text, boolean
)
  from public, anon, authenticated;
grant execute on function public.worldcup_credit_deposit_and_auto_ticket(
  uuid, uuid, text, text, text, numeric, text, jsonb, uuid, text, boolean
)
  to service_role;
