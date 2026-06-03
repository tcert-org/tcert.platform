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
        .ilike("company_name", `%${filter_partner_name}%`);

      if (!users?.length) return { data: [], totalCount: 0 };
      partnerUserIds = users.map((u) => u.id);
    }

    // Build dynamic query (without join — names are resolved after)
    let builder = supabase.from("payments").select("*", { count: "exact" });

    if (partnerUserIds) {
      builder = builder.in("partner_id", partnerUserIds);
    }

    let q = builder;

    if (filter_created_at && filter_created_at_op === "=")
      q = q.gte("created_at", filter_created_at).lt("created_at", getNextDay(filter_created_at));
    else if (filter_created_at && filter_created_at_op === ">=") q = q.gte("created_at", filter_created_at);
    else if (filter_created_at && filter_created_at_op === ">") q = q.gt("created_at", filter_created_at);
    else if (filter_created_at && filter_created_at_op === "<=") q = q.lte("created_at", filter_created_at);
    else if (filter_created_at && filter_created_at_op === "<") q = q.lt("created_at", filter_created_at);
    if (filter_created_at_from) q = q.gte("created_at", filter_created_at_from);
    if (filter_created_at_to) q = q.lte("created_at", filter_created_at_to);

    if (filter_expiration_date && filter_expiration_date_op === "=")
      q = q.gte("expiration_date", filter_expiration_date).lt("expiration_date", getNextDay(filter_expiration_date));
    else if (filter_expiration_date && filter_expiration_date_op === ">=") q = q.gte("expiration_date", filter_expiration_date);
    else if (filter_expiration_date && filter_expiration_date_op === ">") q = q.gt("expiration_date", filter_expiration_date);
    else if (filter_expiration_date && filter_expiration_date_op === "<=") q = q.lte("expiration_date", filter_expiration_date);
    else if (filter_expiration_date && filter_expiration_date_op === "<") q = q.lt("expiration_date", filter_expiration_date);
    if (filter_expiration_date_from) q = q.gte("expiration_date", filter_expiration_date_from);
    if (filter_expiration_date_to) q = q.lte("expiration_date", filter_expiration_date_to);

    if (filter_extension_date && filter_extension_date_op === "=")
      q = q.gte("extension_date", filter_extension_date).lt("extension_date", getNextDay(filter_extension_date));
    else if (filter_extension_date && filter_extension_date_op === ">=") q = q.gte("extension_date", filter_extension_date);
    else if (filter_extension_date && filter_extension_date_op === ">") q = q.gt("extension_date", filter_extension_date);
    else if (filter_extension_date && filter_extension_date_op === "<=") q = q.lte("extension_date", filter_extension_date);
    else if (filter_extension_date && filter_extension_date_op === "<") q = q.lt("extension_date", filter_extension_date);
    if (filter_extension_date_from) q = q.gte("extension_date", filter_extension_date_from);
    if (filter_extension_date_to) q = q.lte("extension_date", filter_extension_date_to);

    // Number filters
    if (filter_voucher_quantity !== null && filter_voucher_quantity !== undefined) {
      switch (filter_voucher_quantity_op) {
        case "=": q = q.eq("voucher_quantity", filter_voucher_quantity); break;
        case "!=": q = q.neq("voucher_quantity", filter_voucher_quantity); break;
        case ">": q = q.gt("voucher_quantity", filter_voucher_quantity); break;
        case ">=": q = q.gte("voucher_quantity", filter_voucher_quantity); break;
        case "<": q = q.lt("voucher_quantity", filter_voucher_quantity); break;
        case "<=": q = q.lte("voucher_quantity", filter_voucher_quantity); break;
      }
    }
    if (filter_unit_price !== null && filter_unit_price !== undefined) {
      switch (filter_unit_price_op) {
        case "=": q = q.eq("unit_price", filter_unit_price); break;
        case "!=": q = q.neq("unit_price", filter_unit_price); break;
        case ">": q = q.gt("unit_price", filter_unit_price); break;
        case ">=": q = q.gte("unit_price", filter_unit_price); break;
        case "<": q = q.lt("unit_price", filter_unit_price); break;
        case "<=": q = q.lte("unit_price", filter_unit_price); break;
      }
    }
    if (filter_total_price !== null && filter_total_price !== undefined) {
      switch (filter_total_price_op) {
        case "=": q = q.eq("total_price", filter_total_price); break;
        case "!=": q = q.neq("total_price", filter_total_price); break;
        case ">": q = q.gt("total_price", filter_total_price); break;
        case ">=": q = q.gte("total_price", filter_total_price); break;
        case "<": q = q.lt("total_price", filter_total_price); break;
        case "<=": q = q.lte("total_price", filter_total_price); break;
      }
    }

    // Sorting
    const orderCol = order_by === "partner_name" ? "partner_id" : order_by;
    q = q.order(orderCol, { ascending: order_dir === "asc", nullsFirst: false });

    // Pagination
    const from = (page - 1) * limit_value;
    q = q.range(from, from + limit_value - 1);

    const { data, count, error } = await q;

    if (error) {
      throw new Error("Error fetching filtered payments: " + error.message);
    }

    // Resolve partner names
    const rows = data ?? [];
    const nameMap: Record<string, string> = {};

    if (rows.length > 0) {
      const partnerIds = [...new Set(rows.map((r: any) => r.partner_id))];
      const numericIds = partnerIds
        .map((id: any) => Number(id))
        .filter((id: number) => !isNaN(id));

      if (numericIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, company_name, email")
          .in("id", numericIds);

        for (const u of users ?? []) {
          nameMap[String(u.id)] = u.company_name ?? u.email ?? "Sin nombre";
        }
      }
    }
    const enriched = rows.map((row: any) => ({
      ...row,
      partner_name: nameMap[row.partner_id] ?? null,
    }));

    return { data: enriched, totalCount: count ?? 0 };
  }
}
