import { NextResponse } from "next/server";
import AttemptsTable from "@/modules/attempts/table";
import { ApiResponse } from "@/lib/types";
import { attemptsType } from "./type";

export default class ExamAttempts {
  static async insertAttempt(
    data: attemptsType
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const attemptsTable = new AttemptsTable();

      const existingById = await attemptsTable.getExamAttemptById(data.exam_id);

      if (existingById) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "Ya existen un Intento de examen con ese ID",
        });
      }
      const result = await attemptsTable.insertAttempt(data);

      return NextResponse.json({
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
