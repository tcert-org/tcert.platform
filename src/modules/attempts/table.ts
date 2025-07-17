import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type AttemptsRowType =
  Database["public"]["Tables"]["exam_attempts"]["Row"];
export type AttemptsInsertType =
  Database["public"]["Tables"]["exam_attempts"]["Insert"];

export default class AttemptsTable extends Table<"exam_attempts"> {
  constructor() {
    super("exam_attempts");
  }

  async insertAttempt(data: AttemptsInsertType): Promise<AttemptsRowType> {
    const { data: inserted, error } = await supabase
      .from("exam_attempts")
      .insert(data)
      .select()
      .single();
    if (error) {
      console.error("[INSERT_EXAM_ATTEMPTS_ERROR]", error.message);
      throw new Error("Error insertando intento de examen:" + error.message);
    }
    return inserted;
  }

  async getExamAttemptById(id: number) {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  }

  async updateExamAttemptById(id: number) {
    const { data, error } = await supabase
      .from("exam_attempts")
      .update({ id })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }
}
