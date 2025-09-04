import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { sendResetPasswordEmail } from "../../../../tool-email/mailer";

// Configura tu Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  // Busca el usuario
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, user_uuid")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "El correo no está registrado." },
      { status: 404 }
    );
  }

  // Genera un token único
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1h

  // Guarda el token en la tabla de reseteo
  const { error: insertError } = await supabase.from("password_resets").insert({
    user_id: user.user_uuid,
    token,
    expires_at: expires,
  });
  if (insertError) {
    console.error("Error insertando en password_resets:", insertError);
    return NextResponse.json(
      { error: "No se pudo generar el enlace de recuperación." },
      { status: 500 }
    );
  }

  // Envía el email
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  try {
    await sendResetPasswordEmail(user.email, resetUrl);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error enviando email de recuperación:", err);
    return NextResponse.json(
      { error: "No se pudo enviar el correo. Intenta más tarde." },
      { status: 500 }
    );
  }
}
