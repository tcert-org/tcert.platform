import { NextRequest, NextResponse } from "next/server";
import VoucherStateController from "@/modules/voucher-state/controller";

export async function GET(req: NextRequest) {
  try {
    // Usamos req.nextUrl.searchParams para obtener los parámetros
    const { searchParams } = req.nextUrl;
    const voucherId = searchParams.get("voucher_id");

    if (!voucherId) {
      return NextResponse.json({
        statusCode: 400,
        error: "voucher_id es requerido.",
      });
    }

    // Llamamos al controlador para obtener el estado del voucher
    const response = await VoucherStateController.getVoucherState(
      Number(voucherId)
    );

    return response;
  } catch (error) {
    console.error(
      "⚠️ Error en la ruta al obtener el estado del voucher:",
      error
    );
    return NextResponse.json({
      statusCode: 500,
      data: null,
      error: "Error al obtener el estado del voucher.",
    });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    // Imprimir los datos que recibimos
    const { voucher_id, new_status_id, is_used } = await req.json();
    console.log(
      "📥 Datos recibidos en el endpoint para actualizar el estado del voucher:"
    );
    console.log("voucher_id:", voucher_id);
    console.log("new_status_id:", new_status_id);
    console.log("is_used:", is_used);

    const response = await VoucherStateController.updateVoucherState(
      voucher_id,
      new_status_id,
      is_used
    );

    return response;
  } catch (error) {
    console.error(
      "⚠️ Error en la ruta al actualizar el estado del voucher:",
      error
    );
    return NextResponse.json({
      statusCode: 500,
      data: null,
      error: "Error al actualizar el estado del voucher.",
    });
  }
}
