import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type OptionsRowType = Database["public"]["Tables"]["options"]["Row"];
export type OptionsInsertType =
  Database["public"]["Tables"]["options"]["Insert"];

export default class OptionsTable extends Table<"options"> {
  constructor() {
    super("options");
  }

  //Crear opciones
  async createOptions(data: OptionsInsertType): Promise<OptionsRowType> {
    const { data: inserted, error } = await supabase
      .from("options")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[CREATE_OPTIONS_ERROR]", error.message);
      throw new Error("Error creando la opcion: " + error.message);
    }
    return inserted;
  }
}
