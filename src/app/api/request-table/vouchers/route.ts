import { NextRequest, NextResponse } from "next/server";
import VoucherMiddleware from "@/modules/vouchers/middleware";
import VoucherController from "@/modules/vouchers/controller";

export async function POST(req: NextRequest) {
  return VoucherMiddleware.validateFilters(req, VoucherController.getVouchers);
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // En caso de que luego quieras obtener 1 voucher por ID
  if (id) {
    return NextResponse.json(
      {
        statusCode: 501,
        data: null,
        error: "GET by ID not implemented for vouchers.",
      },
      { status: 501 }
    );
  }

  // Si no hay ID, filtrado con parámetros dinámicos
  return VoucherMiddleware.validateFilters(req, VoucherController.getVouchers);
}
