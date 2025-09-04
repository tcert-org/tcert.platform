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
  // Si se pasa all=true, devolver todas las preguntas (activas e inactivas)
  const all = req.nextUrl.searchParams.get("all");
  if (all === "true") {
    return QuestionController.getAllQuestions(
      exam_id ? Number(exam_id) : undefined
    );
  }
  // Por defecto, solo preguntas activas
  return QuestionController.getQuestions(exam_id ? Number(exam_id) : undefined);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, active, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El id es requerido" },
        { status: 400 }
      );
    }

    const questionTable = new QuestionTable();
    let data, error;

    // Actualizar active si se proporciona
    if (typeof active === "boolean") {
      const result = await questionTable.updateActive(Number(id), active);
      data = result.data;
      error = result.error;
    }
    // Actualizar content si se proporciona
    else if (typeof content === "string" && content.trim() !== "") {
      const result = await questionTable.updateContent(
        Number(id),
        content.trim()
      );
      data = result.data;
      error = result.error;
    } else {
      return NextResponse.json(
        {
          error:
            "Debes enviar 'active' (boolean) o 'content' (string no vacío)",
        },
        { status: 400 }
      );
    }

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
