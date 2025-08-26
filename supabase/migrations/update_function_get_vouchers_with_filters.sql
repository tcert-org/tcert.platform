CREATE OR REPLACE FUNCTION public.get_vouchers_with_filters(filter_available boolean DEFAULT NULL::boolean, filter_certification_name text DEFAULT NULL::text, filter_code text DEFAULT NULL::text, filter_email text DEFAULT NULL::text, filter_expiration_date timestamp with time zone DEFAULT NULL::timestamp with time zone, filter_partner_id bigint DEFAULT NULL::bigint, filter_purchase_date timestamp with time zone DEFAULT NULL::timestamp with time zone, filter_status_id bigint DEFAULT NULL::bigint, order_by text DEFAULT 'created_at'::text, order_dir text DEFAULT 'desc'::text, page integer DEFAULT 1, limit_value integer DEFAULT 20)
 RETURNS TABLE(id bigint, code text, partner_id bigint, certification_id bigint, certification_name text, status_name text, purchase_date timestamp with time zone, status_id bigint, expiration_date timestamp with time zone, email text, used boolean, created_at timestamp with time zone, updated_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
AS $function$
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
$function$

----------------------------------------Antes / Despues-------------------------------------

CREATE OR REPLACE FUNCTION public.get_vouchers_with_filters(
    filter_available boolean DEFAULT NULL::boolean,
    filter_certification_name text DEFAULT NULL::text,
    filter_code text DEFAULT NULL::text,
    filter_email text DEFAULT NULL::text,
    filter_expiration_date timestamp with time zone DEFAULT NULL::timestamp with time zone,
    filter_partner_id bigint DEFAULT NULL::bigint,
    filter_purchase_date timestamp with time zone DEFAULT NULL::timestamp with time zone,
    filter_status_id bigint DEFAULT NULL::bigint,
    filter_status_name text DEFAULT NULL::text, -- 👈 NUEVO: Buscar por nombre de estado
    order_by text DEFAULT 'created_at'::text,
    order_dir text DEFAULT 'desc'::text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 20
)
RETURNS TABLE(
    id bigint,
    code text,
    partner_id bigint,
    certification_id bigint,
    certification_name text,
    status_name text,
    purchase_date timestamp with time zone,
    status_id bigint,
    expiration_date timestamp with time zone,
    email text,
    used boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
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
        WHEN order_by IN ('id', 'code', 'certification_name', 'status_name', 'purchase_date', 'expiration_date', 'email', 'created_at', 'updated_at')
        THEN order_by
        ELSE 'created_at'
    END;

    safe_order_dir := CASE
        WHEN upper(order_dir) IN ('ASC', 'DESC')
        THEN upper(order_dir)
        ELSE 'DESC'
    END;

    RETURN QUERY EXECUTE format($f$
        WITH voucher_data AS (
            SELECT
                v.id,
                v.code,
                v.partner_id,
                v.certification_id,
                COALESCE(c.name, 'Sin certificación') AS certification_name,
                COALESCE(vs.name, 'Sin estado') AS status_name,
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
            WHERE 1=1
                -- Filtros existentes
                %s -- filter_partner_id
                %s -- filter_code (MEJORADO: búsqueda por código)
                %s -- filter_email
                %s -- filter_certification_name
                %s -- filter_purchase_date
                %s -- filter_expiration_date
                %s -- filter_status_id
                %s -- filter_available (usado/no usado)
                %s -- filter_status_name (NUEVO: búsqueda por nombre de estado)
        ),
        filtered AS (
            SELECT *,
                COUNT(*) OVER() AS total_count
            FROM voucher_data
        )
        SELECT
            id, code, partner_id, certification_id, certification_name,
            status_name, purchase_date, status_id, expiration_date,
            email, used, created_at, updated_at, total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,
        -- Condiciones WHERE
        CASE WHEN filter_partner_id IS NOT NULL THEN format('AND v.partner_id = %s', filter_partner_id) ELSE '' END,
        CASE WHEN filter_code IS NOT NULL THEN format('AND v.code ILIKE %L', '%' || filter_code || '%') ELSE '' END,
        CASE WHEN filter_email IS NOT NULL THEN format('AND v.email ILIKE %L', '%' || filter_email || '%') ELSE '' END,
        CASE WHEN filter_certification_name IS NOT NULL THEN format('AND c.name ILIKE %L', '%' || filter_certification_name || '%') ELSE '' END,
        CASE WHEN filter_purchase_date IS NOT NULL THEN format('AND v.purchase_date::date = %L', filter_purchase_date::date) ELSE '' END,
        CASE WHEN filter_expiration_date IS NOT NULL THEN format('AND v.expiration_date::date = %L', filter_expiration_date::date) ELSE '' END,
        CASE WHEN filter_status_id IS NOT NULL THEN format('AND v.status_id = %s', filter_status_id) ELSE '' END,
        CASE WHEN filter_available IS NOT NULL THEN format('AND v.used = %L', filter_available) ELSE '' END,
        CASE WHEN filter_status_name IS NOT NULL THEN format('AND vs.name ILIKE %L', '%' || filter_status_name || '%') ELSE '' END,
        -- Ordenamiento y paginación
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
    );
END;
$function$;