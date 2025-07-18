import { NextRequest, NextResponse } from "next/server";
import ExamTable from "@/modules/exam/table";

export async function POST(req: NextRequest) {
  // Validación y creación (igual que antes)
  // ...
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    const examTable = new ExamTable();

    if (!idParam) {
      // Si no viene id, devolvemos todos los exámenes
      const { data, error } = await examTable.getAllExams();

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }

    // Si viene id, validamos y buscamos uno solo
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
