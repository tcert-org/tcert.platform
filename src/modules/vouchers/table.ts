import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";
import { supabase } from "@/lib/database/conection";
import { ResponseVoucherTable, RpcParamsVoucher } from "./types";

export type VoucherRowType = Database["public"]["Tables"]["vouchers"]["Row"];
export type VoucherInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];
export type VoucherUpdateType =
  Database["public"]["Tables"]["vouchers"]["Update"];

export default class VoucherTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  async getVouchersWithFilters(
    params: RpcParamsVoucher
  ): Promise<ResponseVoucherTable> {
    const { data, error } = await supabase.rpc(
      "get_vouchers_with_filters",
      params
    );

    if (error) {
      throw new Error("Could not retrieve vouchers: " + error.message);
    }

    return data as ResponseVoucherTable;
  }
}
