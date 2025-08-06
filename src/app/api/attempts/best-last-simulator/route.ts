import { NextRequest, NextResponse } from "next/server";
import AttemptService from "@/modules/attempts/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const simulatorId = searchParams.get("simulator_id");
    const voucherId = searchParams.get("voucher_id");

    if (!simulatorId) {
      return NextResponse.json(
        { success: false, message: "simulator_id es requerido" },
        { status: 400 }
      );
    }

    if (!voucherId) {
      return NextResponse.json(
        { success: false, message: "voucher_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener el estudiante asociado al voucher
    const { supabase } = await import("@/lib/database/conection");
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("voucher_id", Number(voucherId))
      .single();

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    const attemptService = new AttemptService();
    const result = await attemptService.getBestAndLastExamAttempt(
      Number(simulatorId),
      student.id
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error en best-last-simulator:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
