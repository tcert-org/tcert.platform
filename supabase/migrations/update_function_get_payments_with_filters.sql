CREATE
OR REPLACE FUNCTION public.get_payments_ return query execute format(
  $ query $ with payment_data as (
    th_filters(
      filter_partner_name text DEFAULT NULL :: text,
      filter_created_at date DEFAULT NULL :: date,
      filter_created_at_op text DEFAULT '>=' :: text,
      filter_total_price numeric DEFAULT NULL :: numeric,
      filter_total_price_op text DEFAULT '=' :: text,
      order_by text DEFAULT 'created_at' :: text,
      order_dir text DEFAULT 'desc' :: text,
      page integer DEFAULT 1,
      limit_value integer DEFAULT 10
    ) RETURNS TABLE(
      id bigint,
      partner_name text,
      voucher_quantity integer,
      unit_price numeric,
      total_price numeric,
      created_at timestamp with time zone,
      expiration_date timestamp with time zone,
      extension_date timestamp with time zone,
      extension_used boolean,
      files text,
      total_count bigint
    ) LANGUAGE plpgsql SECURITY DEFINER AS $ function $ declare offset_val int := (page - 1) * limit_value;

safe_order_by text;

safe_order_dir text;

begin -- Validaciones de ordenamiento
safe_order_by := case
  when order_by in (
    'partner_name',
    'voucher_quantity',
    'unit_price',
    'total_price',
    'created_at',
    'expiration_date',
    'extension_date'
  ) then order_by
  else 'created_at'
end;

safe_order_dir := case
  when upper(order_dir) in ('ASC', 'DESC') then upper(order_dir)
  else 'DESC'
end;

return query execute format(
  $ f $ with payment_data as (
    select
      p.id,
      u.company_name as partner_name,
      p.voucher_quantity,
      p.unit_price,
      p.total_price,
      p.created_at,
      p.expiration_date,
      p.extension_date,
      p.extension_used,
      p.files -- <--- AGREGA ESTA LÍNEA
    from
      payments p
      left join users u on u.id = p.partner_id
    where
      u.role_id = 5 % s -- filtro partner_name
      % s -- filtro created_at
  ),
  filtered as (
    select
      *,
      count(*) over() as total_count
    from
      payment_data
    where
      1 = 1 % s -- filtro total_price
  )
  select
    f.id :: bigint,
    f.partner_name :: text,
    f.voucher_quantity :: integer,
    f.unit_price :: numeric,
    f.total_price :: numeric,
    f.created_at :: timestamptz,
    f.expiration_date :: timestamptz,
    f.extension_date :: timestamptz,
    f.extension_used :: boolean,
    -- <--- AGREGA ESTA LÍNEA
    f.files :: text,
    -- <--- AGREGA ESTA LÍNEA
    f.total_count :: bigint
  from
    filtered f
  order by
    % I % s offset % s
  limit
    % s $ f $, case
      when filter_partner_name is not null then format(
        'and u.company_name ILIKE %L',
        '%%' || filter_partner_name || '%%'
      )
      else ''
    end,
    case
      when filter_created_at is not null then format(
        'and p.created_at::date %s %L',
        filter_created_at_op,
        filter_created_at
      )
      else ''
    end,
    case
      when filter_total_price is not null then format(
        'and p.total_price %s %s',
        filter_total_price_op,
        filter_total_price
      )
      else ''
    end,
    safe_order_by,
    safe_order_dir,
    offset_val,
    limit_value
);

end;

$ function $ -------------------------------------------------------Antes/Despues--------------------------------------------------------------------
-- Versión mejorada de la función con todos los filtros necesarios
CREATE
OR REPLACE FUNCTION public.get_payments_with_filters(
  filter_partner_name text DEFAULT NULL,
  filter_created_at text DEFAULT NULL,
  filter_created_at_op text DEFAULT '>=',
  filter_expiration_date text DEFAULT NULL,
  filter_expiration_date_op text DEFAULT '>=',
  filter_voucher_quantity integer DEFAULT NULL,
  filter_voucher_quantity_op text DEFAULT '=',
  filter_unit_price numeric DEFAULT NULL,
  filter_unit_price_op text DEFAULT '=',
  filter_total_price numeric DEFAULT NULL,
  filter_total_price_op text DEFAULT '=',
  order_by text DEFAULT 'created_at',
  order_dir text DEFAULT 'desc',
  page integer DEFAULT 1,
  limit_value integer DEFAULT 10
) RETURNS TABLE(
  id bigint,
  partner_name text,
  voucher_quantity integer,
  unit_price numeric,
  total_price numeric,
  created_at timestamp with time zone,
  expiration_date timestamp with time zone,
  extension_date timestamp with time zone,
  extension_used boolean,
  files text,
  total_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $ function $ declare offset_val int := (page - 1) * limit_value;

safe_order_by text;

safe_order_dir text;

begin -- Validaciones de ordenamiento (incluye todos los campos)
safe_order_by := case
  when order_by in (
    'id',
    'partner_name',
    'voucher_quantity',
    'unit_price',
    'total_price',
    'created_at',
    'expiration_date',
    'extension_date'
  ) then order_by
  else 'created_at'
end;

safe_order_dir := case
  when upper(order_dir) in ('ASC', 'DESC') then upper(order_dir)
  else 'DESC'
end;

return query execute format(
  $ query $ with payment_data as (
    select
      p.id,
      u.company_name as partner_name,
      p.voucher_quantity,
      p.unit_price,
      p.total_price,
      p.created_at,
      p.expiration_date,
      p.extension_date,
      p.extension_used,
      p.files,
      count(*) over() as total_count
    from
      payments p
      left join users u on u.id = p.partner_id
    where
      u.role_id = 5 % s -- filtro partner_name
      % s -- filtro created_at
      % s -- filtro expiration_date
      % s -- filtro voucher_quantity
      % s -- filtro unit_price
      % s -- filtro total_price
  )
  select
    pd.id :: bigint,
    pd.partner_name :: text,
    pd.voucher_quantity :: integer,
    pd.unit_price :: numeric,
    pd.total_price :: numeric,
    pd.created_at :: timestamptz,
    pd.expiration_date :: timestamptz,
    pd.extension_date :: timestamptz,
    pd.extension_used :: boolean,
    pd.files :: text,
    pd.total_count :: bigint
  from
    payment_data pd
  order by
    % I % s offset % s
  limit
    % s $ query $, case
      when filter_partner_name is not null then format(
        'and u.company_name ILIKE %L',
        '%%' || filter_partner_name || '%%'
      )
      else ''
    end,
    case
      when filter_created_at is not null then format(
        'and p.created_at::date %s %L',
        filter_created_at_op,
        filter_created_at
      )
      else ''
    end,
    case
      when filter_expiration_date is not null then format(
        'and p.expiration_date::date %s %L',
        filter_expiration_date_op,
        filter_expiration_date
      )
      else ''
    end,
    case
      when filter_voucher_quantity is not null then format(
        'and p.voucher_quantity %s %s',
        filter_voucher_quantity_op,
        filter_voucher_quantity
      )
      else ''
    end,
    case
      when filter_unit_price is not null then format(
        'and p.unit_price %s %s',
        filter_unit_price_op,
        filter_unit_price
      )
      else ''
    end,
    case
      when filter_total_price is not null then format(
        'and p.total_price %s %s',
        filter_total_price_op,
        filter_total_price
      )
      else ''
    end,
    safe_order_by,
    safe_order_dir,
    offset_val,
    limit_value
);

end;

$ function $;