import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default class VoucherController {
  static async getVoucherCounts(partner_id: number) {
    try {
      const { data, error } = await supabase
        .rpc("get_voucher_counts", { partner_id });

      if (error) {
        return NextResponse.json({
          statusCode: 500,
          data: null,
          error: error.message,
        });
      }

      return NextResponse.json({
        statusCode: 200,
        data,
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
