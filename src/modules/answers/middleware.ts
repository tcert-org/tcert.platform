import { cookies } from "next/headers";
import { supabase } from "@/lib/database/conection";

interface Answer {
  exam_attempt_id: number;
  question_id: number;
  selected_option_id: number | null;
}

interface AnswerPayload {
  answers: Answer[];
}

export async function validateAnswerRequest(body: AnswerPayload) {
  const cookieStore = await cookies();
  const attemptId = cookieStore.get("student_attempt_id")?.value;

  if (!attemptId) {
    return {
      valid: false,
      error: "Intento no encontrado en cookie",
    };
  }

  // 1. Obtener intento
  const { data: attempt, error: attemptError } = await supabase
    .from("exam_attempts")
    .select("id, exam_id, student_id")
    .eq("id", Number(attemptId))
    .maybeSingle();

  if (attemptError || !attempt) {
    return {
      valid: false,
      error: "El intento no existe",
    };
  }

  // 2. Obtener voucher del estudiante
  const firstAnswer = body.answers?.[0];

  const { data: studentData } = await supabase
    .from("students")
    .select("voucher_id")
    .eq("id", attempt.student_id)
    .maybeSingle();

  if (!studentData?.voucher_id) {
    return {
      valid: false,
      error: "No se encontró el estudiante asociado al intento",
    };
  }

  return {
    valid: true,
    attemptId: attempt.id,
    studentId: attempt.student_id,
    examId: attempt.exam_id,
    voucherId: studentData.voucher_id,
  };
}
