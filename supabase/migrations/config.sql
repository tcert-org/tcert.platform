CREATE TABLE payments (
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

CREATE TRIGGER validate_roles_trigger
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION validate_user_roles();

---------------------------------------------------------------------------------------------------
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
---------------------------------------------------------------------------------------------------

