import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type QuestionRowType = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionInsertType =
  Database["public"]["Tables"]["questions"]["Insert"];

export default class QuestionTable extends Table<"questions"> {
  constructor() {
    super("questions");
  }

  //Crear pregunta
  async createQuestion(data: QuestionInsertType): Promise<QuestionRowType> {
    const { data: inserted, error } = await supabase
      .from("questions")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[CREATE_QUESTION_ERROR]", error.message);
      throw new Error("Error creando la pregunta: " + error.message);
    }
    return inserted;
  }
  async getQuestions(exam_id?: number): Promise<QuestionRowType[]> {
    let query = supabase.from("questions").select("*").eq("active", true); // Solo preguntas activas
    if (exam_id !== undefined) {
      query = query.eq("exam_id", exam_id);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error("Error consultando preguntas: " + error.message);
    }
    return data || [];
  }

  // Método para administradores que necesitan ver todas las preguntas (activas e inactivas)
  async getAllQuestions(exam_id?: number): Promise<QuestionRowType[]> {
    let query = supabase.from("questions").select("*");
    if (exam_id !== undefined) {
      query = query.eq("exam_id", exam_id);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(
        "Error consultando todas las preguntas: " + error.message
      );
    }
    return data || [];
  }

  async updateActive(id: number, active: boolean) {
    const { data, error } = await supabase
      .from("questions")
      .update({ active })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }

  async updateContent(id: number, content: string) {
    const { data, error } = await supabase
      .from("questions")
      .update({ content })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }
}
