import { NextResponse } from "next/server";
import VoucherService from "./service";
import { CreateParamsVoucher, FilterParamsVoucher } from "./types";
import { ApiResponse } from "@/lib/types";

export default class VoucherController {
  // (Puedes omitir este método si llamas directo a Table en la route)
  static async getVouchers(
    filters: FilterParamsVoucher
  ): Promise<NextResponse<ApiResponse<{ data: any[]; totalCount: number }>>> {
    try {
      const result = await VoucherService.getVouchersWithFilters(filters);
      return NextResponse.json({
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 500 }
      );
    }
  }

  static async createVoucher(
    data: CreateParamsVoucher
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const result = await VoucherService.createVoucher(data);

      if (!result) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "No se pudo crear el voucher",
        });
      }

      return NextResponse.json({
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
