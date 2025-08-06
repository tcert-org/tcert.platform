import { NextRequest, NextResponse } from "next/server";
import AnswersController from "@/modules/answers/controller";
import { validateAnswerRequest } from "@/modules/answers/middleware";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validar estructura del cuerpo
  if (!Array.isArray(body.answers)) {
    return NextResponse.json(
      { error: "Formato inválido", data: null },
      { status: 400 }
    );
  }

  // Validar intento y estudiante desde cookie
  const validation = await validateAnswerRequest(body);

  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error, data: null },
      { status: 403 }
    );
  }

  return AnswersController.insertAnswers(body.answers);
}
