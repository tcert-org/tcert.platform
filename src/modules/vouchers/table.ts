import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";
import { supabase } from "@/lib/database/conection";
import { FilterParamsVoucher } from "@/app/api/request-table/vouchers/route";

export type VoucherRowType = Database["public"]["Tables"]["vouchers"]["Row"];
export type VoucherInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];
export type VoucherUpdateType =
  Database["public"]["Tables"]["vouchers"]["Update"];

export interface VoucherDinamicTable {
  code: string;
  certification_name: string;
  student_name: string;
  student_document: string;
  buyer_email: string;
  available: boolean;
  purchase_date: string;
  expiration_date: string;
  partner_id: string;
}

export default class VoucherTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  async getVouchersForTable(
    filters: FilterParamsVoucher
  ): Promise<{ data: VoucherDinamicTable[]; totalCount: number } | null> {
    try {
      const {
        filter_code,
        filter_certification_name,
        filter_student_name,
        filter_student_document,
        filter_buyer_email,
        filter_available,
        filter_purchase_date_op,
        filter_expiration_date_op,
        partner_id,
        page = 1,
        limit = 10,
        order_by = "purchase_date",
        order_dir = "desc",
      } = filters;

      // Validaciones básicas
      if (!["asc", "desc"].includes(order_dir)) {
        throw new Error(
          "Invalid order_dir parameter. It must be 'asc' or 'desc'."
        );
      }

      if (limit <= 0 || page <= 0) {
        throw new Error("Pagination values must be greater than 0.");
      }

      if (partner_id === undefined) {
        throw new Error("partner_id is required.");
      }

      // Ejecutar consulta para obtener vouchers paginados usando RPC
      const { data: result, error: vouchersError } = await supabase.rpc(
        "get_vouchers_with_filters",
        {
          filter_code: filter_code || null,
          filter_certification_name: filter_certification_name || null,
          filter_student_fullname: filter_student_name || null,
          filter_student_document_number: filter_student_document || null,
          filter_buyer_email: filter_buyer_email || null,
          filter_available: filter_available ?? null,
          filter_purchase_date: filter_purchase_date_op
            ? new Date(filter_purchase_date_op).toISOString().split("T")[0]
            : null,
          filter_expiration_date: filter_expiration_date_op
            ? new Date(filter_expiration_date_op).toISOString().split("T")[0]
            : null,
          filter_partner_id: partner_id || null,
          order_by: order_by || "purchase_date",
          order_dir: order_dir || "desc",
          page: page || 1,
        }
      );

      if (vouchersError)
        throw new Error(`Error getting vouchers: ${vouchersError.message}`);

      if (!result) {
        return { data: [], totalCount: 0 };
      }

      return {
        data: result.data as VoucherDinamicTable[],
        totalCount: result.totalCount || 0,
      };
    } catch (error: any) {
      console.error("Error in getVouchersForTable:", error.message);
      return null;
    }
  }
}
