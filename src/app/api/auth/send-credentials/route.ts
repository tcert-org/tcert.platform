import { NextRequest, NextResponse } from "next/server";
import { sendCredentialsPartner } from "../../../../../tool-email/sendVoucherEmail";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }
    await sendCredentialsPartner(email, password);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enviando credenciales:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el correo" },
      { status: 500 }
    );
  }
}
