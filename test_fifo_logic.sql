-- Script de prueba para verificar la lógica FIFO de asignación de vouchers

-- Ejemplo de datos de prueba:
-- Partner 1 tiene:
--   Pago 1: 10 vouchers (creado primero)
--   Pago 2: 15 vouchers (creado segundo)  
--   Pago 3: 8 vouchers (creado tercero)
-- 
-- El partner ha vendido/asignado 18 vouchers en total
-- Con lógica FIFO:
--   - Los primeros 10 vouchers asignados vienen del Pago 1 (totalmente consumido)
--   - Los siguientes 8 vouchers asignados vienen del Pago 2 (7 disponibles)
--   - El Pago 3 tiene todos sus vouchers disponibles (8 disponibles)

-- Datos de ejemplo (para insertar en tablas reales):
/*
INSERT INTO payments (partner_id, voucher_quantity, unit_price, total_price, created_at) VALUES
(1, 10, 5.00, 50.00, '2024-01-01 10:00:00'),  -- Pago 1
(1, 15, 5.00, 75.00, '2024-01-02 10:00:00'),  -- Pago 2
(1, 8, 5.00, 40.00, '2024-01-03 10:00:00');   -- Pago 3

-- Simular 18 vouchers asignados/vendidos
INSERT INTO vouchers (partner_id, used, purchase_date) 
SELECT 1, true, '2024-01-10 10:00:00'
FROM generate_series(1, 18);
*/

-- Función de prueba para verificar la lógica FIFO
-- Esta función simula los cálculos sin necesidad de datos reales

CREATE OR REPLACE FUNCTION test_fifo_logic()
RETURNS TABLE(
    pago_id text,
    total_vouchers integer,
    assigned_vouchers integer,
    unassigned_vouchers integer,
    precio_extension numeric
) AS $$
DECLARE
    -- Datos de ejemplo
    total_assigned integer := 18; -- Total vouchers asignados del partner
    extension_price_per_voucher numeric := 5.00;
BEGIN
    -- Pago 1: 10 vouchers (creado primero)
    RETURN QUERY SELECT 
        'Pago 1'::text,
        10::integer,
        CASE WHEN total_assigned >= 10 THEN 10 ELSE total_assigned END::integer,
        CASE WHEN total_assigned >= 10 THEN 0 ELSE 10 - total_assigned END::integer,
        (CASE WHEN total_assigned >= 10 THEN 0 ELSE 10 - total_assigned END * extension_price_per_voucher)::numeric;
    
    -- Pago 2: 15 vouchers (creado segundo, después de los 10 del Pago 1)
    RETURN QUERY SELECT 
        'Pago 2'::text,
        15::integer,
        CASE WHEN total_assigned <= 10 THEN 0 
             WHEN total_assigned >= 25 THEN 15 
             ELSE total_assigned - 10 END::integer,
        CASE WHEN total_assigned <= 10 THEN 15 
             WHEN total_assigned >= 25 THEN 0 
             ELSE 15 - (total_assigned - 10) END::integer,
        (CASE WHEN total_assigned <= 10 THEN 15 
              WHEN total_assigned >= 25 THEN 0 
              ELSE 15 - (total_assigned - 10) END * extension_price_per_voucher)::numeric;
    
    -- Pago 3: 8 vouchers (creado tercero, después de los 25 anteriores)
    RETURN QUERY SELECT 
        'Pago 3'::text,
        8::integer,
        CASE WHEN total_assigned <= 25 THEN 0 
             WHEN total_assigned >= 33 THEN 8 
             ELSE total_assigned - 25 END::integer,
        CASE WHEN total_assigned <= 25 THEN 8 
             WHEN total_assigned >= 33 THEN 0 
             ELSE 8 - (total_assigned - 25) END::integer,
        (CASE WHEN total_assigned <= 25 THEN 8 
              WHEN total_assigned >= 33 THEN 0 
              ELSE 8 - (total_assigned - 25) END * extension_price_per_voucher)::numeric;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la prueba
-- SELECT * FROM test_fifo_logic();

-- Resultado esperado:
-- Pago 1: 10 total, 10 asignados, 0 disponibles → $0 extensión
-- Pago 2: 15 total, 8 asignados, 7 disponibles → $35 extensión  
-- Pago 3: 8 total, 0 asignados, 8 disponibles → $40 extensión
