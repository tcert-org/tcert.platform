import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type MembershipRowType =
  Database["public"]["Tables"]["membership"]["Row"];
export type MembershipInsertType =
  Database["public"]["Tables"]["membership"]["Insert"];
export type MembershipUpdateType =
  Database["public"]["Tables"]["membership"]["Update"];
export default class MembershipTable extends Table<"membership"> {
  constructor() {
    super("membership");
  }
  async updateMembership(id: number, count_from: number, count_up: number, price: number) {
    const { data, error } = await supabase
      .from("membership")
      .update({ count_from, count_up, price })
      .eq("id", id)
      .select()
      .single();
  
    if (error) {
      console.error("Error al actualizar membresía:", error);
      throw error;
    }
  
    return data;
  }
  async getAllMemberships() {
    const { data, error } = await supabase
      .from("membership")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al obtener membresías:", error);
      throw error;
    }

    return data;
  }
}
