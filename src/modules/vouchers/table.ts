import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { FilterParamsVoucher, DataVoucherTable } from "./types";
import { nanoid } from "nanoid";
import { Database } from "@/lib/database/database.types";

export type VoucherRowType = Database["public"]["Tables"]["vouchers"]["Row"];
export type VoucherInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];
type VoucherRowWithCount = DataVoucherTable & { total_count: number };

export default class VoucherTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  // === Paginación y filtrado dinámico (idéntico a exam) ===
  async getVouchersForTable(
    filters: FilterParamsVoucher
  ): Promise<{ data: DataVoucherTable[]; totalCount: number } | null> {
    try {
      const {
        filter_code,
        filter_certification_name,
        filter_email,
        filter_available,
        filter_purchase_date,
        filter_expiration_date,
        filter_partner_id,
        order_by = "created_at",
        order_dir = "desc",
        page = 1,
        limit_value = 10,
      } = filters;

      // --- LOG MASTER ---
      console.log("\n=========== GET VOUCHERS FOR TABLE ==========");
      console.log("Params enviados a Supabase:", {
        filter_available,
        filter_certification_name,
        filter_code,
        filter_email,
        filter_expiration_date,
        filter_partner_id,
        filter_purchase_date,
        filter_status_id: null, // Siempre null si no filtras por estado
        order_by,
        order_dir,
        page,
        limit_value,
      });
      console.log("=============================================\n");

      // SIEMPRE manda TODOS los argumentos en orden, aunque vayan en null
      const { data, error } = await supabase.rpc("get_vouchers_with_filters", {
        filter_available:
          typeof filter_available === "boolean" ? filter_available : null,
        filter_certification_name: filter_certification_name ?? null,
        filter_code: filter_code ?? null,
        filter_email: filter_email ?? null,
        filter_expiration_date: filter_expiration_date ?? null,
        filter_partner_id: filter_partner_id ? Number(filter_partner_id) : null,
        filter_purchase_date: filter_purchase_date ?? null,
        filter_status_id: null, // SIEMPRE envía null
        order_by: order_by ?? "created_at",
        order_dir: order_dir ?? "desc",
        page: page ?? 1,
        limit_value: limit_value ?? 10,
      });

      if (error) {
        console.error("ERROR SUPABASE:", error);
        throw new Error(`Error getting vouchers: ${error.message}`);
      }

      const rows = data as VoucherRowWithCount[];
      console.log("==> DATA DEVUELTA DE SUPABASE:", rows);

      return {
        data: rows.map(({ total_count, ...rest }) => rest),
        totalCount: rows[0]?.total_count ?? 0,
      };
    } catch (error: any) {
      console.error("Error in getVouchersForTable:", error.message, error);
      return null;
    }
  }

  // === Crear voucher (idéntico a createExam) ===
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
      throw new Error("Error creando voucher: " + error.message);
    }

    return inserted;
  }

  // === (Opcional) Buscar voucher por ID ===
  async getVoucherById(id: number) {
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  }
}
