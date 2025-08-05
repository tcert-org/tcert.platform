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
      .select(
        `
        status_id,
        voucher_statuses!inner(
          id,
          name,
          slug
        )
      `
      )
      .eq("id", voucherId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  // Nuevo método para obtener el ID de un status por su slug
  async getStatusIdBySlug(slug: string) {
    const { data, error } = await supabase
      .from("voucher_statuses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error) {
      return null;
    }

    return data?.id || null;
  }

  // Nuevo método para obtener información completa de todos los statuses
  async getAllStatuses() {
    const { data, error } = await supabase
      .from("voucher_statuses")
      .select("id, name, slug")
      .order("id");

    if (error) {
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
