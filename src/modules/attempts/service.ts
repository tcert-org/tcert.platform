import AttemptsTable from "./table"; // Importamos la clase AttemptsTable
import { supabase } from "@/lib/database/conection"; // Conexión a Supabase
import ExamTool from "@/modules/tools/ExamTool"; // Herramienta para calificar el examen

export default class AttemptService {
  private table: AttemptsTable;

  constructor() {
    this.table = new AttemptsTable(); // Instanciamos AttemptsTable
  }

  // Método para calificar el examen
  async gradeExamAttempt(
    attemptId: number,
    options?: { totalQuestions?: number; unanswered?: number }
  ) {
    // Obtener el intento de examen
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

      if (data && data.length > 0) {
        answers = data;
        break;
      }

      // Esperar 600ms (en lugar de 400)
      await new Promise((res) => setTimeout(res, 600));
    }

    if (!answers || answers.length === 0) {
      console.warn("⚠️ No hay respuestas aún para calificar.");
      return attempt;
    }

    // Primero obtener las preguntas específicas del examen
    const questionIds = answers.map(answer => answer.question_id);

    // Obtener SOLO las opciones correctas para las preguntas de este examen
    const { data: correctOptions, error: errorCorrect } = await supabase
      .from("options")
      .select("question_id, id")
      .eq("is_correct", true)
      .in("question_id", questionIds);


    if (errorCorrect || !correctOptions) {
      throw new Error("No se pudieron obtener las respuestas correctas.");
    }

    const formattedCorrectAnswers = correctOptions.map((opt) => ({
      question_id: opt.question_id,
      correct_option_id: opt.id,
    }));

    // Pasar totalQuestions y/o unanswered si están en options
    const result = await ExamTool.gradeAttempt({
      studentAnswers: answers,
      correctAnswers: formattedCorrectAnswers,
      totalQuestions: options?.totalQuestions,
      unanswered: options?.unanswered,
    });

    const updatePayload = {
      score: result.score,
      passed: result.passed,
      correct_count: result.correct_count,
      incorrect_count: result.incorrect_count,
      unanswered_count: result.unanswered_count,
    };

    console.log("Resultado de la calificación:", result);

    // Actualizar el intento en la base de datos
    const updateResult = await this.table.updateExamAttemptById(
      attemptId,
      updatePayload
    );

    if (!updateResult) {
      throw new Error("Error actualizando el intento de examen");
    }

    return updateResult;
  }

  // Método para obtener el mejor intento y el último intento
  async getBestAndLastExamAttempt(examId: number, studentId: number) {
    // Llamamos directamente a getBestAndLastExamAttempt de AttemptsTable
    return await this.table.getBestAndLastExamAttempt(examId, studentId);
  }

  // Método para obtener todos los intentos aprobados de un estudiante
  async getApprovedAttempts(studentId: number) {
    return await this.table.getApprovedAttempts(studentId);
  }
}
