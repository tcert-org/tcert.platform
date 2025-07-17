-- Adición de nuevos campos para la tabla exam_attempts
ALTER TABLE exam_attempts
ADD COLUMN correct_count int,
ADD COLUMN incorrect_count int,
ADD COLUMN unanswered_count int;

-- Eliminar tabla feedback
DROP TABLE feedback;

-- Eliminar este campo de exam_attempts
ALTER TABLE exam_attempts
DROP COLUMN voucher_id;
