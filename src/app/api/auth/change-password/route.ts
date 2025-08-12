import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Contraseña actual y nueva son requeridas" },
        { status: 400 }
      );
    }

    // Validar formato de nueva contraseña
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

    // Obtener el usuario actual desde las cookies o headers de autenticación
    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // Verificar la contraseña actual intentando hacer login
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (loginError) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 400 }
      );
    }

    // Cambiar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Error al cambiar la contraseña" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Contraseña cambiada exitosamente",
    });
  } catch (error) {
    console.error("Error in PUT /api/auth/change-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
