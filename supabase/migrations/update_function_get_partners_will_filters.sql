CREATE OR REPLACE FUNCTION public.get_partners_with_filters(
    filter_company_name text DEFAULT NULL::text,
    filter_email text DEFAULT NULL::text,
    filter_created_at date DEFAULT NULL::date,
    filter_created_at_op text DEFAULT '>='::text,
    filter_total_vouchers integer DEFAULT NULL::integer,
    filter_total_vouchers_op text DEFAULT '='::text,
    filter_used_vouchers integer DEFAULT NULL::integer,
    filter_used_vouchers_op text DEFAULT '='::text,
    order_by text DEFAULT 'created_at'::text,
    order_dir text DEFAULT 'DESC'::text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 10)
 RETURNS TABLE(id bigint, company_name text, email text, total_vouchers bigint, used_vouchers bigint, unused_vouchers bigint, created_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
        WITH partner_voucher_counts AS (
            SELECT
                u.id,
                u.company_name,
                u.email,
                u.created_at,
                -- Vouchers comprados: suma de voucher_quantity en payments
                COALESCE(payments_summary.total_purchased, 0)::BIGINT AS total_vouchers,
                -- Vouchers asignados: count de vouchers individuales
                COALESCE(vouchers_summary.total_assigned, 0)::BIGINT AS used_vouchers,
                -- Vouchers disponibles: comprados - asignados
                COALESCE(payments_summary.total_purchased, 0)::BIGINT - COALESCE(vouchers_summary.total_assigned, 0)::BIGINT AS unused_vouchers
            FROM users u
            LEFT JOIN (
                SELECT
                    p.partner_id,
                    SUM(p.voucher_quantity) AS total_purchased
                FROM payments p
                GROUP BY p.partner_id
            ) payments_summary ON payments_summary.partner_id = u.id
            LEFT JOIN (
                SELECT
                    v.partner_id,
                    COUNT(v.id) AS total_assigned
                FROM vouchers v
                GROUP BY v.partner_id
            ) vouchers_summary ON vouchers_summary.partner_id = u.id
            WHERE u.role_id = (SELECT id FROM roles WHERE name = 'partner')
                %s -- filtro company_name
                %s -- filtro email
                %s -- filtro created_at
        ),
        filtered AS (
            SELECT *,
                COUNT(*) OVER() AS total_count
            FROM partner_voucher_counts
            WHERE 1=1
                %s -- filtro total_vouchers
                %s -- filtro used_vouchers
        )
        SELECT id, company_name, email, total_vouchers, used_vouchers, unused_vouchers, created_at, total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,
        -- WHERE conditions
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
$function$


------------------------------------Antes |  Después------------------------------------------

CREATE OR REPLACE FUNCTION public.get_partners_with_filters(
    filter_company_name text DEFAULT NULL::text,
    filter_email text DEFAULT NULL::text,
    filter_created_at date DEFAULT NULL::date,
    filter_created_at_op text DEFAULT '>='::text,
    filter_total_vouchers integer DEFAULT NULL::integer,
    filter_total_vouchers_op text DEFAULT '='::text,
    filter_used_vouchers integer DEFAULT NULL::integer,
    filter_used_vouchers_op text DEFAULT '='::text,
    -- 👇 Añadidos:
    filter_unused_vouchers integer DEFAULT NULL::integer,
    filter_unused_vouchers_op text DEFAULT '='::text,
    -- 👆 Añadidos
    order_by text DEFAULT 'created_at'::text,
    order_dir text DEFAULT 'DESC'::text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 10)
 RETURNS TABLE(id bigint, company_name text, email text, total_vouchers bigint, used_vouchers bigint, unused_vouchers bigint, created_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
        WITH partner_voucher_counts AS (
            SELECT
                u.id,
                u.company_name,
                u.email,
                u.created_at,
                -- Vouchers comprados: suma de voucher_quantity en payments
                COALESCE(payments_summary.total_purchased, 0)::BIGINT AS total_vouchers,
                -- Vouchers asignados: count de vouchers individuales
                COALESCE(vouchers_summary.total_assigned, 0)::BIGINT AS used_vouchers,
                -- Vouchers disponibles: comprados - asignados
                COALESCE(payments_summary.total_purchased, 0)::BIGINT - COALESCE(vouchers_summary.total_assigned, 0)::BIGINT AS unused_vouchers
            FROM users u
            LEFT JOIN (
                SELECT
                    p.partner_id,
                    SUM(p.voucher_quantity) AS total_purchased
                FROM payments p
                GROUP BY p.partner_id
            ) payments_summary ON payments_summary.partner_id = u.id
            LEFT JOIN (
                SELECT
                    v.partner_id,
                    COUNT(v.id) AS total_assigned
                FROM vouchers v
                GROUP BY v.partner_id
            ) vouchers_summary ON vouchers_summary.partner_id = u.id
            WHERE u.role_id = (SELECT id FROM roles WHERE name = 'partner')
                %s -- filtro company_name
                %s -- filtro email
                %s -- filtro created_at
        ),
        filtered AS (
            SELECT * ,
                COUNT(*) OVER() AS total_count
            FROM partner_voucher_counts
            WHERE 1=1
                %s -- filtro total_vouchers
                %s -- filtro used_vouchers
                %s -- filtro unused_vouchers
        )
        SELECT id, company_name, email, total_vouchers, used_vouchers, unused_vouchers, created_at, total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,
        -- WHERE conditions
        CASE WHEN filter_company_name IS NOT NULL THEN format('AND u.company_name ILIKE %L', '%' || filter_company_name || '%') ELSE '' END,
        CASE WHEN filter_email IS NOT NULL THEN format('AND u.email ILIKE %L', '%' || filter_email || '%') ELSE '' END,
        CASE WHEN filter_created_at IS NOT NULL THEN format('AND u.created_at::date %s %L', filter_created_at_op, filter_created_at) ELSE '' END,
        CASE WHEN filter_total_vouchers IS NOT NULL THEN format('AND total_vouchers %s %s', filter_total_vouchers_op, filter_total_vouchers) ELSE '' END,
        CASE WHEN filter_used_vouchers IS NOT NULL THEN format('AND used_vouchers %s %s', filter_used_vouchers_op, filter_used_vouchers) ELSE '' END,
        -- 👇 Nueva condición para unused_vouchers
        CASE WHEN filter_unused_vouchers IS NOT NULL THEN format('AND unused_vouchers %s %s', filter_unused_vouchers_op, filter_unused_vouchers) ELSE '' END,
        -- 👆 Nueva condición para unused_vouchers
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
    );
END;
$function$;
