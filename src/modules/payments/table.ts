// src/modules/payments/table.ts

import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type PaymentRowType = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsertType =
  Database["public"]["Tables"]["payments"]["Insert"];

// 👉 Tipado para filtros y paginación
export type FilterParamsPayment = {
  filter_partner_name?: string;
  filter_created_at?: string;
  filter_created_at_op?: string;
  filter_expiration_date?: string;
  filter_expiration_date_op?: string;
  filter_extension_date?: string;
  filter_extension_date_op?: string;
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

export default class PaymentTable extends Table<"payments"> {
  constructor() {
    super("payments");
  }

  async createPayment(data: PaymentInsertType): Promise<PaymentRowType> {
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

  // ✅ Nuevo método con filtros dinámicos y paginación
  async getPaymentsWithFilters(
    params: FilterParamsPayment
  ): Promise<{ data: any[]; totalCount: number }> {
    const {
      filter_partner_name = null,
      filter_created_at = null,
      filter_created_at_op = "=",
      filter_expiration_date = null,
      filter_expiration_date_op = "=",
      filter_extension_date = null,
      filter_extension_date_op = "=",
      filter_voucher_quantity = null,
      filter_voucher_quantity_op = "=",
      filter_unit_price = null,
      filter_unit_price_op = "=",
      filter_total_price = null,
      filter_total_price_op = "=",
      order_by = "created_at",
      order_dir = "desc",
      page = 1,
      limit_value = 10,
    } = params;

    // Usar solo los parámetros que la función RPC actual acepta
    // TODO: Cuando actualices la función RPC, agregar estos parámetros:
    // filter_expiration_date, filter_expiration_date_op,
    // filter_extension_date, filter_extension_date_op,
    // filter_voucher_quantity, filter_voucher_quantity_op,
    // filter_unit_price, filter_unit_price_op
    const rpcParams = {
      filter_partner_name,
      filter_created_at,
      filter_created_at_op,
      filter_total_price,
      filter_total_price_op,
      order_by,
      order_dir,
      page,
      limit_value,
    };

    const { data, error } = await supabase.rpc(
      "get_payments_with_filters",
      rpcParams
    );

    if (error) {
      console.error("[GET_PAYMENTS_FILTERED_ERROR]", error.message);
      throw new Error("Error fetching filtered payments: " + error.message);
    }

    const totalCount = data.length > 0 ? data[0].total_count : 0;

    return {
      data,
      totalCount,
    };
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
}
