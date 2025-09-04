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
                COUNT(v.id) AS total_vouchers,
                COUNT(v.id) FILTER (WHERE v.used) AS used_vouchers,
                COUNT(v.id) FILTER (WHERE NOT v.used) AS unused_vouchers,
                u.created_at
            FROM users u
            LEFT JOIN vouchers v ON v.partner_id = u.id
            WHERE u.role_id = (SELECT id FROM roles WHERE name = 'partner')
                %s -- filtro company_name
                %s -- filtro email
                %s -- filtro created_at
            GROUP BY u.id
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
-------------funcion para los filtros de los vouchers---------------------------------------------
CREATE OR REPLACE FUNCTION public.get_vouchers_with_filters(
    filter_available BOOLEAN DEFAULT NULL,
    filter_certification_name TEXT DEFAULT NULL,
    filter_code TEXT DEFAULT NULL,
    filter_email TEXT DEFAULT NULL,
    filter_expiration_date TIMESTAMPTZ DEFAULT NULL,
    filter_partner_id BIGINT DEFAULT NULL,
    filter_purchase_date TIMESTAMPTZ DEFAULT NULL,
    filter_status_id BIGINT DEFAULT NULL,
    order_by TEXT DEFAULT 'created_at',
    order_dir TEXT DEFAULT 'desc',
    page INTEGER DEFAULT 1,
    limit_value INTEGER DEFAULT 20
)
RETURNS TABLE (
    id BIGINT,
    code TEXT,
    partner_id BIGINT,
    certification_id BIGINT,
    certification_name TEXT,
    status_name TEXT,
    purchase_date TIMESTAMPTZ,
    status_id BIGINT,
    expiration_date TIMESTAMPTZ,
    email TEXT,
    used BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    sql_query TEXT;
    offset_val INT := (page - 1) * limit_value;
BEGIN
    sql_query := '
        WITH filtered_vouchers AS (
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
            WHERE 1=1';

    -- Cambiado aquí, ya NO usa NOT
    IF filter_available IS NOT NULL THEN
        sql_query := sql_query || ' AND v.used = ' || quote_literal(filter_available);
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
        sql_query := sql_query || ' AND v.purchase_date::date = ' || quote_literal(filter_purchase_date::date);
    END IF;

    IF filter_status_id IS NOT NULL THEN
        sql_query := sql_query || ' AND v.status_id = ' || filter_status_id;
    END IF;

    sql_query := sql_query || '
        )
        SELECT *,
            (SELECT COUNT(*) FROM filtered_vouchers) AS total_count
        FROM filtered_vouchers
        ORDER BY ' || quote_ident(order_by) || ' ' || UPPER(order_dir) || '
        OFFSET ' || offset_val || ' LIMIT ' || limit_value;

    RETURN QUERY EXECUTE sql_query;
END;
$$;



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
-------------------------Funcion para los filtros de los examenes--------------------------
CREATE OR REPLACE FUNCTION public.get_exams_with_filters(
    filter_name_exam TEXT DEFAULT NULL,
    filter_certification_id BIGINT DEFAULT NULL,
    filter_simulator BOOLEAN DEFAULT NULL,
    filter_active BOOLEAN DEFAULT NULL,
    filter_created_at DATE DEFAULT NULL,
    filter_created_at_op TEXT DEFAULT '>=',
    order_by TEXT DEFAULT 'created_at',
    order_dir TEXT DEFAULT 'DESC',
    page INTEGER DEFAULT 1,
    limit_value INTEGER DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    certification_id BIGINT,
    certification_name TEXT,
    name_exam TEXT,
    simulator BOOLEAN,
    time_limit INT,
    attempts INT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    active BOOLEAN,
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
    safe_order_by := CASE
        WHEN order_by IN ('id', 'certification_id', 'certification_name', 'name_exam', 'simulator', 'time_limit', 'attempts', 'created_at', 'updated_at', 'active')
        THEN order_by
        ELSE 'created_at'
    END;

    safe_order_dir := CASE
        WHEN upper(order_dir) IN ('ASC', 'DESC')
        THEN upper(order_dir)
        ELSE 'DESC'
    END;

    RETURN QUERY EXECUTE format($f$
        WITH exam_data AS (
            SELECT
                e.id,
                e.certification_id,
                c.name AS certification_name,
                e.name_exam::text AS name_exam,   -- ← AQUÍ CASTEA A TEXT
                e.simulator,
                e.time_limit,
                e.attempts,
                e.created_at,
                e.updated_at,
                e.active
            FROM exams e
            LEFT JOIN certifications c ON c.id = e.certification_id
            WHERE 1=1
                %s -- filtro name_exam
                %s -- filtro certification_id
                %s -- filtro simulator
                %s -- filtro active
                %s -- filtro created_at
        ),
        filtered AS (
            SELECT *,
                COUNT(*) OVER() AS total_count
            FROM exam_data
        )
        SELECT id, certification_id, certification_name, name_exam, simulator, time_limit, attempts, created_at, updated_at, active, total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,
        CASE WHEN filter_name_exam IS NOT NULL THEN format('AND e.name_exam ILIKE %L', '%' || filter_name_exam || '%') ELSE '' END,
        CASE WHEN filter_certification_id IS NOT NULL THEN format('AND e.certification_id = %s', filter_certification_id) ELSE '' END,
        CASE WHEN filter_simulator IS NOT NULL THEN format('AND e.simulator = %L', filter_simulator) ELSE '' END,
        CASE WHEN filter_active IS NOT NULL THEN format('AND e.active = %L', filter_active) ELSE '' END,
        CASE WHEN filter_created_at IS NOT NULL THEN format('AND e.created_at::date %s %L', filter_created_at_op, filter_created_at) ELSE '' END,
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
    );
END;
$$;

----------------------------------------------------------------------------------------------------------------------------
-----------------------Agregar columna slug avoucher_statuses---------------------------------------------------------------
ALTER TABLE voucher_statuses ADD COLUMN IF NOT EXISTS slug TEXT;

-------------Eliminar Columnas obsoletas de las certificaciones y agregar si la certifiacón esta activa ---------------------

alter table certifications
drop column price;

alter table certifications
drop column duration;

alter table certifications
drop column expiration_period_months;

alter table certifications
add column active boolean;
-----------------Funcion para contar los pagos y cantidades de un partner en un tiempo determinado para la variable params---------
create or replace function public.update_membership_from_recent_vouchers(
  p_partner_id bigint,
  p_now timestamptz default now()
)
returns table(
  partner_id bigint,
  window_months int,
  window_start timestamptz,
  window_end timestamptz,
  total_vouchers bigint,
  matched_membership_id bigint,
  matched_membership_name text,
  previous_membership_id bigint,
  updated boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_months int;
  v_start  timestamptz;
  v_total  bigint;
  v_match_id bigint;
  v_match_name text;
  v_prev_id bigint;
begin
  -- 1) Leer meses (params.id = 2)
  select coalesce(nullif(trim(value), '')::int, 0)
    into v_months
  from public.params
  where id = 2;

  if v_months is null or v_months < 0 then
    v_months := 0;
  end if;

  -- 2) Ventana
  v_start := p_now - make_interval(months => v_months);

  -- 3) Total de vouchers en la ventana para el partner
  select coalesce(sum(p.voucher_quantity)::bigint, 0)
    into v_total
  from public.payments as p
  where p.partner_id = p_partner_id
    and p.created_at >= v_start
    and p.created_at <  p_now;

  -- 4) Membership que aplica (count_from <= total <= count_up)
  select m.id, m.name
    into v_match_id, v_match_name
  from public.membership m
  where v_total >= m.count_from
    and v_total <= m.count_up
  order by m.count_from desc
  limit 1;

  -- 5) Obtener membresía anterior y bloquear fila
  select u.membership_id
    into v_prev_id
  from public.users u
  where u.id = p_partner_id
  for update;

  -- 6) Actualizar si hay cambio y hay match
  if v_match_id is not null and v_prev_id is distinct from v_match_id then
    update public.users
       set membership_id = v_match_id
     where id = p_partner_id;
    updated := true;
  else
    updated := false;
  end if;

  -- 7) Devolver detalle
  partner_id := p_partner_id;
  window_months := v_months;
  window_start := v_start;
  window_end := p_now;
  total_vouchers := v_total;
  matched_membership_id := v_match_id;
  matched_membership_name := v_match_name;
  previous_membership_id := v_prev_id;

  return next;
end
$$;

-- Índice recomendado
create index if not exists idx_payments_partner_created_at
  on public.payments (partner_id, created_at);


------------------Agregar Columna para  gestionar el publico dirigido en cetifications----------------------
alter table certifications
add column audience text;