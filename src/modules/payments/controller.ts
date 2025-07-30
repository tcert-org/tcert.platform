// src/modules/payments/controller.ts

import { NextRequest, NextResponse } from "next/server";
import PaymentTable, {
  FilterParamsPayment,
} from "@/modules/payments/table";
import { PaymentsInsertType } from "./types";
import { ApiResponse } from "@/lib/types";

export default class PaymentController {
  // Crear nuevo pago
  static async createPayment(
    data: PaymentsInsertType
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const paymentTable = new PaymentTable();
      const result = await paymentTable.createPayment(data);

      return NextResponse.json({
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // ✅ Obtener pagos con filtros dinámicos y paginación
  static async getPaymentsWithFilters(
    req: NextRequest
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const searchParams = req.nextUrl.searchParams;

      const filters: FilterParamsPayment = {
        filter_partner_name: searchParams.get("filter_partner_name") ?? undefined,
        filter_created_at: searchParams.get("filter_created_at") ?? undefined,
        filter_created_at_op: searchParams.get("filter_created_at_op") ?? undefined,
        filter_total_price: searchParams.get("filter_total_price")
          ? Number(searchParams.get("filter_total_price"))
          : undefined,
        filter_total_price_op: searchParams.get("filter_total_price_op") ?? undefined,
        order_by: searchParams.get("order_by") ?? "created_at",
        order_dir: searchParams.get("order_dir") ?? "desc",
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit_value: searchParams.get("limit_value")
          ? Number(searchParams.get("limit_value"))
          : 10,
      };

      const paymentTable = new PaymentTable();
      const { data, totalCount } = await paymentTable.getPaymentsWithFilters(filters);

      return NextResponse.json({
        statusCode: 200,
        data,
        meta: { totalCount },
      });
    } catch (error) {
      console.error("Error in getPaymentsWithFilters:", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
