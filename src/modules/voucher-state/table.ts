import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type VoucherStateRowType =
  Database["public"]["Tables"]["vouchers"]["Row"];
export type VoucherStateInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];

export default class VoucherStateTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  async getVoucherState(voucherId: number) {
    const { data, error } = await supabase
      .from("vouchers")
      .select("status_id")
      .eq("id", voucherId)
      .single();

    if (error) {
      console.error("Error al obtener el estado del voucher:", error);
      return null;
    }

    return data;
  }

  async updateStateVoucher(id: number, newStatusId: number, isUsed: boolean) {
    const { data, error } = await supabase
      .from("vouchers")
      .update({ status_id: newStatusId, used: isUsed })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }
}
