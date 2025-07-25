import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type PaymentRowType = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsertType =
  Database["public"]["Tables"]["payments"]["Insert"];

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
}
