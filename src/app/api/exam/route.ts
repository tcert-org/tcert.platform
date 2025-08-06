import { NextRequest, NextResponse } from "next/server";
import ExamTable from "@/modules/exam/table";
import ExamController from "@/modules/exam/controller";
import ExamMiddleware from "@/modules/exam/middleware";

export async function POST(req: NextRequest) {
  return ExamMiddleware.validateCreate(req, ExamController.createExam);
}

// Listar examenes o devolver uno por ID (GET)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    const examTable = new ExamTable();

    if (idParam) {
      // Buscar por ID
      const id = parseInt(idParam);
      if (isNaN(id)) {
        return NextResponse.json(
          { message: "El parámetro 'id' debe ser un número válido" },
          { status: 400 }
        );
      }
      const { data, error } = await examTable.getExamById(id);
      if (error || !data) {
        return NextResponse.json(
          { message: error?.message || "Examen no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(data, { status: 200 });
    }
    const params = Object.fromEntries(url.searchParams.entries());

    const result = await examTable.getExamsForTable(params);

    if (!result) {
      return NextResponse.json(
        { message: "Error obteniendo exámenes" },
        { status: 500 }
      );
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
