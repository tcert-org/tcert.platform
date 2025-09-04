import ParamsTable from "@/modules/params/table";

export default class ExamTool {
  /**
   * Obtiene el porcentaje de aprobación desde la base de datos
   */
  static async getPassingPercentage(): Promise<number> {
    try {
      console.log("🔍 Intentando obtener el porcentaje de aprobación...");
      console.log("🌍 Variables de entorno disponibles:", {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });

      const paramsTable = new ParamsTable();
      console.log("📊 ParamsTable creada, intentando obtener parámetro...");

      const param = await paramsTable.getParamById(5); // ID 5 = "Porcentaje de Examen"

      console.log("📊 Parámetro obtenido:", param);

      if (!param) {
        console.warn("⚠️ No se encontró el parámetro con ID 5");
        return 75;
      }

      // Convertir el valor a número si es string
      let numericValue: number;
      if (typeof param.value === "string") {
        numericValue = parseInt(param.value, 10);
        if (isNaN(numericValue)) {
          console.warn(
            "⚠️ El valor del parámetro no se puede convertir a número:",
            param.value
          );
          return 75;
        }
      } else if (typeof param.value === "number") {
        numericValue = param.value;
      } else {
        console.warn(
          "⚠️ El valor del parámetro no es válido:",
          typeof param.value,
          param.value
        );
        return 75;
      }

      console.log("✅ Porcentaje de aprobación obtenido:", numericValue);
      return numericValue;
    } catch (error) {
      console.error(
        "❌ Error completo al obtener el porcentaje de aprobación:",
        error
      );
      console.error("❌ Error stack:", (error as Error)?.stack);
      console.warn("Usando valor por defecto: 75%");
      return 75;
    }
  }

  /**
   * Compara las respuestas del estudiante con las correctas y determina si aprueba.
   * El porcentaje de aprobación se obtiene dinámicamente desde la base de datos.
   */
  static async gradeAttempt({
    studentAnswers,
    correctAnswers,
    totalQuestions: totalQuestionsParam,
    unanswered: unansweredParam,
  }: {
    studentAnswers: {
      question_id: number;
      selected_option_id: number | null;
    }[];
    correctAnswers: { question_id: number; correct_option_id: number }[];
    totalQuestions?: number;
    unanswered?: number;
  }) {
    let correct = 0;
    let incorrect = 0;

    for (const answer of studentAnswers) {
      if (answer.selected_option_id === null) {
        // Ya no se espera que existan, pero por compatibilidad
        continue;
      }

      const correctMatch = correctAnswers.find(
        (c) =>
          c.question_id === answer.question_id &&
          c.correct_option_id === answer.selected_option_id
      );

      if (correctMatch) {
        correct++;
      } else {
        incorrect++;
      }
    }

    let unanswered = 0;
    let totalQuestions = totalQuestionsParam ?? correct + incorrect;
    if (typeof unansweredParam === "number") {
      unanswered = unansweredParam;
      totalQuestions = correct + incorrect + unanswered;
    } else {
      unanswered = totalQuestions - (correct + incorrect);
      if (unanswered < 0) unanswered = 0;
    }

    const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    // Obtener el porcentaje de aprobación desde la base de datos
    const passingPercentage = await this.getPassingPercentage();
    const passed = score >= passingPercentage;

    return {
      score: Math.round(score),
      passed,
      correct_count: correct,
      incorrect_count: incorrect,
      unanswered_count: unanswered,
    };
  }
}
