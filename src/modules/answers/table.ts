import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type AnswersRowType = Database["public"]["Tables"]["answers"]["Row"];
export type AttemptsInsertType =
  Database["public"]["Tables"]["answers"]["Insert"];

export default class AnswersTable extends Table<"answers"> {
  constructor() {
    super("answers");
  }
  async insertAnswers(data: AttemptsInsertType[]): Promise<AnswersRowType[]> {
    const { data: inserted, error } = await supabase
      .from("answers")
      .insert(data)
      .select();

    if (error) {
      console.error("[INSERT_MULTIPLE_ANSWERS_ERROR]", error.message);
      throw new Error("Error insertando respuestas: " + error.message);
    }

    return inserted;
  }

  async getAnswerById(id: number) {
    const { data, error } = await supabase
      .from("answers")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  }

  async updateAnswerById(id: number) {
    const { data, error } = await supabase
      .from("answers")
      .update({ id })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }
}
