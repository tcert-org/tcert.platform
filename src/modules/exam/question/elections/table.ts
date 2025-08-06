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

  // Agrega esto en tu clase OptionsTable

  // Listar opciones por pregunta
  async getOptionsByQuestionId(question_id: number) {
    const { data, error } = await supabase
      .from("options")
      .select("*")
      .eq("question_id", question_id)
      .order("id", { ascending: true });

    return { data, error };
  }

  // Eliminar opción por id
  async deleteOptionById(id: number) {
    const { error } = await supabase.from("options").delete().eq("id", id);
    return { error };
  }

  // Actualizar opción por id
  async updateOptionById(
    id: number,
    fields: { content?: string; is_correct?: boolean }
  ) {
    const { data, error } = await supabase
      .from("options")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }
}
