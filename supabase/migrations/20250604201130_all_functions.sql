CREATE TABLE IF NOT EXISTS payments(
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES users(id) NOT NULL,
  admin_id INTEGER REFERENCES users(id), -- puede ser NULL
  voucher_quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2),
  files TEXT
);

CREATE OR REPLACE FUNCTION validate_user_roles() RETURNS TRIGGER AS $$
BEGIN
  -- Validar que partner sea rol partner
  IF NOT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.partner_id AND r.name = 'partner'
  ) THEN
    RAISE EXCEPTION 'El partner_id debe pertenecer a un usuario con rol partner';
  END IF;

  -- Validar que admin sea rol admin (si se especificó)
  IF NEW.admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.admin_id AND r.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'El admin_id debe pertenecer a un usuario con rol admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------------------------------
--funciones de  supabase---------------------------------------------------------------------------

------------Funcion para completar el nombre automaticamente----------------------------------------
CREATE OR REPLACE FUNCTION complete_partner_name()
RETURNS trigger AS $$
BEGIN
  -- Asignar el nombre de la compañía al campo nombre_partner
  SELECT u.company_name INTO NEW.nombre_partner
  FROM users u
  WHERE u.id = NEW.id_partner;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--------------Funcion para los filtros del partner--------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_partners_with_filters(
    filter_company_name TEXT DEFAULT NULL,
    filter_email TEXT DEFAULT NULL,
    filter_created_at DATE DEFAULT NULL,
    filter_created_at_op TEXT DEFAULT '>=',
    filter_total_vouchers INTEGER DEFAULT NULL,
    filter_total_vouchers_op TEXT DEFAULT '=',
    filter_used_vouchers INTEGER DEFAULT NULL,
    filter_used_vouchers_op TEXT DEFAULT '=',
    order_by TEXT DEFAULT 'created_at',
    order_dir TEXT DEFAULT 'DESC',
    page INTEGER DEFAULT 1,
    limit_value INTEGER DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    company_name TEXT,
    email TEXT,
    total_vouchers BIGINT,
    used_vouchers BIGINT,
    unused_vouchers BIGINT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_val INT := (page - 1) * limit_value;
    safe_order_by TEXT;
    safe_order_dir TEXT;
BEGIN
    -- Validación
    safe_order_by := CASE
        WHEN order_by IN ('company_name', 'email', 'total_vouchers', 'used_vouchers', 'unused_vouchers', 'created_at')
        THEN order_by
        ELSE 'created_at'
    END;

    safe_order_dir := CASE
        WHEN upper(order_dir) IN ('ASC', 'DESC')
        THEN upper(order_dir)
        ELSE 'DESC'
    END;

    RETURN QUERY EXECUTE format($f$
        WITH partner_data AS (
            SELECT
                u.id,
                u.company_name,
                u.email,
                u.created_at,
                -- Calcular vouchers comprados de la tabla payments
                COALESCE(SUM(p.voucher_quantity), 0)::BIGINT AS total_vouchers,
                -- Calcular vouchers asignados (usados) de la tabla vouchers
                COALESCE(COUNT(DISTINCT v.id), 0)::BIGINT AS used_vouchers,
                -- Calcular vouchers disponibles (comprados - asignados)
                COALESCE(SUM(p.voucher_quantity), 0)::BIGINT - COALESCE(COUNT(DISTINCT v.id), 0)::BIGINT AS unused_vouchers
            FROM users u
            LEFT JOIN payments p ON p.partner_id = u.id
            LEFT JOIN vouchers v ON v.partner_id = u.id
            WHERE u.role_id = (SELECT id FROM roles WHERE name = 'partner')
                %s -- filtro company_name
                %s -- filtro email
                %s -- filtro created_at
            GROUP BY u.id, u.company_name, u.email, u.created_at
        ),
        filtered AS (
            SELECT *,
                COUNT(*) OVER() AS total_count
            FROM partner_data
            WHERE 1=1
                %s -- filtro total_vouchers
                %s -- filtro used_vouchers
        )
        SELECT id, company_name, email, total_vouchers, used_vouchers, unused_vouchers, created_at, total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,

        -- WHERE conditions (dinámicamente agregadas si los filtros no son NULL)
        CASE WHEN filter_company_name IS NOT NULL THEN format('AND u.company_name ILIKE %L', '%' || filter_company_name || '%') ELSE '' END,
        CASE WHEN filter_email IS NOT NULL THEN format('AND u.email ILIKE %L', '%' || filter_email || '%') ELSE '' END,
        CASE WHEN filter_created_at IS NOT NULL THEN format('AND u.created_at::date %s %L', filter_created_at_op, filter_created_at) ELSE '' END,
        CASE WHEN filter_total_vouchers IS NOT NULL THEN format('AND total_vouchers %s %s', filter_total_vouchers_op, filter_total_vouchers) ELSE '' END,
        CASE WHEN filter_used_vouchers IS NOT NULL THEN format('AND used_vouchers %s %s', filter_used_vouchers_op, filter_used_vouchers) ELSE '' END,

        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
    );
END;
$$;

-------------funcion para hacer el conteo de vouchers de cada partner------------------------------
CREATE OR REPLACE FUNCTION get_voucher_counts(p_id bigint)
RETURNS TABLE(voucher_purchased integer, voucher_asigned integer, voucher_available integer) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(voucher_data.voucher_quantity)::integer, 0) AS voucher_purchased,
        COALESCE(COUNT(DISTINCT voucher_data.voucher_id)::integer, 0) AS voucher_asigned,
        COALESCE(SUM(voucher_data.voucher_quantity)::integer, 0) - COALESCE(COUNT(DISTINCT voucher_data.voucher_id)::integer, 0) AS voucher_available
    FROM (
        SELECT
            p.voucher_quantity,
            v.id AS voucher_id
        FROM
            payments p
        LEFT JOIN
            vouchers v ON p.partner_id = v.partner_id
        WHERE
            p.partner_id = p_id
    ) AS voucher_data;
