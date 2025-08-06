import { supabase } from "@/lib/database/conection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener el intento del examen
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("exam_id")
      .eq("id", Number(id))
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { success: false, message: "Intento no encontrado" },
        { status: 404 }
      );
    }

    // Obtener todas las preguntas del examen (total de preguntas)
    const { data: allQuestions, error: questionsError } = await supabase
      .from("questions")
      .select("id")
      .eq("exam_id", attempt.exam_id);

    if (questionsError || !allQuestions) {
      return NextResponse.json(
        { success: false, message: "Error al obtener preguntas" },
        { status: 500 }
      );
    }

    // Obtener las respuestas del intento
    const { data: answers, error: answersError } = await supabase
      .from("answers")
      .select(
        `
        question_id,
        selected_option_id,
        questions (
          id,
          options (
            id,
            is_correct
          )
        )
      `
      )
      .eq("exam_attempt_id", Number(id));

    if (answersError) {
      return NextResponse.json(
        { success: false, message: "Error al obtener respuestas" },
        { status: 500 }
      );
    }

    // Calcular puntaje: respuestas correctas / total de preguntas
    let correctAnswers = 0;
    const totalQuestions = allQuestions.length;

    if (answers) {
      correctAnswers = answers.filter((answer: any) => {
        const question = answer.questions;
        if (!question || !Array.isArray(question.options)) return false;

        const selectedOption = question.options.find(
          (opt: any) => opt.id === answer.selected_option_id
        );

        return selectedOption?.is_correct || false;
      }).length;
    }

    const scorePercentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        correctAnswers,
        totalQuestions,
        answeredQuestions: answers?.length || 0,
        scorePercentage: Math.round(scorePercentage * 100) / 100, // Redondear a 2 decimales
      },
    });
  } catch (error) {
    console.error("Error calculating score preview:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
