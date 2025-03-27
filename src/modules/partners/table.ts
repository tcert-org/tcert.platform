import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";
import { supabase } from "@/lib/database/conection";
import { FilterParamsPartner } from "@/app/api/request-table/partners/route";
import { PartnerDinamicTable } from "@/app/dashboard/admin/partners/page";

export type PartnerRowType = Database["public"]["Tables"]["users"]["Row"];
export type PartnerInsertType = Database["public"]["Tables"]["users"]["Insert"];
export type PartnerUpdateType = Database["public"]["Tables"]["users"]["Update"];
export type PartnerForDetail = {
  id: number;
  email: string;
  created_at: string;
  company_name: string;
  contact_number: string;
  used_vouchers: number;
  unused_vouchers: number;
  total_vouchers: number;
};

export default class PartnerTable extends Table<"users"> {
  constructor() {
    super("users");
  }

  async getPartnersForTable(
    filters: FilterParamsPartner
  ): Promise<{ data: PartnerDinamicTable[]; totalCount: number } | null> {
    try {
      const {
        filter_company_name,
        filter_email,
        filter_total_vouchers_op,
        filter_total_vouchers,
        filter_used_vouchers_op,
        filter_used_vouchers,
        filter_created_at,
        page = 1,
        limit = 10,
        order_by = "created_at",
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

      // Ejecutar consulta para obtener partners paginados usando RPC
      const { data: result, error: partnersError } = await supabase.rpc(
        "get_partners_with_filters",
        {
          filter_company_name: filter_company_name || null,
          filter_created_at: filter_created_at
            ? new Date(filter_created_at).toISOString().split("T")[0]
            : null,
          filter_email: filter_email || null,
          filter_total_vouchers: filter_total_vouchers || null,
          filter_total_vouchers_op: filter_total_vouchers_op || null,
          filter_used_vouchers: filter_used_vouchers || null,
          filter_used_vouchers_op: filter_used_vouchers_op || null,
          order_by: order_by || "created_at",
          order_dir: order_dir || "desc",
          page: page || 1,
        }
      );

      if (partnersError)
        throw new Error(`Error getting partners: ${partnersError.message}`);

      if (!result) {
        return { data: [], totalCount: 0 };
      }

      return {
        data: result.data as PartnerDinamicTable[],
        totalCount: result.totalCount || 0,
      };
    } catch (error: any) {
      console.error("Error in getPartnersForTable:", error.message);
      return null;
    }
  }
  async getPartnerById(id: number): Promise<PartnerForDetail | null> {
    try {
      // Primera consulta: obtener los datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, created_at, company_name, contact_number")
        .eq("id", id)
        .single();

      if (userError)
        throw new Error(`Error fetching user data: ${userError.message}`);
      if (!userData) return null;

      // Segunda consulta: obtener los datos de los vouchers desde la view
      const { data: voucherData, error: voucherError } = await supabase
        .from("partner_voucher_counts")
        .select("used_vouchers, unused_vouchers")
        .eq("partner_id", id)
        .single();

      if (voucherError)
        throw new Error(`Error fetching voucher data: ${voucherError.message}`);

      // Valores por defecto si no hay datos de vouchers
      const { used_vouchers = 0, unused_vouchers = 0 } = voucherData || {};

      return {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
        company_name: userData.company_name,
        contact_number: userData.contact_number,
        used_vouchers,
        unused_vouchers,
        total_vouchers: used_vouchers + unused_vouchers,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
