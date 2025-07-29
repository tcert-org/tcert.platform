import AttemptsTable from "./table";
import { supabase } from "@/lib/database/conection";
import ExamTool from "@/modules/tools/ExamTool";

export default class AttemptService {
  private table: AttemptsTable;

  constructor() {
    this.table = new AttemptsTable();
  }

  async gradeExamAttempt(attemptId: number) {
    // Obtener el intento
    const { data: attempt } = await this.table.getExamAttemptById(attemptId);
    if (!attempt) throw new Error("Intento no encontrado");
    console.log("📌 Calificando intento con ID:", attemptId);

    // Obtener respuestas del estudiante con reintentos
    let answers = null;
    const maxRetries = 10;

    for (let i = 0; i < maxRetries; i++) {
      const { data, error } = await supabase
        .from("answers")
        .select("question_id, selected_option_id")
        .eq("exam_attempt_id", attemptId);

      if (error) {
        console.error(
          "❌ Error al consultar respuestas:",
          error.message || error
        );
        throw new Error("Error consultando respuestas del intento");
      }

      console.log(`🔄 Intento ${i + 1} - Respuestas recuperadas:`, data);

      if (data && data.length > 0) {
        answers = data;
        break;
      }

      // Esperar 600ms (en lugar de 400)
      await new Promise((res) => setTimeout(res, 600));
    }

    if (!answers || answers.length === 0) {
      console.warn("⚠️ No hay respuestas aún para calificar.");
      return attempt; // Evita romper el flujo de autosave
    }
    // Obtener opciones correctas desde la tabla 'options'
    const { data: correctOptions, error: errorCorrect } = await supabase
      .from("options")
      .select("question_id, id")
      .eq("is_correct", true);

    if (errorCorrect || !correctOptions) {
      throw new Error("No se pudieron obtener las respuestas correctas.");
    }

    // Reestructurar para el comparador
    const formattedCorrectAnswers = correctOptions.map((opt) => ({
      question_id: opt.question_id,
      correct_option_id: opt.id,
    }));

    // Calificar intento
    const result = ExamTool.gradeAttempt({
      studentAnswers: answers,
      correctAnswers: formattedCorrectAnswers,
    });
    console.log("INFORMACUIN DEL GRADE ATTEMPT", result);

    // Actualizar intento
    const updatePayload = {
      score: result.score,
      passed: result.passed,
      correct_count: result.correct_count,
      incorrect_count: result.incorrect_count,
      unanswered_count: result.unanswered_count,
    };
    console.log("INFORMACUIN DEL GRADE ATTEMPT V2", result);

    const { data: updatedAttempt, error: updateError } =
      await this.table.updateExamAttemptById(attemptId, updatePayload);

    if (updateError) {
      throw new Error("Error actualizando el intento de examen.");
    }

    return updatedAttempt;
  }
}
