import { NextRequest, NextResponse } from "next/server";
import DiplomaController from "@/modules/diploma/controller"; // Importamos el controlador de diploma

// POST: Insertar diploma
export async function POST(req: NextRequest) {
  try {
    // Obtenemos los datos del cuerpo de la solicitud
    const body = await req.json();

    console.log("📋 Datos recibidos para crear diploma:", body);

    // Llamamos al método insertDiploma del controlador para crear el diploma
    const response = await DiplomaController.insertDiploma(body);

    return response; // Devolvemos la respuesta del controlador
  } catch (error) {
    console.error("[DIPLOMA_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de diploma." },
      { status: 500 }
    );
  }
}

// GET: Obtener certificación asociada al voucher
export async function GET(req: NextRequest) {
  try {
    // Obtenemos el id del voucher desde los parámetros de la URL
    const url = new URL(req.url);
    const voucherId = url.searchParams.get("voucher_id");

    if (!voucherId) {
      return NextResponse.json(
        { error: "Falta el voucher_id en la consulta." },
        { status: 400 }
      );
    }

    // Llamamos al controlador para obtener la certificación asociada al voucher
    const certification = await DiplomaController.getCertificationFromVoucher({
      id: Number(voucherId), // Convertimos el id de voucher a número
    });

    return certification; // Devolvemos la respuesta del controlador
  } catch (error) {
    console.error("[DIPLOMA_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de certificación." },
      { status: 500 }
    );
  }
}
