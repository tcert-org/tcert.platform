import { NextRequest, NextResponse } from "next/server";
import QuestionController from "@/modules/exam/question/controller";
import QuestionMiddleware from "@/modules/exam/question/middleware";
import QuestionTable from "@/modules/exam/question/table";
export async function POST(req: NextRequest) {
  return QuestionMiddleware.validateQuestion(
    req,
    QuestionController.createQuestion
  );
}
export async function GET(req: NextRequest) {
  // Obtén exam_id desde la query (?exam_id=57)
  const exam_id = req.nextUrl.searchParams.get("exam_id");
  // Lo pasamos como número (o undefined)
  return QuestionController.getQuestions(exam_id ? Number(exam_id) : undefined);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, active } = body;
    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Debes enviar el id y active (boolean)" },
        { status: 400 }
      );
    }
    const questionTable = new QuestionTable();
    const { data, error } = await questionTable.updateActive(
      Number(id),
      active
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
