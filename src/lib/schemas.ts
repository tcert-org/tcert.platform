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
