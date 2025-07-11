import { NextResponse } from "next/server";
import VoucherTable from "@/modules/vouchers/table";
import { ApiResponse } from "@/lib/types";
import {
  FilterParamsVoucher,
  RpcParamsVoucher,
  createParamsVoucher,
} from "./types";
import { addMonths } from "date-fns";

export default class VoucherController {
  static async getVouchers(filters: FilterParamsVoucher): Promise<
    NextResponse<
      ApiResponse<{
        data: any[];
        total: number;
        page: number;
        totalPages: number;
      }>
    >
  > {
    try {
      const {
        filter_code,
        filter_certification_name,
        filter_email,
        filter_available,
        filter_purchase_date,
        filter_expiration_date,
        filter_partner_id,
        order_by,
        order_dir,
        page = 1,
      } = filters;

      const limit = 10;

      const rpcParams: RpcParamsVoucher = {
        filter_code: filter_code || null,
        filter_certification_name: filter_certification_name || null,
        filter_email: filter_email || null,
        filter_available: filter_available ?? null,
        filter_purchase_date: filter_purchase_date || null,
        filter_expiration_date: filter_expiration_date || null,
        filter_partner_id: filter_partner_id ? Number(filter_partner_id) : null,
        filter_status_id: null,
        order_by: order_by || "purchase_date",
        order_dir: order_dir || "desc",
        page: page || 1,
      };

      const voucherTable = new VoucherTable();
      const result = await voucherTable.getVouchersWithFilters(rpcParams);

      return NextResponse.json({
        statusCode: 200,
        data: {
          data: result,
          total: result.length,
          page,
          totalPages: Math.ceil(result.length / limit),
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

  static async createVoucher(
    data: createParamsVoucher
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const {
        partner_id,
        certification_id = null,
        status_id,
        email,
        expiration_dates,
        used = false,
      } = data;

      const expiration_date =
        expiration_dates ??
        addMonths(
          new Date(),
          parseInt(process.env.VOUCHER_EXPIRATION_MONTHS || "24")
        ).toISOString();

      const voucherData = {
        partner_id: Number(partner_id),
        certification_id: certification_id ? Number(certification_id) : null,
        status_id: status_id ? Number(status_id) : null,
        email: email,
        expiration_date,
        used: used,
      };

      const voucherTable = new VoucherTable();
      const result = await voucherTable.createVoucher(voucherData);

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
