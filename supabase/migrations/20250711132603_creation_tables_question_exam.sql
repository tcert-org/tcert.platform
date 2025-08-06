
--Se agrego el campo name_exam para el nombre del examen
ALTER TABLE exams
ADD COLUMN name_exam varchar(50);

--Se agrego el campo active para el estado del examen
ALTER TABLE exams
ADD COLUMN active BOOLEAN;

--Se elimino el campo max_attempts porque era redundante
ALTER TABLE exams
DROP COLUMN max_attempts;

--Se creo la tabla type_question para añadir las opciones de preguntas
CREATE TABLE type_question(
  id SERIAL PRIMARY KEY,
  type_option varchar(50)
);

--se añadio el type_question para saber el tipo de pregunta
ALTER TABLE questions
ADD COLUMN type_question INT;

--Se agrego el campo active para el estado de la question
ALTER TABLE questions
ADD COLUMN active BOOLEAN;


--Se realizo la llave foranea entre tabla type }_question y question
ALTER TABLE questions
ADD CONSTRAINT fk_type_question
FOREIGN KEY (type_question)
REFERENCES type_question(id)
ON DELETE SET NULL;


