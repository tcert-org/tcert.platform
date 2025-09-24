import { supabase } from "@/lib/database/conection";
import { NextRequest, NextResponse } from "next/server";
import QuestionTable from "@/modules/exam/question/table";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    //console.log("🔍 Admin API: Buscando intento con ID:", id);

    // Verificar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      console.error("❌ ID inválido:", id);
      return NextResponse.json(
        { success: false, message: "ID de intento inválido" },
        { status: 400 }
      );
    }

    // Obtener el intento del examen con información completa
    //console.log("🔍 Consultando exam_attempts para ID:", id);
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select(
        `
        id,
        exam_id,
        student_id,
        score,
        passed,
        correct_count,
        incorrect_count,
        unanswered_count,
        attempt_date,
        created_at,
        exams (
          id,
          name_exam
        )
      `
      )
      .eq("id", Number(id))
      .single();

    //console.log("📊 Resultado de la consulta:", { attempt, attemptError });

    if (attemptError) {
      console.error("❌ Error al consultar intento:", attemptError);
      return NextResponse.json(
        {
          success: false,
          message: `Error al consultar intento: ${attemptError.message}`,
        },
        { status: 500 }
      );
    }

    if (!attempt) {
      console.error("❌ Intento no encontrado para ID:", id);
      return NextResponse.json(
        { success: false, message: `Intento con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    // Usar directamente la tabla de preguntas para obtener las preguntas
    //console.log("🔍 Obteniendo preguntas para exam_id:", attempt.exam_id);
    const questionTable = new QuestionTable();
    const questions = await questionTable.getQuestions(attempt.exam_id);

    //console.log("📝 Preguntas obtenidas:", questions?.length, "preguntas");

    // Obtener opciones para cada pregunta
    const questionsWithOptions = await Promise.all(
      questions.map(async (question: any) => {
        const { data: options, error: optionsError } = await supabase
          .from("options")
          .select("id, content, is_correct")
          .eq("question_id", question.id);

        if (optionsError) {
          console.error(
            "❌ Error al obtener opciones para pregunta",
            question.id,
            ":",
            optionsError
          );
          return { ...question, options: [] };
        }

        return { ...question, options: options || [] };
      })
    );

    // Obtener las respuestas del estudiante usando la tabla directamente
    //console.log("🔍 Obteniendo respuestas para exam_attempt_id:", Number(id));
    const { data: studentAnswers, error: answersError } = await supabase
      .from("answers")
      .select("question_id, selected_option_id, created_at")
      .eq("exam_attempt_id", Number(id));

    //console.log(
    //  "📋 Respuestas obtenidas:",
    //  studentAnswers?.length,
    //  "respuestas"
    //);
    //console.log("📋 Primera respuesta (ejemplo):", studentAnswers?.[0]);

    if (answersError) {
      console.error("❌ Error al obtener respuestas:", answersError);
      return NextResponse.json(
        { success: false, message: "Error al obtener respuestas" },
        { status: 500 }
      );
    }

    // Combinar preguntas con las respuestas del estudiante
    const detailedQuestions = questionsWithOptions.map((question: any) => {
      const studentAnswer = studentAnswers?.find(
        (answer: any) => answer.question_id === question.id
      );

      const correctOption = question.options.find((opt: any) => opt.is_correct);
      const selectedOption = studentAnswer
        ? question.options.find(
            (opt: any) => opt.id === studentAnswer.selected_option_id
          )
        : null;

      const isCorrect =
        studentAnswer && correctOption
          ? Number(studentAnswer.selected_option_id) ===
            Number(correctOption.id)
          : false;

      // Debug logging
      if (studentAnswer) {
        console.log(`🔍 Pregunta ${question.id}:`, {
          selected_id: studentAnswer.selected_option_id,
          selected_type: typeof studentAnswer.selected_option_id,
          correct_id: correctOption?.id,
          correct_type: typeof correctOption?.id,
          correct_option_exists: !!correctOption,
          is_correct: isCorrect,
          comparison: `${studentAnswer.selected_option_id} === ${correctOption?.id}`,
          options_count: question.options.length,
          correct_options: question.options.filter((opt: any) => opt.is_correct)
            .length,
        });
      }

      return {
        id: question.id,
        question_text: question.content || question.question_text, // Usar 'content' como campo principal
        explanation: question.explanation,
        options: question.options,
        student_selected_option_id: studentAnswer?.selected_option_id || null,
        selected_option: selectedOption || null,
        correct_option: correctOption,
        is_correct: isCorrect,
        is_answered: !!studentAnswer,
        answered_at: studentAnswer?.created_at || null,
      };
    });

    // Usar las estadísticas que ya están calculadas en la base de datos
    // pero también calcular las nuestras para verificación
    const totalQuestions = questionsWithOptions.length;
    const answeredQuestions = detailedQuestions.filter(
      (q: any) => q.is_answered
    ).length;
    const calculatedCorrectAnswers = detailedQuestions.filter(
      (q: any) => q.is_correct
    ).length;
    const calculatedIncorrectAnswers = detailedQuestions.filter(
      (q: any) => q.is_answered && !q.is_correct
    ).length;
    const calculatedUnansweredQuestions = totalQuestions - answeredQuestions;

    // Usar los datos de la BD como fuente de verdad
    const correctAnswers = attempt.correct_count || calculatedCorrectAnswers;
    const incorrectAnswers =
      attempt.incorrect_count || calculatedIncorrectAnswers;
    const unansweredQuestions =
      attempt.unanswered_count || calculatedUnansweredQuestions;

    const scorePercentage = attempt.score || 0;
    const passed = attempt.passed; // Usar el valor de la BD directamente

    console.log("📊 Comparación de estadísticas:", {
      bd_correct: attempt.correct_count,
      calculated_correct: calculatedCorrectAnswers,
      bd_incorrect: attempt.incorrect_count,
      calculated_incorrect: calculatedIncorrectAnswers,
      bd_score: attempt.score,
      bd_passed: attempt.passed,
    });

    // Obtener información del estudiante
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(
        `
        id,
        fullname,
        email,
        document_type,
        document_number
      `
      )
      .eq("id", attempt.student_id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          ...attempt,
          duration_minutes: null, // No tenemos campos de tiempo de inicio/fin
        },
        student: student || null,
        exam: attempt.exams,
        statistics: {
          total_questions: totalQuestions,
          answered_questions: answeredQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          unanswered_questions: unansweredQuestions,
          score_percentage: scorePercentage,
          pass_percentage: 70, // Este valor podría venir de configuración
          passed: passed, // Usar el valor de la BD
        },
        questions: detailedQuestions,
      },
    });
  } catch (error) {
    console.error("❌ Error completo en admin attempts API:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
