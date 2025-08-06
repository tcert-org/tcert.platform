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
    const body = await req.json();
    const { voucher_id, new_status_id, new_status_slug, is_used } = body;

    // Determinar si usar slug o ID
    if (new_status_slug) {
      // Usar el nuevo método con slug
      const response = await VoucherStateController.updateVoucherStateBySlug(
        voucher_id,
        new_status_slug,
        is_used
      );
      return response;
    } else if (new_status_id) {
      // Usar el método tradicional con ID
      const response = await VoucherStateController.updateVoucherState(
        voucher_id,
        new_status_id,
        is_used
      );
      return response;
    } else {
      return NextResponse.json({
        statusCode: 400,
        error: "Se requiere 'new_status_id' o 'new_status_slug'.",
      });
    }
  } catch {
    return NextResponse.json({
      statusCode: 500,
      data: null,
      error: "Error al actualizar el estado del voucher.",
    });
  }
}
