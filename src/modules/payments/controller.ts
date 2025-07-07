// src/modules/payments/controller.ts
import { NextResponse } from "next/server";
import PaymentTable from "@/modules/payments/table";
import { PaymentsInsertType } from "./types";
import { ApiResponse } from "@/lib/types";

export default class PaymentController {
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
}
