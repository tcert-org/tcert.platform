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

    // Procesar parámetros para la tabla con filtros
    const params = Object.fromEntries(url.searchParams.entries());

    // Convertir tipos apropiados
    const filters: any = {
      filter_name_exam: params.filter_name_exam || params.name_exam,
      filter_certification_name:
        params.filter_certification_name || params.certification_name,
      filter_certification_id: params.filter_certification_id
        ? Number(params.filter_certification_id)
        : undefined,
      filter_simulator:
        params.filter_simulator === "true"
          ? true
          : params.filter_simulator === "false"
          ? false
          : params.simulator === "true"
          ? true
          : params.simulator === "false"
          ? false
          : undefined,
      filter_active:
        params.filter_active === "true"
          ? true
          : params.filter_active === "false"
          ? false
          : params.active === "true"
          ? true
          : params.active === "false"
          ? false
          : undefined,
      filter_created_at: params.filter_created_at,
      filter_created_at_op: params.filter_created_at_op || ">=",
      order_by: params.order_by || "created_at",
      order_dir: params.order_dir || "desc",
      page: params.page ? Number(params.page) : 1,
      limit_value:
        params.limit_value || params.limit
          ? Number(params.limit_value || params.limit)
          : 10,
    };

    console.log("🔍 API Filters received:", filters); // Debug log

    const result = await examTable.getExamsForTable(filters);

    if (!result) {
      return NextResponse.json(
        { message: "Error obteniendo exámenes" },
        { status: 500 }
      );
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/exam:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
