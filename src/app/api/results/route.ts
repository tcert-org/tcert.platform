import { NextRequest, NextResponse } from "next/server";
import AttemptService from "@/modules/attempts/service"; // Importamos el servicio

export async function GET(req: NextRequest) {
  try {
    const examId = req.nextUrl.searchParams.get("exam_id");
    const studentId = req.nextUrl.searchParams.get("student_id"); // Leer ambos desde la URL

    // Verificamos si falta exam_id o student_id
    if (!examId || !studentId) {
      return NextResponse.json(
        { error: "Falta exam_id o student_id en la consulta." },
        { status: 400 }
      );
    }

    // Crear instancia de AttemptService
    const attemptService = new AttemptService();

    // Obtener el mejor intento y el último intento para este examen y estudiante
    const result = await attemptService.getBestAndLastExamAttempt(
      Number(examId),
      Number(studentId) // Pasamos student_id también
    );

    if (!result) {
      return NextResponse.json({
        message: "No se encontraron intentos para este examen y estudiante.",
        data: null,
      });
    }

    return NextResponse.json({
      message: "Resultados obtenidos correctamente.",
      data: result, // Devolver el mejor intento y el último intento
    });
  } catch (error) {
    console.error("Error al obtener resultados del examen:", error);
    return NextResponse.json(
      { error: "Error interno al obtener los resultados del examen." },
      { status: 500 }
    );
  }
}
