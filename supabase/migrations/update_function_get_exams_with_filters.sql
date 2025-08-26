CREATE
OR REPLACE FUNCTION public.get_exams_with_filters(
    filter_name_exam text DEFAULT NULL :: text,
    filter_certification_id bigint DEFAULT NULL :: bigint,
    filter_simulator boolean DEFAULT NULL :: boolean,
    filter_active boolean DEFAULT NULL :: boolean,
    filter_created_at date DEFAULT NULL :: date,
    filter_created_at_op text DEFAULT '>=' :: text,
    order_by text DEFAULT 'created_at' :: text,
    order_dir text DEFAULT 'DESC' :: text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 10
) RETURNS TABLE(
    id bigint,
    certification_id bigint,
    certification_name text,
    name_exam text,
    simulator boolean,
    time_limit integer,
    attempts integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    active boolean,
    total_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $ function $ DECLARE offset_val INT := (page - 1) * limit_value;

safe_order_by TEXT;

safe_order_dir TEXT;

BEGIN safe_order_by := CASE
    WHEN order_by IN (
        'id',
        'certification_id',
        'certification_name',
        'name_exam',
        'simulator',
        'time_limit',
        'attempts',
        'created_at',
        'updated_at',
        'active'
    ) THEN order_by
    ELSE 'created_at'
END;

safe_order_dir := CASE
    WHEN upper(order_dir) IN ('ASC', 'DESC') THEN upper(order_dir)
    ELSE 'DESC'
END;

RETURN QUERY EXECUTE format(
    $ f $ WITH exam_data AS (
        SELECT
            e.id,
            e.certification_id,
            c.name AS certification_name,
            e.name_exam :: text AS name_exam,
            -- ← AQUÍ CASTEA A TEXT
            e.simulator,
            e.time_limit,
            e.attempts,
            e.created_at,
            e.updated_at,
            e.active
        FROM
            exams e
            LEFT JOIN certifications c ON c.id = e.certification_id
        WHERE
            1 = 1 % s -- filtro name_exam
            % s -- filtro certification_id
            % s -- filtro simulator
            % s -- filtro active
            % s -- filtro created_at
    ),
    filtered AS (
        SELECT
            *,
            COUNT(*) OVER() AS total_count
        FROM
            exam_data
    )
    SELECT
        id,
        certification_id,
        certification_name,
        name_exam,
        simulator,
        time_limit,
        attempts,
        created_at,
        updated_at,
        active,
        total_count
    FROM
        filtered
    ORDER BY
        % I % s OFFSET % s
    LIMIT
        % s $ f $, CASE
            WHEN filter_name_exam IS NOT NULL THEN format(
                'AND e.name_exam ILIKE %L',
                '%' || filter_name_exam || '%'
            )
            ELSE ''
        END,
        CASE
            WHEN filter_certification_id IS NOT NULL THEN format(
                'AND e.certification_id = %s',
                filter_certification_id
            )
            ELSE ''
        END,
        CASE
            WHEN filter_simulator IS NOT NULL THEN format('AND e.simulator = %L', filter_simulator)
            ELSE ''
        END,
        CASE
            WHEN filter_active IS NOT NULL THEN format('AND e.active = %L', filter_active)
            ELSE ''
        END,
        CASE
            WHEN filter_created_at IS NOT NULL THEN format(
                'AND e.created_at::date %s %L',
                filter_created_at_op,
                filter_created_at
            )
            ELSE ''
        END,
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
);

END;

$ function $

--------------------------------------Antes/Despues-----------------------------------------------
CREATE
OR REPLACE FUNCTION public.get_exams_with_filters(
    filter_name_exam text DEFAULT NULL :: text,
    filter_certification_id bigint DEFAULT NULL :: bigint,
    filter_certification_name text DEFAULT NULL :: text,
    -- 👈 NUEVO: Filtro por nombre de certificación
    filter_simulator boolean DEFAULT NULL :: boolean,
    filter_active boolean DEFAULT NULL :: boolean,
    filter_created_at date DEFAULT NULL :: date,
    filter_created_at_op text DEFAULT '>=' :: text,
    order_by text DEFAULT 'created_at' :: text,
    order_dir text DEFAULT 'DESC' :: text,
    page integer DEFAULT 1,
    limit_value integer DEFAULT 10
) RETURNS TABLE(
    id bigint,
    certification_id bigint,
    certification_name text,
    name_exam text,
    simulator boolean,
    time_limit integer,
    attempts integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    active boolean,
    total_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $ function $ DECLARE offset_val INT := (page - 1) * limit_value;

safe_order_by TEXT;

safe_order_dir TEXT;

BEGIN safe_order_by := CASE
    WHEN order_by IN (
        'id',
        'certification_id',
        'certification_name',
        'name_exam',
        'simulator',
        'time_limit',
        'attempts',
        'created_at',
        'updated_at',
        'active'
    ) THEN order_by
    ELSE 'created_at'
END;

safe_order_dir := CASE
    WHEN upper(order_dir) IN ('ASC', 'DESC') THEN upper(order_dir)
    ELSE 'DESC'
END;

RETURN QUERY EXECUTE format(
    $ f $ WITH exam_data AS (
        SELECT
            e.id,
            e.certification_id,
            c.name AS certification_name,
            e.name_exam :: text AS name_exam,
            -- ← AQUÍ CASTEA A TEXT
            e.simulator,
            e.time_limit,
            e.attempts,
            e.created_at,
            e.updated_at,
            e.active
        FROM
            exams e
            LEFT JOIN certifications c ON c.id = e.certification_id
        WHERE
            1 = 1 % s -- filtro name_exam
            % s -- filtro certification_id
            % s -- filtro certification_name (NUEVO)
            % s -- filtro simulator
            % s -- filtro active
            % s -- filtro created_at
    ),
    filtered AS (
        SELECT
            *,
            COUNT(*) OVER() AS total_count
        FROM
            exam_data
    )
    SELECT
        id,
        certification_id,
        certification_name,
        name_exam,
        simulator,
        time_limit,
        attempts,
        created_at,
        updated_at,
        active,
        total_count
    FROM
        filtered
    ORDER BY
        % I % s OFFSET % s
    LIMIT
        % s $ f $, CASE
            WHEN filter_name_exam IS NOT NULL THEN format(
                'AND e.name_exam ILIKE %L',
                '%' || filter_name_exam || '%'
            )
            ELSE ''
        END,
        CASE
            WHEN filter_certification_id IS NOT NULL THEN format(
                'AND e.certification_id = %s',
                filter_certification_id
            )
            ELSE ''
        END,
        CASE
            WHEN filter_certification_name IS NOT NULL THEN format(
                'AND c.name ILIKE %L',
                '%' || filter_certification_name || '%'
            )
            ELSE ''
        END,
        CASE
            WHEN filter_simulator IS NOT NULL THEN format('AND e.simulator = %L', filter_simulator)
            ELSE ''
        END,
        CASE
            WHEN filter_active IS NOT NULL THEN format('AND e.active = %L', filter_active)
            ELSE ''
        END,
        CASE
            WHEN filter_created_at IS NOT NULL THEN format(
                'AND e.created_at::date %s %L',
                filter_created_at_op,
                filter_created_at
            )
            ELSE ''
        END,
        safe_order_by,
        safe_order_dir,
        offset_val,
        limit_value
);

END;

$ function $