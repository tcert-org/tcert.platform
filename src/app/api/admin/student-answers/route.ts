import { supabase } from "@/lib/database/conection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get("attempt_id");

    if (!attemptId) {
      return NextResponse.json(
        { success: false, message: "attempt_id es requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 API: Obteniendo respuestas para attempt:", attemptId);

    // Obtener las respuestas del estudiante para este intento específico
    const { data: studentAnswers, error: answersError } = await supabase
      .from("answers")
      .select(
        `
        question_id,
        selected_option_id,
        created_at
      `
      )
      .eq("exam_attempt_id", Number(attemptId));

    if (answersError) {
      console.error("❌ Error al obtener respuestas:", answersError);
      return NextResponse.json(
        {
          success: false,
          message: "Error al obtener respuestas del estudiante",
        },
        { status: 500 }
      );
    }

    console.log("📝 Respuestas encontradas:", studentAnswers?.length || 0);

    return NextResponse.json({
      success: true,
      data: studentAnswers || [],
    });
  } catch (error) {
    console.error("❌ Error en API de respuestas:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
