import { NextResponse } from "next/server";
import VoucherStateController from "@/modules/voucher-state/controller";

export async function GET() {
  try {
    const response = await VoucherStateController.getAllStatuses();
    return response;
  } catch {
    return NextResponse.json({
      statusCode: 500,
      data: null,
      error: "Error al obtener los statuses.",
    });
  }
}
