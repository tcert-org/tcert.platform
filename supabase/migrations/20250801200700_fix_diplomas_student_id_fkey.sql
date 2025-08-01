-- Corregir la foreign key constraint de diplomas.student_id
-- para que referencie students(id) en lugar de users(id)

-- Primero eliminamos la constraint actual
ALTER TABLE diplomas DROP CONSTRAINT IF EXISTS diplomas_student_id_fkey;

-- Agregamos la nueva constraint que referencia students
ALTER TABLE diplomas 
ADD CONSTRAINT diplomas_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES students(id);
