-- Actualizar la función get_partners_with_filters para usar la nueva función get_voucher_counts
CREATE OR REPLACE FUNCTION public.get_partners_with_filters(
    filter_company_name text DEFAULT NULL::text,
    filter_email text DEFAULT NULL::text,
    filter_created_at date DEFAULT NULL::date,
    filter_created_at_op text DEFAULT '>='::text,
    filter_total_vouchers integer DEFAULT NULL::integer,
    filter_total_vouchers_op text DEFAULT '='::text,
    filter_used_vouchers integer DEFAULT NULL::integer,
    filter_used_vouchers_op text DEFAULT '='::text,
    filter_unused_vouchers integer DEFAULT NULL::integer,
    filter_unused_vouchers_op text DEFAULT '='::text,
    filter_expired_vouchers integer DEFAULT NULL::integer,
    filter_expired_vouchers_op text DEFAULT '='::text,
    order_by text DEFAULT 'created_at'::text,
    order_dir text DEFAULT 'DESC'::text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 10)
 RETURNS TABLE(
    id bigint, 
    company_name text, 
    email text, 
    total_vouchers integer, 
    used_vouchers integer, 
    unused_vouchers integer,
    expired_vouchers integer,
    created_at timestamp with time zone, 
    total_count bigint
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
    offset_val INT := (page - 1) * limit_value;
    safe_order_by TEXT;
    safe_order_dir TEXT;
BEGIN
    -- Validación de parámetros
    safe_order_by := CASE
        WHEN order_by IN ('company_name', 'email', 'total_vouchers', 'used_vouchers', 'unused_vouchers', 'expired_vouchers', 'created_at')
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
                -- Usar la nueva función get_voucher_counts para obtener los datos actualizados
                vc.voucher_purchased AS total_vouchers,
                vc.voucher_asigned AS used_vouchers,
                vc.voucher_available AS unused_vouchers,
                vc.voucher_expired AS expired_vouchers
            FROM users u
            LEFT JOIN LATERAL get_voucher_counts(u.id) vc ON true
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
                %s -- filtro unused_vouchers
                %s -- filtro expired_vouchers
        )
        SELECT 
            id, 
            company_name, 
            email, 
            total_vouchers, 
            used_vouchers, 
            unused_vouchers,
            expired_vouchers,
            created_at, 
            total_count
        FROM filtered
        ORDER BY %I %s
        OFFSET %s LIMIT %s
    $f$,
        -- WHERE conditions para la primera CTE
        CASE WHEN filter_company_name IS NOT NULL THEN format('AND u.company_name ILIKE %L', '%' || filter_company_name || '%') ELSE '' END,
        CASE WHEN filter_email IS NOT NULL THEN format('AND u.email ILIKE %L', '%' || filter_email || '%') ELSE '' END,
        CASE WHEN filter_created_at IS NOT NULL THEN format('AND u.created_at::date %s %L', filter_created_at_op, filter_created_at) ELSE '' END,
        -- WHERE conditions para la segunda CTE
        CASE WHEN filter_total_vouchers IS NOT NULL THEN format('AND total_vouchers %s %s', filter_total_vouchers_op, filter_total_vouchers) ELSE '' END,
        CASE WHEN filter_used_vouchers IS NOT NULL THEN format('AND used_vouchers %s %s', filter_used_vouchers_op, filter_used_vouchers) ELSE '' END,
        CASE WHEN filter_unused_vouchers IS NOT NULL THEN format('AND unused_vouchers %s %s', filter_unused_vouchers_op, filter_unused_vouchers) ELSE '' END,
        CASE WHEN filter_expired_vouchers IS NOT NULL THEN format('AND expired_vouchers %s %s', filter_expired_vouchers_op, filter_expired_vouchers) ELSE '' END,
        -- ORDER BY y LIMIT
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
    );
END;
$$;
