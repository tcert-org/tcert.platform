import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";
import QuestionTable from "@/modules/exam/question/table";

export async function GET(req: NextRequest) {
  try {
    const attemptId = req.nextUrl.searchParams.get("attempt_id");

    if (!attemptId) {
      console.error("❌ [FEEDBACK-API] Falta attempt_id");
      return NextResponse.json(
        { error: "Falta attempt_id en la consulta." },
        { status: 400 }
      );
    }

    // 1. Obtener información del intento
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: "No se encontró el intento especificado." },
        { status: 404 }
      );
    }

    // 2. Obtener información del estudiante
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", attempt.student_id)
      .single();

    if (studentError) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del estudiante." },
        { status: 404 }
      );
    }

    // 3. Obtener información del examen
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", attempt.exam_id)
      .single();

    if (examError) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del examen." },
        { status: 404 }
      );
    }

    // 4. Obtener las preguntas del examen usando QuestionTable
    const questionTable = new QuestionTable();
    const questions = await questionTable.getQuestions(attempt.exam_id);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron preguntas para este examen." },
        { status: 404 }
      );
    }

    // 5. Obtener opciones para cada pregunta
    const questionsWithOptions = await Promise.all(
      questions.map(async (question: any) => {
        const { data: options, error: optionsError } = await supabase
          .from("options")
          .select("id, content, is_correct")
          .eq("question_id", question.id);

        if (optionsError) {
          console.error(
            "❌ [FEEDBACK-API] Error al obtener opciones para pregunta",
            question.id,
            ":",
            optionsError
          );
          return { ...question, options: [] };
        }
        return { ...question, options: options || [] };
      })
    );

    // 6. Obtener las respuestas del estudiante para este intento específico
    const { data: studentAnswers, error: answersError } = await supabase
      .from("answers")
      .select("question_id, selected_option_id")
      .eq("exam_attempt_id", attemptId);

    if (answersError) {
      console.error(answersError);
    }

    // 7. Mapear las respuestas del estudiante
    const answersMap = new Map();
    if (studentAnswers) {
      studentAnswers.forEach((answer) => {
        answersMap.set(answer.question_id, answer.selected_option_id);
      });
    }

    // 8. Preparar las preguntas con información detallada
    const detailedQuestions = questionsWithOptions.map((question) => {
      const studentSelectedOptionId = answersMap.get(question.id);
      const isAnswered = studentSelectedOptionId !== undefined;

      // Encontrar la opción correcta
      const correctOption = question.options.find((opt: any) => opt.is_correct);
      const isCorrect =
        isAnswered && studentSelectedOptionId === correctOption?.id;

      return {
        id: question.id,
        question_text: question.content, // Usando 'content' en lugar de 'question_text'
        explanation: question.explanation || "Sin explicación disponible",
        student_selected_option_id: studentSelectedOptionId,
        is_answered: isAnswered,
        is_correct: isCorrect,
        options: question.options,
      };
    });

    // 9. Calcular estadísticas
    const totalQuestions = detailedQuestions.length;
    const correctAnswers = detailedQuestions.filter((q) => q.is_correct).length;
    const incorrectAnswers = detailedQuestions.filter(
      (q) => q.is_answered && !q.is_correct
    ).length;
    const unansweredQuestions = detailedQuestions.filter(
      (q) => !q.is_answered
    ).length;
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // 10. Preparar la respuesta final
    const feedbackData = {
      attempt: {
        id: attempt.id,
        attempt_date: attempt.attempt_date,
        created_at: attempt.created_at,
        duration_minutes: attempt.duration_minutes,
        score: attempt.score,
        passed: attempt.passed,
      },
      student: {
        fullname: student.name,
        email: student.email,
        document_type: student.document_type,
        document_number: student.document_number,
      },
      exam: {
        name_exam: exam.name_exam,
      },
      statistics: {
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        unanswered_questions: unansweredQuestions,
        score_percentage: scorePercentage,
        passed: attempt.passed,
      },
      questions: detailedQuestions,
    };

    return NextResponse.json({
      message: "Retroalimentación detallada obtenida correctamente.",
      data: feedbackData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno al obtener la retroalimentación detallada." },
      { status: 500 }
    );
  }
}
