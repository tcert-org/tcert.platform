import { NextRequest, NextResponse } from "next/server";
import { QuestionRegisterSchema } from "@/lib/schemas";
import { QuestionType } from "./type";

export default class QuestionMiddleware {
  static async validateQuestion(
    req: NextRequest,
    next: (data: QuestionType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = QuestionRegisterSchema.parse(body) as QuestionType;
      try {
        return await next(validatedData);
      } catch (error: any) {
        return NextResponse.json(
          {
            message: error.message || "Error en el servidor",
          },
          {
            status: error.statusCode || 500,
          }
        );
      }
    } catch (error) {
      console.error("Validation Error (create):", error);
      return NextResponse.json(
        {
          message: `Datos inválidos: ${error}`,
        },
        { status: 400 }
      );
    }
  }
}
