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
CREATE OR REPLACE FUNCTION public.get_voucher_counts(p_id bigint)
RETURNS TABLE(
  voucher_purchased integer,
  voucher_asigned   integer,
  voucher_expired   integer,
  voucher_available integer
) AS $$
BEGIN
  RETURN QUERY
  WITH p AS (
    SELECT
      id,
      voucher_quantity,
      expiration_date,
      COALESCE(payment_expirated, FALSE) AS expirated
    FROM public.payments
    WHERE partner_id = p_id
  ),
  used AS (
    SELECT payment_id, COUNT(*)::int AS used
    FROM public.vouchers
    WHERE partner_id = p_id
    GROUP BY payment_id
  ),
  expired_slots AS (
    /* Vencidos = cupos NO usados en pagos vencidos */
    SELECT
      COALESCE(SUM(GREATEST(p.voucher_quantity - COALESCE(u.used, 0), 0)), 0)::int AS expired_unassigned
    FROM p
    LEFT JOIN used u ON u.payment_id = p.id
    WHERE p.expirated = TRUE
       OR (p.expiration_date IS NOT NULL AND p.expiration_date <= NOW())
  ),
  totals AS (
    SELECT
      COALESCE((SELECT SUM(voucher_quantity) FROM p), 0)::int AS purchased,
      COALESCE((SELECT COUNT(*) FROM public.vouchers v WHERE v.partner_id = p_id), 0)::int AS assigned,
      COALESCE((SELECT expired_unassigned FROM expired_slots), 0)::int AS expired_unassigned
  )
  SELECT
    purchased                       AS voucher_purchased,
    assigned                        AS voucher_asigned,
    expired_unassigned              AS voucher_expired,
    GREATEST(purchased - assigned - expired_unassigned, 0) AS voucher_available
  FROM totals;
END;
$$ LANGUAGE plpgsql STABLE;

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
  files text,           -- <--- AGREGA ESTA LÍNEA
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
$$;

