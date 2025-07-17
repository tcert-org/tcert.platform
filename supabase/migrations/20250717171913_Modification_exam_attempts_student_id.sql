-- Borrar columna por mala relación
ALTER TABLE exam_attempts
DROP COLUMN student_id;

-- Agregar el nuevo campo con la relación correcta
ALTER TABLE exam_attempts
ADD COLUMN student_id bigint REFERENCES students(id);
