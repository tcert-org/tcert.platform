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
