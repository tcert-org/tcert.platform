import { NextRequest, NextResponse } from "next/server";
import ExamTable from "@/modules/exam/table";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const examTable = new ExamTable();
    const { data, error } = await examTable.getExamById(Number(id));
    if (error || !data) {
      return NextResponse.json(
        { message: error?.message || "Examen no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error obteniendo examen" },
      { status: 500 }
    );
  }
}

// -------------- MÉTODO PUT ----------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { name_exam, active } = body;

    const examTable = new ExamTable();

    let result;
    if (typeof name_exam !== "undefined") {
      result = await examTable.updateExamName(Number(id), name_exam);
    }
    if (typeof active !== "undefined") {
      result = await examTable.updateExamActive(Number(id), active);
    }

    if (result?.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Actualizado correctamente", data: result?.data },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Error actualizando el examen" },
      { status: 500 }
    );
  }
}
