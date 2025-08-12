import { NextRequest, NextResponse } from "next/server";
import QuestionController from "@/modules/exam/question/controller";

export async function GET(req: NextRequest) {
  // Obtén exam_id desde la query (?exam_id=57)
  const exam_id = req.nextUrl.searchParams.get("exam_id");
  // Método para administradores que retorna TODAS las preguntas (activas e inactivas)
  return QuestionController.getAllQuestions(
    exam_id ? Number(exam_id) : undefined
  );
}
