import { NextResponse } from "next/server";
import VoucherCountTable from "./table";

export default class VoucherController {
  static async getVoucherCounts(partner_id: number) {
    try {
      const countTable = new VoucherCountTable();
      const data = await countTable.getVoucherCounts(partner_id);

      return NextResponse.json({
        statusCode: 200,
        data: {
          voucher_purchased: data.voucher_purchased,
          voucher_asigned: data.voucher_asigned,
          voucher_available: data.voucher_available,
          voucher_expired: data.voucher_expired,
        },
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
