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
}
