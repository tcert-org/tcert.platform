import { NextResponse } from "next/server";
import AttemptsTable from "@/modules/attempts/table";
import { ApiResponse } from "@/lib/types";
import { supabase } from "@/lib/database/conection";

type SimulatorAttemptPayload = {
  exam_id: number;
  voucher_id: number;
};

export default class ExamAttempts {
  static async insertAttempt(
    data: SimulatorAttemptPayload
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const attemptsTable = new AttemptsTable();

      // 1️⃣ Obtener el student_id desde el voucher_id
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("voucher_id", data.voucher_id)
        .maybeSingle();

      if (studentError || !studentData?.id) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "No se encontró el estudiante asociado a este voucher.",
        });
      }

      const student_id = studentData.id;

      // 2️⃣ Obtener el examen y verificar si es simulador
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("simulator")
        .eq("id", data.exam_id)
        .maybeSingle();

      if (examError || examData === null) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "No se encontró el examen especificado.",
        });
      }

      const isSimulator = examData.simulator === true;

      // 3️⃣ Si NO es simulador, validar que no exista intento previo
      if (!isSimulator) {
        const existing = await attemptsTable.getByExamAndStudent(
          data.exam_id,
          student_id
        );

        if (existing) {
          return NextResponse.json({
            statusCode: 200,
            data: { id: existing.id },
          });
        }
      }

      // 4️⃣ Insertar nuevo intento
      const result = await attemptsTable.insertAttempt({
        exam_id: data.exam_id,
        student_id,
      });

      if (!result?.id) {
        return NextResponse.json({
          statusCode: 500,
          data: null,
          error: "Error al crear el intento.",
        });
      }

      return NextResponse.json({
        statusCode: 201,
        data: { id: result.id },
      });
    } catch (error) {
      console.error("[INSERT_ATTEMPT_ERROR]", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