-- ========== 1.1 Columna y FK ==========
ALTER TABLE public.vouchers
  ADD COLUMN IF NOT EXISTS payment_id int4;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.vouchers'::regclass
      AND conname = 'fk_vouchers_payment'
  ) THEN
    ALTER TABLE public.vouchers
      ADD CONSTRAINT fk_vouchers_payment
      FOREIGN KEY (payment_id)
      REFERENCES public.payments(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END$$;

-- ========== 1.2 Índices ==========
CREATE INDEX IF NOT EXISTS idx_vouchers_payment_id
  ON public.vouchers(payment_id);

CREATE INDEX IF NOT EXISTS idx_payments_partner_created_at
  ON public.payments(partner_id, created_at, id);

-- ========== 1.3 Trigger: asignar el payment más viejo con cupo ==========
-- Reemplaza la función del trigger para filtrar pagos vigentes
CREATE OR REPLACE FUNCTION public.set_payment_id_on_voucher_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  chosen_payment_id int4;
BEGIN
  IF NEW.partner_id IS NULL THEN
    RAISE EXCEPTION 'vouchers.partner_id no puede ser NULL para asignar payment_id';
  END IF;

  /*
    Toma el pago MÁS VIEJO del mismo partner que:
    - NO esté vencido (expiration_date > NOW()) y
    - payment_expirated = false (por si ya lo refrescaste en login),
    - y aún tenga cupo.
    Se usa FOR UPDATE SKIP LOCKED para seguridad en concurrencia.
  */
  SELECT p.id
    INTO chosen_payment_id
  FROM public.payments p
  WHERE p.partner_id = NEW.partner_id
    AND (p.expiration_date IS NOT NULL AND p.expiration_date > NOW())
    AND COALESCE(p.payment_expirated, FALSE) = FALSE
    AND p.voucher_quantity >
        COALESCE((SELECT COUNT(*) FROM public.vouchers v WHERE v.payment_id = p.id), 0)
  ORDER BY p.created_at ASC, p.id ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF chosen_payment_id IS NULL THEN
    RAISE EXCEPTION
      'No hay pagos VIGENTES con cupo para partner_id=%.', NEW.partner_id;
  END IF;

  NEW.payment_id := chosen_payment_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_payment_id_on_voucher_insert ON public.vouchers;

CREATE TRIGGER trg_set_payment_id_on_voucher_insert
BEFORE INSERT ON public.vouchers
FOR EACH ROW
EXECUTE FUNCTION public.set_payment_id_on_voucher_insert();



BEGIN;

WITH used_per_payment AS (
  SELECT payment_id, COUNT(*) AS used_cnt
  FROM public.vouchers
  WHERE payment_id IS NOT NULL
  GROUP BY payment_id
),

payment_free_slots AS (
  SELECT
    p.id AS payment_id,
    p.partner_id,
    p.created_at,
    gs AS slot_num
  FROM public.payments p
  LEFT JOIN used_per_payment u ON u.payment_id = p.id
  CROSS JOIN LATERAL generate_series(COALESCE(u.used_cnt,0)+1, p.voucher_quantity) AS gs
  WHERE (p.expiration_date IS NOT NULL AND p.expiration_date > NOW())
    AND COALESCE(p.payment_expirated, FALSE) = FALSE
),

numbered_vouchers AS (
  SELECT
    v.id AS voucher_id,
    v.partner_id,
    ROW_NUMBER() OVER (
      PARTITION BY v.partner_id
      ORDER BY v.created_at ASC, v.id ASC
    ) AS rn
  FROM public.vouchers v
  WHERE v.payment_id IS NULL
    AND v.partner_id IS NOT NULL
),

numbered_slots AS (
  SELECT
    payment_id,
    partner_id,
    ROW_NUMBER() OVER (
      PARTITION BY partner_id
      ORDER BY created_at ASC, payment_id ASC, slot_num ASC
    ) AS rn
  FROM payment_free_slots
)

UPDATE public.vouchers v
SET payment_id = s.payment_id
FROM numbered_vouchers nv
JOIN numbered_slots s
  ON s.partner_id = nv.partner_id
 AND s.rn = nv.rn
WHERE v.id = nv.voucher_id;

COMMIT;

-- Verificación
SELECT COUNT(*) AS vouchers_sin_payment
FROM public.vouchers
WHERE payment_id IS NULL;


-- Verificación rápida: cuántos vouchers siguen sin payment_id
SELECT COUNT(*) AS vouchers_sin_payment
FROM public.vouchers
WHERE payment_id IS NULL;





-- Cupos por pago
SELECT
  p.id AS payment_id,
  p.partner_id,
  p.created_at,
  p.voucher_quantity,
  COUNT(v.id) AS used_count,
  (p.voucher_quantity - COUNT(v.id)) AS remaining
FROM public.payments p
LEFT JOIN public.vouchers v ON v.payment_id = p.id
GROUP BY p.id
ORDER BY p.partner_id, p.created_at;

-- Trazabilidad voucher -> pago
SELECT
  v.id AS voucher_id,
  v.code,
  v.partner_id,
  v.created_at AS voucher_created_at,
  p.id AS payment_id,
  p.created_at AS payment_created_at
FROM public.vouchers v
LEFT JOIN public.payments p ON p.id = v.payment_id
ORDER BY v.partner_id, p.created_at, v.created_at

--------------------------------------------


-- Columna (si aún no existe)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_expirated boolean NOT NULL DEFAULT false;

-- Función: marca payment_expirated según expiration_date (<= NOW())
CREATE OR REPLACE FUNCTION public.refresh_payment_expirated(p_partner_id int4 DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  rows_updated integer := 0;
BEGIN
  IF p_partner_id IS NULL THEN
    UPDATE public.payments p
       SET payment_expirated = (p.expiration_date IS NOT NULL AND p.expiration_date <= NOW())
     WHERE payment_expirated IS DISTINCT FROM (p.expiration_date IS NOT NULL AND p.expiration_date <= NOW());
  ELSE
    UPDATE public.payments p
       SET payment_expirated = (p.expiration_date IS NOT NULL AND p.expiration_date <= NOW())
     WHERE p.partner_id = p_partner_id
       AND payment_expirated IS DISTINCT FROM (p.expiration_date IS NOT NULL AND p.expiration_date <= NOW());
  END IF;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

-- Permiso para llamarla como RPC en Supabase
GRANT EXECUTE ON FUNCTION public.refresh_payment_expirated(int4) TO authenticated;

-- Índice recomendado para acelerar actualizaciones/consultas
CREATE INDEX IF NOT EXISTS idx_payments_partner_expdate
  ON public.payments(partner_id, expiration_date, payment_expirated);
