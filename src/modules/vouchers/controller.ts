import { NextResponse } from "next/server";
import VoucherTable from "@/modules/vouchers/table";
import { ApiResponse } from "@/lib/types";
import {
  FilterParamsVoucher,
  ResponseVoucherTable,
  RpcParamsVoucher,
} from "./types";

export default class VoucherController {
  static async getVouchers(
    filters: FilterParamsVoucher
  ): Promise<NextResponse<ApiResponse<ResponseVoucherTable | null>>> {
    try {
      const {
        filter_code,
        filter_certification_name,
        filter_student_fullname,
        filter_student_document_number,
        filter_email,
        filter_available,
        filter_purchase_date,
        filter_expiration_date,
        filter_partner_id,
        order_by,
        order_dir,
        page,
      } = filters;

      const rpcParams: RpcParamsVoucher = {
        filter_code: filter_code || null,
        filter_certification_name: filter_certification_name || null,
        filter_student_fullname: filter_student_fullname || null,
        filter_student_document_number: filter_student_document_number || null,
        filter_email: filter_email || null,
        filter_available: filter_available ?? null,
        filter_purchase_date: filter_purchase_date || null,
        filter_expiration_date: filter_expiration_date || null,
        filter_partner_id: filter_partner_id || null,
        order_by: order_by || "purchase_date",
        order_dir: order_dir || "desc",
        page: page || 1,
      };

      const voucherTable = new VoucherTable();
      const result = await voucherTable.getVouchersWithFilters(rpcParams);

      return NextResponse.json({
        statusCode: 200,
        data: {
          data: result.data,
          totalCount: result.totalCount,
        },
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
