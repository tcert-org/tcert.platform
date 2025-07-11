import { NextResponse } from "next/server";
import QuestionTable from "@/modules/exam/question/table";
import { ApiResponse } from "@/lib/types";
import { QuestionType } from "./type";

export default class QuestionController {
  static async createQuestion(
    data: QuestionType
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const questionTable = new QuestionTable();

      const result = await questionTable.createQuestion(data);

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
