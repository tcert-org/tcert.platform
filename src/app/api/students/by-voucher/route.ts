import { NextRequest, NextResponse } from "next/server";
import StudentTable from "@/modules/students/table";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voucher_id = searchParams.get("voucher_id");

    if (!voucher_id) {
      return NextResponse.json(
        { error: "voucher_id query parameter is required" },
        { status: 400 }
      );
    }

    const table = new StudentTable();
    const student = await table.getByVoucherId(voucher_id);

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: student });
  } catch (error) {
    console.error("[GET_STUDENT_BY_VOUCHER_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno al buscar estudiante" },
      { status: 500 }
    );
  }
}