END;
$$ LANGUAGE plpgsql;

-------------funcion para contar vouchers asignados de un pago específico-----------------------
CREATE OR REPLACE FUNCTION get_assigned_vouchers_by_payment(payment_id_param bigint)
RETURNS TABLE(
    total_vouchers_in_payment integer,
    assigned_vouchers_count integer,
    unassigned_vouchers_count integer,
    unit_price_per_voucher numeric,
    partner_id_info bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH payment_info AS (
        SELECT 
            p.id as payment_id,
            p.partner_id,
            p.voucher_quantity,
            p.unit_price,
            p.created_at as payment_date
        FROM payments p 
        WHERE p.id = payment_id_param
    ),
    -- Obtener todos los pagos del partner ordenados por fecha (FIFO)
    partner_payments AS (
        SELECT 
            p.id,
            p.voucher_quantity,
            p.created_at,
            ROW_NUMBER() OVER (ORDER BY p.created_at ASC) as payment_order
        FROM payments p
        WHERE p.partner_id = (SELECT partner_id FROM payment_info)
        ORDER BY p.created_at ASC
    ),
    -- Calcular vouchers asignados acumulativos usando FIFO
    voucher_assignment AS (
        SELECT 
            pi.payment_id,
            pi.partner_id,
            pi.voucher_quantity,
            pi.unit_price,
            -- Total de vouchers asignados del partner
            COALESCE((
                SELECT COUNT(*)::integer 
                FROM vouchers v 
                WHERE v.partner_id = pi.partner_id 
                AND v.used = true
            ), 0) as total_assigned_vouchers,
            -- Posición de este pago en el orden FIFO
            (SELECT payment_order FROM partner_payments WHERE id = pi.payment_id) as current_payment_order,
            -- Suma acumulativa de vouchers de pagos anteriores (FIFO)
            COALESCE((
                SELECT SUM(pp.voucher_quantity)::integer
                FROM partner_payments pp
                WHERE pp.payment_order < (
                    SELECT payment_order 
                    FROM partner_payments 
                    WHERE id = pi.payment_id
                )
            ), 0) as vouchers_from_previous_payments
        FROM payment_info pi
    )
    SELECT
        va.voucher_quantity::integer AS total_vouchers_in_payment,
        -- Calcular vouchers asignados de este pago específico usando FIFO
        CASE 
            WHEN va.total_assigned_vouchers <= va.vouchers_from_previous_payments THEN 0
            WHEN va.total_assigned_vouchers >= (va.vouchers_from_previous_payments + va.voucher_quantity) THEN va.voucher_quantity
            ELSE (va.total_assigned_vouchers - va.vouchers_from_previous_payments)
        END::integer AS assigned_vouchers_count,
        -- Vouchers sin asignar de este pago
        (va.voucher_quantity - 
         CASE 
            WHEN va.total_assigned_vouchers <= va.vouchers_from_previous_payments THEN 0
            WHEN va.total_assigned_vouchers >= (va.vouchers_from_previous_payments + va.voucher_quantity) THEN va.voucher_quantity
            ELSE (va.total_assigned_vouchers - va.vouchers_from_previous_payments)
         END)::integer AS unassigned_vouchers_count,
        va.unit_price AS unit_price_per_voucher,
        va.partner_id AS partner_id_info
    FROM voucher_assignment va;
END;
$$ LANGUAGE plpgsql;
-------------funcion para los filtros de los vouchers---------------------------------------------
CREATE OR REPLACE FUNCTION get_vouchers_with_filters(
    filter_available BOOLEAN DEFAULT NULL,
    filter_certification_name TEXT DEFAULT NULL,
    filter_code TEXT DEFAULT NULL,
    filter_email TEXT DEFAULT NULL,
    filter_expiration_date TIMESTAMPTZ DEFAULT NULL,
    filter_partner_id BIGINT DEFAULT NULL,
    filter_purchase_date DATE DEFAULT NULL,
    filter_status_id BIGINT DEFAULT NULL,
    order_by TEXT DEFAULT 'created_at'::text,
    order_dir TEXT DEFAULT 'desc'::text,
    page INTEGER DEFAULT 1
)
RETURNS SETOF voucher_result AS $$
DECLARE
    sql_query TEXT;
    offset_val INT := (page - 1) * 20;
BEGIN
    sql_query := '
        SELECT
            v.id,
            v.code,
            v.partner_id,
            v.certification_id,
            c.name AS certification_name,
            vs.name AS status_name,
            v.purchase_date,
            v.status_id,
            v.expiration_date,
            v.email,
            v.used,
            v.created_at,
            v.updated_at
        FROM vouchers v
        LEFT JOIN certifications c ON v.certification_id = c.id
        LEFT JOIN voucher_statuses vs ON v.status_id = vs.id
        WHERE 1 = 1';

    IF filter_available IS NOT NULL THEN
        sql_query := sql_query || ' AND v.used = ' || quote_literal(NOT filter_available);
    END IF;

    IF filter_certification_name IS NOT NULL THEN
        sql_query := sql_query || ' AND c.name ILIKE ' || quote_literal('%' || filter_certification_name || '%');
    END IF;

    IF filter_code IS NOT NULL THEN
        sql_query := sql_query || ' AND v.code ILIKE ' || quote_literal('%' || filter_code || '%');
    END IF;

    IF filter_email IS NOT NULL THEN
        sql_query := sql_query || ' AND v.email ILIKE ' || quote_literal('%' || filter_email || '%');
    END IF;

    IF filter_expiration_date IS NOT NULL THEN
        sql_query := sql_query || ' AND v.expiration_date::date = ' || quote_literal(filter_expiration_date::date);
    END IF;

    IF filter_partner_id IS NOT NULL THEN
        sql_query := sql_query || ' AND v.partner_id = ' || filter_partner_id;
    END IF;

    IF filter_purchase_date IS NOT NULL THEN
        sql_query := sql_query || ' AND v.purchase_date::date = ' || quote_literal(filter_purchase_date);
    END IF;

    IF filter_status_id IS NOT NULL THEN
        sql_query := sql_query || ' AND v.status_id = ' || filter_status_id;
    END IF;

    sql_query := sql_query || ' ORDER BY v.' || quote_ident(order_by) || ' ' || UPPER(order_dir);
    sql_query := sql_query || ' LIMIT 20 OFFSET ' || offset_val;

    RETURN QUERY EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;
-----------------Funcion para validar partner-------------------------------------------------
CREATE OR REPLACE FUNCTION validate_partner_role()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.id_partner AND r.name = 'partner'
  ) THEN
    RAISE EXCEPTION 'El id_partner debe pertenecer a un usuario con rol partner';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
