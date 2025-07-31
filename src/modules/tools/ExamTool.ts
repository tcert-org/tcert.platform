export default class ExamTool {
  /**
   * Compara las respuestas del estudiante con las correctas y determina si aprueba.
   * Se aprueba con al menos el 80% de respuestas correctas.
   */
  static gradeAttempt({
    studentAnswers,
    correctAnswers,
  }: {
    studentAnswers: {
      question_id: number;
      selected_option_id: number | null;
    }[];
    correctAnswers: { question_id: number; correct_option_id: number }[];
  }) {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    for (const answer of studentAnswers) {
      if (answer.selected_option_id === null) {
        unanswered++;
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

    const totalQuestions = correct + incorrect + unanswered;
    const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    const passed = score >= 90; //Cambiar a variable de entorno

    return {
      score: Math.round(score),
      passed,
      correct_count: correct,
      incorrect_count: incorrect,
      unanswered_count: unanswered,
    };
  }
}
