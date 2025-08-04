// C:\code\tcert.platform\src\modules\attempts\table.ts

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

  // Nuevo método para obtener el mejor intento y el último intento
  async getBestAndLastExamAttempt(examId: number, studentId: number) {
    const { data: attempts, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", examId)
      .eq("student_id", studentId)
      .order("attempt_date", { ascending: false }); // Ordenar por fecha descendente

    if (error) {
      console.error("Error al obtener los intentos del examen:", error);
      throw new Error("Error al obtener los intentos del examen.");
    }

    if (!attempts || attempts.length === 0) {
      return null; // Si no hay intentos, devolvemos null
    }

    // Obtener el mejor intento (el de mayor puntaje)
    const bestAttempt = attempts.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    // El último intento es el primero en la lista después de ordenar por fecha
    const lastAttempt = attempts[0];

    return {
      best_attempt: bestAttempt,
      last_attempt: lastAttempt,
    };
  }

  // Método para obtener todos los intentos aprobados de un estudiante
  async getApprovedAttempts(studentId: number) {
    const { data: attempts, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("student_id", studentId)
      .eq("passed", true)
      .order("attempt_date", { ascending: false });

    if (error) {
      console.error("Error al obtener los intentos aprobados:", error);
      throw new Error("Error al obtener los intentos aprobados.");
    }

    return attempts || [];
  }
}
