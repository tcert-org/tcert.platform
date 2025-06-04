import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { VoucherCounts } from "./types";

export default class VoucherCountTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  async getVoucherCounts(partnerId: number): Promise<VoucherCounts> {
    const { data, error } = await supabase.rpc("get_voucher_counts", {
      partner_id: partnerId,
    });

    if (error) {
      console.error("[GET_VOUCHER_COUNTS_ERROR]", error.message);
      throw new Error("Error fetching voucher counts: " + error.message);
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("No voucher counts returned from Supabase.");
    }

    return data[0] as VoucherCounts;
  }
}
