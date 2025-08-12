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
  static async getQuestions(
    exam_id?: number
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const questionTable = new QuestionTable();
      // Llama a un método que consulte las preguntas filtradas (solo activas)
      const result = await questionTable.getQuestions(exam_id);
      return NextResponse.json({
        statusCode: 200,
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

  // Método para administradores que necesitan ver todas las preguntas
  static async getAllQuestions(
    exam_id?: number
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const questionTable = new QuestionTable();
      // Llama a un método que consulte TODAS las preguntas (activas e inactivas)
      const result = await questionTable.getAllQuestions(exam_id);
      return NextResponse.json({
        statusCode: 200,
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
