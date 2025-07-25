import { NextRequest, NextResponse } from "next/server";
import AttemptsService from "@/modules/attempts/service";

export async function POST(req: NextRequest) {
  try {
    // Acceder a la cookie desde el request
    const cookieStore = req.cookies;
    const attemptIdRaw = cookieStore.get("student_attempt_id")?.value;

    if (!attemptIdRaw) {
      return NextResponse.json(
        { error: "No se encontró la cookie 'student_attempt_id'" },
        { status: 400 }
      );
    }

    const attempt_id = parseInt(attemptIdRaw, 10);
    if (isNaN(attempt_id)) {
      return NextResponse.json(
        { error: "El valor de 'student_attempt_id' no es válido" },
        { status: 400 }
      );
    }

    const service = new AttemptsService();
    const updatedAttempt = await service.gradeExamAttempt(attempt_id);

    return NextResponse.json({
      message: "Intento calificado correctamente",
      data: updatedAttempt,
    });
  } catch (err) {
    console.error("❌ Error en grading POST:", err);
    return NextResponse.json(
      { error: "Error interno al calificar intento" },
      { status: 500 }
    );
  }
}
