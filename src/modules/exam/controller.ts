import { NextResponse } from "next/server";
import ExamTable from "@/modules/exam/table";
import { ApiResponse } from "@/lib/types";
import { examType } from "./types";

export default class ExamController {
  static async createExam(
    data: examType
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const examTable = new ExamTable();

      const existingByName = await examTable.getbyname(data.name_exam);

      if (existingByName) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "Ya existe un examen con ese nombre",
        });
      }
      const result = await examTable.createExam(data);

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
