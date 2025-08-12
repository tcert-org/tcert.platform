-- Migración para agregar el campo extension_used a la tabla payments
-- Fecha: 2025-08-12

-- Agregar columna extension_used a la tabla payments
ALTER TABLE payments 
ADD COLUMN extension_used BOOLEAN DEFAULT FALSE;

-- Comentario para explicar el campo
COMMENT ON COLUMN payments.extension_used IS 'Indica si este pago ya ha utilizado su extensión de tiempo';

-- Índice para mejorar consultas
CREATE INDEX idx_payments_extension_used ON payments(extension_used);
