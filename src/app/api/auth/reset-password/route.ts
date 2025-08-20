import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token y nueva contraseña requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de nueva contraseña (puedes reutilizar la lógica del PUT)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "La nueva contraseña debe contener al menos una letra mayúscula",
        },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "La nueva contraseña debe contener al menos una letra minúscula",
        },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La nueva contraseña debe contener al menos un número" },
        { status: 400 }
      );
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "La nueva contraseña debe contener al menos un carácter especial (!@#$%^&*)",
        },
        { status: 400 }
      );
    }

    // Buscar el token en la tabla password_resets
    const { data: reset, error: resetError } = await supabase
      .from("password_resets")
      .select("user_id, expires_at, used")
      .eq("token", token)
      .single();

    if (resetError || !reset) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }
    if (reset.used) {
      return NextResponse.json(
        { error: "Este enlace ya fue utilizado" },
        { status: 400 }
      );
    }
    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "El enlace ha expirado" },
        { status: 400 }
      );
    }

    // Cambiar la contraseña usando el user_id (id de auth)
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      reset.user_id,
      { password: newPassword }
    );
    if (updateError) {
      return NextResponse.json(
        { error: "No se pudo actualizar la contraseña" },
        { status: 500 }
      );
    }

    // Marcar el token como usado
    await supabase
      .from("password_resets")
      .update({ used: true })
      .eq("token", token);

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/auth/reset-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