----------------Funcion para validar los roles---------------------------------------------
CREATE OR REPLACE FUNCTION validate_user_roles()
RETURNS trigger AS $$
BEGIN
  -- Validar que partner sea rol partner
  IF NOT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.partner_id AND r.name = 'partner'
  ) THEN
    RAISE EXCEPTION 'El partner_id debe pertenecer a un usuario con rol partner';
  END IF;

  -- Validar que admin sea rol admin (si se especificó)
  IF NEW.admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.admin_id AND r.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'El admin_id debe pertenecer a un usuario con rol admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------------
----------------------------------Filtros de pagos-----------------------------------------
create or replace function public.get_payments_with_filters(
  filter_partner_name text default null,
  filter_created_at date default null,
  filter_created_at_op text default '>=',
  filter_total_price numeric default null,
  filter_total_price_op text default '=',
  order_by text default 'created_at',
  order_dir text default 'desc',
  page integer default 1,
  limit_value integer default 10
)
returns table (
  id bigint,
  partner_name text,
  voucher_quantity integer,
  unit_price numeric,
  total_price numeric,
  created_at timestamptz,
  expiration_date timestamptz,
  extension_date timestamptz,
  extension_used boolean,
  total_count bigint
)
language plpgsql
security definer
as $$
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
        p.extension_used
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
$$;
