import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type PaymentRowType = Database["public"]["Tables"]["payments"]["Row"];

export type FilterParamsPayment = {
  filter_partner_name?: string;
  filter_created_at?: string;
  filter_created_at_op?: string;
  filter_created_at_from?: string;
  filter_created_at_to?: string;
  filter_expiration_date?: string;
  filter_expiration_date_op?: string;
  filter_expiration_date_from?: string;
  filter_expiration_date_to?: string;
  filter_extension_date?: string;
  filter_extension_date_op?: string;
  filter_extension_date_from?: string;
  filter_extension_date_to?: string;
  filter_voucher_quantity?: number;
  filter_voucher_quantity_op?: string;
  filter_unit_price?: number;
  filter_unit_price_op?: string;
  filter_total_price?: number;
  filter_total_price_op?: string;
  order_by?: string;
  order_dir?: string;
  page?: number;
  limit_value?: number;
};

function getNextDay(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}

export default class PaymentTable {
  async createPayment(data: any): Promise<PaymentRowType> {
    const { data: inserted, error } = await supabase
      .from("payments")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[CREATE_PAYMENT_ERROR]", error.message);
      throw new Error("Error creating payment: " + error.message);
    }

    return inserted;
  }

  async getAllPayments(): Promise<PaymentRowType[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_PAYMENTS_ERROR]", error.message);
      throw new Error("Error fetching payments: " + error.message);
    }

    return data;
  }

  async getPaymentsByPartner(partnerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        voucher_quantity,
        unit_price,
        total_price,
        created_at,
        expiration_date,
        extension_date,
        extension_used,
        files
      `
      )
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_PAYMENTS_PARTNER_ERROR]", error.message);
      throw new Error("Error fetching partner payments: " + error.message);
    }

    return data || [];
  }

  async getPaymentsWithFilters(
    params: FilterParamsPayment
  ): Promise<{ data: any[]; totalCount: number }> {
    const {
      filter_partner_name,
      filter_created_at,
      filter_created_at_op = "=",
      filter_created_at_from,
      filter_created_at_to,
      filter_expiration_date,
      filter_expiration_date_op = "=",
      filter_expiration_date_from,
      filter_expiration_date_to,
      filter_extension_date,
      filter_extension_date_op = "=",
      filter_extension_date_from,
      filter_extension_date_to,
      filter_voucher_quantity,
      filter_voucher_quantity_op = "=",
      filter_unit_price,
      filter_unit_price_op = "=",
      filter_total_price,
      filter_total_price_op = "=",
      order_by = "created_at",
      order_dir = "desc",
      page = 1,
      limit_value = 10,
    } = params;

    // Resolve partner_name filter via users table
    let partnerUserIds: string[] | null = null;
    if (filter_partner_name) {
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .ilike("name", `%${filter_partner_name}%`);

      if (!users?.length) return { data: [], totalCount: 0 };
      partnerUserIds = users.map((u) => u.id);
    }

    // Build dynamic query
    const builder = supabase
      .from("payments")
      .select("*, partner:users!inner(name)", { count: "exact", head: false });

    if (partnerUserIds) {
      builder.in("partner_id", partnerUserIds);
    }

    const applyOp = (q: any, col: string, value: any, op: string) => {
      if (value === null || value === undefined) return q;
      switch (op) {
        case "=": return q.eq(col, value);
        case "!=": return q.neq(col, value);
        case ">": return q.gt(col, value);
        case ">=": return q.gte(col, value);
        case "<": return q.lt(col, value);
        case "<=": return q.lte(col, value);
        default: return q;
      }
    };

    const applyDateOp = (q: any, col: string, value: string | null | undefined, op: string) => {
      if (!value) return q;
      switch (op) {
        case "=": return q.gte(col, value).lt(col, getNextDay(value));
        case ">=": return q.gte(col, value);
        case ">": return q.gt(col, value);
        case "<=": return q.lte(col, value);
        case "<": return q.lt(col, value);
        case "!=": return q.not(col, "gte", value).not(col, "lt", getNextDay(value));
        default: return q;
      }
    };

    // Date exact + range (_from / _to)
    let q = builder;
    q = applyDateOp(q, "created_at", filter_created_at, filter_created_at_op);
    if (filter_created_at_from) q = q.gte("created_at", filter_created_at_from);
    if (filter_created_at_to) q = q.lte("created_at", filter_created_at_to);

    q = applyDateOp(q, "expiration_date", filter_expiration_date, filter_expiration_date_op);
    if (filter_expiration_date_from) q = q.gte("expiration_date", filter_expiration_date_from);
    if (filter_expiration_date_to) q = q.lte("expiration_date", filter_expiration_date_to);

    q = applyDateOp(q, "extension_date", filter_extension_date, filter_extension_date_op);
    if (filter_extension_date_from) q = q.gte("extension_date", filter_extension_date_from);
    if (filter_extension_date_to) q = q.lte("extension_date", filter_extension_date_to);

    // Number filters
    q = applyOp(q, "voucher_quantity", filter_voucher_quantity, filter_voucher_quantity_op);
    q = applyOp(q, "unit_price", filter_unit_price, filter_unit_price_op);
    q = applyOp(q, "total_price", filter_total_price, filter_total_price_op);

    // Sorting
    q = q.order(order_by, { ascending: order_dir === "asc", nullsFirst: false });

    // Pagination
    const from = (page - 1) * limit_value;
    q = q.range(from, from + limit_value - 1);

    const { data, count, error } = await q;

    if (error) {
      console.error("[GET_PAYMENTS_FILTERED_ERROR]", error.message);
      throw new Error("Error fetching filtered payments: " + error.message);
    }

    const flatData = (data ?? []).map((row: any) => ({
      ...row,
      partner_name: row.partner?.name ?? null,
      partner: undefined,
    }));

    return { data: flatData, totalCount: count ?? 0 };
  }
}
