import { NextRequest, NextResponse } from "next/server";
import DiplomaController from "@/modules/diploma/controller";

// GET: Obtener datos del diploma y estudiante por código de voucher
export async function GET(req: NextRequest) {
  try {
    // Obtenemos el código del voucher desde los parámetros de la URL
    const url = new URL(req.url);
    const voucherCode = url.searchParams.get("voucher_code");

    if (!voucherCode) {
      return NextResponse.json(
        { error: "Falta el voucher_code en la consulta." },
        { status: 400 }
      );
    }

    // Llamamos al controlador para obtener los datos completos
    const diplomaData = await DiplomaController.getDiplomaAndStudentByVoucherCode({
      code: voucherCode
    });

    return diplomaData; // Devolvemos la respuesta del controlador
  } catch (error) {
    console.error("[DIPLOMA_BY_VOUCHER_CODE_ERROR]", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de diploma por código de voucher." },
      { status: 500 }
    );
  }
}
