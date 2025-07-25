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
      .insert([data])
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

  async getByExamAndStudent(exam_id: number, student_id: number) {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", exam_id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async getByExamAndVoucher(
    exam_id: number,
    voucher_id: number
  ): Promise<AttemptsRowType | null> {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", exam_id)
      .eq("voucher_id", voucher_id)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async updateExamAttemptById(
    id: number,
    updateData: Partial<AttemptsInsertType>
  ) {
    const { data, error } = await supabase
      .from("exam_attempts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[UPDATE_EXAM_ATTEMPTS_ERROR]", error.message);
      throw new Error("Error actualizando intento:" + error.message);
    }

    return data;
  }
}
