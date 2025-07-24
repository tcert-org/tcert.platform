import { NextResponse } from "next/server";
import AnswersTable from "./table";
import { ApiResponse } from "@/lib/types";
import { answersType } from "./type";

export default class AnswersController {
  static async insertAnswers(
    data: answersType[]
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const table = new AnswersTable();
      const inserted = await table.insertAnswers(data);
      return NextResponse.json({
        statusCode: 201,
        data: inserted,
      });
    } catch (error) {
      console.error("[INSERT_ANSWERS_ERROR]", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
