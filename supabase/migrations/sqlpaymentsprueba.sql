CREATE OR REPLACE FUNCTION public.get_payments_with_filters(filter_partner_name text DEFAULT NULL::text, filter_created_at date DEFAULT NULL::date, filter_created_at_op text DEFAULT '>='::text, filter_total_price numeric DEFAULT NULL::numeric, filter_total_price_op text DEFAULT '='::text, order_by text DEFAULT 'created_at'::text, order_dir text DEFAULT 'desc'::text, page integer DEFAULT 1, limit_value integer DEFAULT 10)
 RETURNS TABLE(id bigint, partner_name text, voucher_quantity integer, unit_price numeric, total_price numeric, created_at timestamp with time zone, expiration_date timestamp with time zone, extension_date timestamp with time zone, extension_used boolean, files text, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  offset_val int := (page - 1) * limit_value;
  safe_order_by text;
  safe_order_dir text;
begin
  -- Validaciones de ordenamiento
  safe_order_by := case
    when order_by in ('partner_name', 'voucher_quantity', 'unit_price', 'total_price', 'created_at', 'expiration_date', 'extension_date') then order_by
    else 'created_at'
  end;

  safe_order_dir := case
    when upper(order_dir) in ('ASC', 'DESC') then upper(order_dir)
    else 'DESC'
  end;

  return query execute format($f$
    with payment_data as (
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
        p.files           -- <--- AGREGA ESTA LÍNEA
      from payments p
      left join users u on u.id = p.partner_id
      where u.role_id = 5
        %s -- filtro partner_name
        %s -- filtro created_at
    ),
    filtered as (
      select * ,
        count(*) over() as total_count
      from payment_data
      where 1=1
        %s -- filtro total_price
    )
    select
      f.id::bigint,
      f.partner_name::text,
      f.voucher_quantity::integer,
      f.unit_price::numeric,
      f.total_price::numeric,
      f.created_at::timestamptz,
      f.expiration_date::timestamptz,
      f.extension_date::timestamptz,
      f.extension_used::boolean,   -- <--- AGREGA ESTA LÍNEA
      f.files::text,               -- <--- AGREGA ESTA LÍNEA
      f.total_count::bigint
    from filtered f
    order by %I %s
    offset %s limit %s
  $f$,
    case when filter_partner_name is not null then format('and u.company_name ILIKE %L', '%%' || filter_partner_name || '%%') else '' end,
    case when filter_created_at is not null then format('and p.created_at::date %s %L', filter_created_at_op, filter_created_at) else '' end,
    case when filter_total_price is not null then format('and p.total_price %s %s', filter_total_price_op, filter_total_price) else '' end,
    safe_order_by,
    safe_order_dir,
    offset_val,
    limit_value
  );
end;
$function$

---------Por ahora se encuentra en uso la de arriba ya que la de abajo esta mas completa pero requiere una adaptación en el proyecto--------
-----------------------------------Antes/Despues------------------------------------------

CREATE OR REPLACE FUNCTION public.get_payments_with_filters(
    filter_partner_name text DEFAULT NULL::text,
    filter_created_at date DEFAULT NULL::date,
    filter_created_at_op text DEFAULT '>='::text,
    filter_total_price numeric DEFAULT NULL::numeric,
    filter_total_price_op text DEFAULT '='::text,
    filter_voucher_quantity integer DEFAULT NULL::integer, -- 👈 NUEVO: Filtro por cantidad de vouchers
    filter_voucher_quantity_op text DEFAULT '='::text, -- 👈 NUEVO: Operador para cantidad
    filter_unit_price numeric DEFAULT NULL::numeric, -- 👈 NUEVO: Filtro por precio unitario
    filter_unit_price_op text DEFAULT '='::text, -- 👈 NUEVO: Operador para precio unitario
    order_by text DEFAULT 'created_at'::text,
    order_dir text DEFAULT 'desc'::text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 10
)
RETURNS TABLE(
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    offset_val INT := (page - 1) * limit_value;
    safe_order_by TEXT;
    safe_order_dir TEXT;
BEGIN
    -- Validación de parámetros de ordenamiento
    safe_order_by := CASE
        WHEN order_by IN ('id', 'partner_name', 'voucher_quantity', 'unit_price', 'total_price', 'created_at', 'expiration_date', 'extension_date', 'extension_used')
        THEN order_by
        ELSE 'created_at'
    END;

    safe_order_dir := CASE
        WHEN upper(order_dir) IN ('ASC', 'DESC')
        THEN upper(order_dir)
        ELSE 'DESC'
    END;

    RETURN QUERY EXECUTE format($f$
        WITH payment_data AS (
            SELECT
                p.id,
                COALESCE(u.company_name, 'Partner sin nombre') AS partner_name,
                p.voucher_quantity,
                p.unit_price,
                p.total_price,
                p.created_at,
                p.expiration_date,
                p.extension_date,
                p.extension_used,
                p.files
            FROM payments p
            LEFT JOIN users u ON u.id = p.partner_id
            WHERE u.role_id = 5  -- Solo partners
                %s -- filter_partner_name
                %s -- filter_created_at
        ),
        filtered AS (
            SELECT *,
                COUNT(*) OVER() AS total_count
            FROM payment_data
            WHERE 1=1
                %s -- filter_total_price
                %s -- filter_voucher_quantity (NUEVO)
                %s -- filter_unit_price (NUEVO)
        )
        SELECT
            id, partner_name, voucher_quantity, unit_price, total_price,
            created_at, expiration_date, extension_date, extension_used,
            files, total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,
        -- Filtros básicos en payment_data
        CASE WHEN filter_partner_name IS NOT NULL THEN format('AND u.company_name ILIKE %L', '%%' || filter_partner_name || '%%') ELSE '' END,
        CASE WHEN filter_created_at IS NOT NULL THEN format('AND p.created_at::date %s %L', filter_created_at_op, filter_created_at) ELSE '' END,
        -- Filtros numéricos en filtered
        CASE WHEN filter_total_price IS NOT NULL THEN format('AND total_price %s %s', filter_total_price_op, filter_total_price) ELSE '' END,
        CASE WHEN filter_voucher_quantity IS NOT NULL THEN format('AND voucher_quantity %s %s', filter_voucher_quantity_op, filter_voucher_quantity) ELSE '' END,
        CASE WHEN filter_unit_price IS NOT NULL THEN format('AND unit_price %s %s', filter_unit_price_op, filter_unit_price) ELSE '' END,
        -- Ordenamiento y paginación
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
    );
END;
$function$