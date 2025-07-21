import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { ResponseVoucherTable, RpcParamsVoucher } from "./types";
import { nanoid } from "nanoid";
import { Database } from "@/lib/database/database.types";

export type VoucherRowType = Database["public"]["Tables"]["vouchers"]["Row"];
export type VoucherInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];

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

  async createVoucher(
    data: Omit<VoucherInsertType, "code">
  ): Promise<VoucherRowType> {
    const uniqueCode = `VCHR-${nanoid(10).toUpperCase()}`;

    const { data: inserted, error } = await supabase
      .from("vouchers")
      .insert({ ...data, code: uniqueCode })
      .select()
      .single();

    if (error) {
      console.error("[CREATE_VOUCHER_ERROR]", error.message);
      throw new Error("Error creating voucher: " + error.message);
    }

    return inserted;
  }
}
