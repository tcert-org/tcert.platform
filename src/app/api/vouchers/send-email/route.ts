import { NextRequest, NextResponse } from "next/server";
import { sendVoucherEmail } from "../../../../../tool-email/sendVoucherEmail";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    await sendVoucherEmail(email, code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el correo" },
      { status: 500 }
    );
  }
}
