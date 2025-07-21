import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { RpcParamsVoucher, DataVoucherTable } from "./types";
import { nanoid } from "nanoid";
import { Database } from "@/lib/database/database.types";

export type VoucherRowType = Database["public"]["Tables"]["vouchers"]["Row"];
export type VoucherInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];

// Estructura del resultado con total_count
type VoucherRowWithCount = DataVoucherTable & { total_count: number };

export default class VoucherTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  async getVouchersWithFilters(
    filters: RpcParamsVoucher
  ): Promise<{ data: DataVoucherTable[]; totalCount: number } | null> {
    try {
      const {
        filter_code,
        filter_certification_name,
        filter_used,
        filter_purchase_date,
        filter_purchase_date_op = ">=",
        filter_expiration_date,
        filter_expiration_date_op = ">=",
        filter_partner_id,
        order_by = "created_at",
        order_dir = "desc",
        page = 1,
        limit_value = 10,
      } = filters;

      if (!["asc", "desc"].includes(order_dir.toLowerCase())) {
        throw new Error("Invalid order_dir. Must be 'asc' or 'desc'.");
      }

      if (page <= 0 || limit_value <= 0) {
        throw new Error("Pagination values must be greater than 0.");
      }

      const { data, error } = await supabase.rpc("get_vouchers_with_filters", {
        filter_code: filter_code ?? null,
        filter_certification_name: filter_certification_name ?? null,
        filter_used: filter_used ?? null,
        filter_purchase_date: filter_purchase_date ?? null,
        filter_purchase_date_op: filter_purchase_date_op ?? ">=",
        filter_expiration_date: filter_expiration_date ?? null,
        filter_expiration_date_op: filter_expiration_date_op ?? ">=",
        filter_partner_id: filter_partner_id ?? null,
        order_by: order_by ?? "created_at",
        order_dir: order_dir ?? "desc",
        page: page ?? 1,
        limit_value: limit_value ?? 10,
      });

      if (error) throw new Error(`Error getting vouchers: ${error.message}`);

      const rows = data as VoucherRowWithCount[];

      return {
        data: rows.map(({ total_count, ...rest }) => rest),
        totalCount: rows[0]?.total_count ?? 0,
      };
    } catch (error: any) {
      console.error("Error in getVouchersWithFilters:", error.message);
      return null;
    }
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
