import { NextRequest, NextResponse } from "next/server";
import OptionMiddleware from "@/modules/exam/question/elections/middleware";
import OptionsController from "@/modules/exam/question/elections/controller";
import OptionsTable from "@/modules/exam/question/elections/table";

// POST: Crear opción
export async function POST(req: NextRequest) {
  return OptionMiddleware.validateOption(req, OptionsController.createOptions);
}

// GET: Listar opciones por question_id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const question_id = searchParams.get("question_id");
  if (!question_id) {
    return NextResponse.json(
      { message: "Falta el parámetro question_id" },
      { status: 400 }
    );
  }

  try {
    const optionsTable = new OptionsTable();
    const { data, error } = await optionsTable.getOptionsByQuestionId(
      Number(question_id)
    );
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message || "Error obteniendo opciones" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar opción por id
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const optionId = body.id;
  if (!optionId) {
    return NextResponse.json(
      { message: "Falta el parámetro id" },
      { status: 400 }
    );
  }

  try {
    const optionsTable = new OptionsTable();
    const { error } = await optionsTable.deleteOptionById(optionId);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message || "Error eliminando opción" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, content, is_correct } = body;
  if (!id) {
    return NextResponse.json(
      { message: "Falta el parámetro id" },
      { status: 400 }
    );
  }

  try {
    const optionsTable = new OptionsTable();
    // Solo actualiza los campos que llegan
    const updateFields: any = {};
    if (content !== undefined) updateFields.content = content;
    if (is_correct !== undefined) updateFields.is_correct = is_correct;

    const { data, error } = await optionsTable.updateOptionById(
      id,
      updateFields
    );

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message || "Error actualizando opción" },
      { status: 500 }
    );
  }
}
