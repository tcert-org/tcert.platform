import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type ParamsRowType = Database["public"]["Tables"]["params"]["Row"];
export type ParamsInsertType = Database["public"]["Tables"]["params"]["Insert"];

export default class ParamsTable extends Table<"params"> {
  constructor() {
    super("params");
  }

  async getAllParams() {
    const { data, error } = await supabase
      .from("params")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al obtener los parámetros:", error);
      throw error;
    }
    return data;
  }

  async updateParamValueById(id: number, value: number) {
    const { data, error } = await supabase
      .from("params")
      .update({ value })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar el parámetro:", error);
      throw error;
    }

    return data;
  }

  async getParamById(id: number) {
    const { data, error } = await supabase
      .from("params")
      .select("*")
      .eq("id", id)
      .single();
  
    if (error) {
      console.error("Error al obtener el parámetro por ID:", error);
      throw error;
    }
  
    return data;
  }
  
}
