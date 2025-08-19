import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";
import { supabase } from "@/lib/database/conection";
import { FilterParamsPartner } from "@/app/api/request-table/partners/route";
import { PartnerDinamicTable } from "@/app/dashboard/admin/partners/page";

export type PartnerRowType = Database["public"]["Tables"]["users"]["Row"];
export type PartnerInsertType = Database["public"]["Tables"]["users"]["Insert"];
export type PartnerUpdateType = Database["public"]["Tables"]["users"]["Update"];
type PartnerRowWithCount = PartnerDinamicTable & { total_count: number };

export type PartnerForDetail = {
  id: number;
  email: string;
  created_at: string;
  company_name: string;
  contact_number: string;
  used_vouchers: number;
  unused_vouchers: number;
  total_vouchers: number;
  membership_name?: string;
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
        filter_created_at,
        filter_created_at_op,
        filter_email,
        filter_total_vouchers,
        filter_total_vouchers_op,
        filter_used_vouchers,
        filter_used_vouchers_op,
        filter_unused_vouchers,
        filter_unused_vouchers_op,
        order_by = "created_at",
        order_dir = "desc",
        page = 1,
        limit_value = 10,
      } = filters;

      if (!["asc", "desc"].includes(order_dir)) {
        throw new Error("Invalid order_dir. Must be 'asc' or 'desc'.");
      }

      if (page <= 0 || limit_value <= 0) {
        throw new Error("Pagination values must be greater than 0.");
      }

      const { data, error } = await supabase.rpc("get_partners_with_filters", {
        filter_company_name: filter_company_name ?? null,
        filter_created_at: filter_created_at
          ? new Date(filter_created_at).toISOString().split("T")[0]
          : null,
        filter_created_at_op: filter_created_at_op ?? ">=",
        filter_email: filter_email ?? null,
        filter_total_vouchers: filter_total_vouchers ?? null,
        filter_total_vouchers_op: filter_total_vouchers_op ?? "=",
        filter_used_vouchers: filter_used_vouchers ?? null,
        filter_used_vouchers_op: filter_used_vouchers_op ?? "=",
        filter_unused_vouchers: filter_unused_vouchers ?? null,
        filter_unused_vouchers_op: filter_unused_vouchers_op ?? "=",
        order_by: order_by ?? "created_at",
        order_dir: order_dir ?? "desc",
        page: page ?? 1,
        limit_value: limit_value ?? 10,
      });

      if (error) throw new Error(`Error getting partners: ${error.message}`);

      const rows = data as PartnerRowWithCount[];

      return {
        data: rows.map(({ total_count, ...rest }) => rest),
        totalCount: rows[0]?.total_count ?? 0,
      };
    } catch (error: any) {
      console.error("Error in getPartnersForTable:", error.message);
      return null;
    }
  }

  async getPartnerById(id: number): Promise<PartnerForDetail | null> {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          `
          id,
          email,
          created_at,
          company_name,
          contact_number,
          membership:membership_id ( name )
        `
        )
        .eq("id", id)
        .single();

      if (userError) {
        throw new Error(`Error fetching user data: ${userError.message}`);
      }

      if (!userData) return null;

      const { data: voucherData, error: voucherError } = await supabase
        .from("partner_voucher_counts")
        .select("*")
        .eq("partner_id", id)
        .maybeSingle();

      if (voucherError) {
        throw new Error(`Error fetching voucher data: ${voucherError.message}`);
      }

      const {
        used_vouchers = 0,
        unused_vouchers = 0,
        total_vouchers = 0,
      } = voucherData || {};

      // Aseguramos que userData.membership sea un objeto, no un array
      const membership = Array.isArray(userData.membership)
        ? userData.membership[0]
        : userData.membership;

      return {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
        company_name: userData.company_name,
        contact_number: userData.contact_number,
        used_vouchers,
        unused_vouchers,
        total_vouchers,
        membership_name: membership?.name ?? "Sin asignar",
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
