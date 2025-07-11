import { z } from "zod";

export const studentLoginSchema = z.object({
  token: z.string().min(10, "El token es de mínimo 10 caracteres"),
});

export const partnerLoginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, {
      message: "La contraseña debe contener al menos una letra mayúscula",
    })
    .regex(/[a-z]/, {
      message: "La contraseña debe contener al menos una letra minúscula",
    })
    .regex(/[0-9]/, {
      message: "La contraseña debe contener al menos un número",
    })
    .regex(/[^A-Za-z0-9]/, {
      message:
        "La contraseña debe contener al menos un carácter especial (!@#$%^&*)",
    }),
});

//Esquema de validacion para el examen

export const ExamRegisterSchema = z.object({
  certification_id: z
    .number({ required_error: "La certificación es obligatoria." })
    .min(1, "Debes seleccionar una certificación válida."),
  simulator: z.boolean({
    required_error: "Es obligatorio escoger si es examen o no.",
  }),
  name_exam: z.string({ required_error: "Debes agregar un nombre." }),
  active: z.boolean({
    required_error:
      "Debes seleccionar si está activo o inactivo el examen o simulador.",
  }),
  attempts: z.number().nullable().optional(),
  time_limit: z.number().nullable().optional(),
});

//Esquema de validacion para las preguntas

export const QuestionRegisterSchema = z.object({
  exam_id: z
    .number({ required_error: "El examenvinculado es obligatorio" })
    .min(1, "Debes seleccionar un examen valido"),
  content: z
    .string({ required_error: "Es obligatorio el contexto de la pregunta" })
    .min(3),
  type_question: z
    .number({ required_error: "El tipo de pregunta es obligatorio." })
    .min(1, "Debes seleccionar un tipo valido"),
  active: z.boolean({
    required_error: "Debes seleccionar si está activa o inactiva la pregunta.",
  }),
});
