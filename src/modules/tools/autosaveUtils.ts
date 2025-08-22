/**
 * Guarda solo la respuesta seleccionada y califica el intento, enviando los parámetros necesarios para el cálculo correcto.
 * @param questionId ID de la pregunta respondida
 * @param optionId ID de la opción seleccionada
 * @param totalQuestions Total de preguntas del examen
 * @param answeredCount Cantidad de preguntas respondidas (incluyendo la actual)
 */
export async function autosaveAttempt(
  questionId: number,
  optionId: number,
  totalQuestions: number,
  answeredCount: number
) {
  try {
    const attemptRes = await fetch("/api/attempts/current", {
      method: "GET",
      credentials: "include",
    });
    const attemptResult = await attemptRes.json();
    const attemptId = attemptResult?.data?.id;
    if (!attemptId) return;

    // Guardar solo la respuesta seleccionada
    const payload = [
      {
        exam_attempt_id: Number(attemptId),
        question_id: questionId,
        selected_option_id: optionId,
      },
    ];

    await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });

    // Calificar, enviando total_questions y answered_questions
    await fetch("/api/attempts/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        attempt_id: attemptId,
        final_submit: false,
        total_questions: totalQuestions,
        answered_questions: answeredCount,
      }),
    });
  } catch (err) {
    console.error("❌ Error en autosave:", err);
  }
}
