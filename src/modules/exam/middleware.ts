import { NextRequest, NextResponse } from "next/server";
import { ExamRegisterSchema } from "@/lib/schemas";
import { examType } from "./types";

export default class ExamMiddleware {
  static async validateCreate(
    req: NextRequest,
    next: (data: examType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = ExamRegisterSchema.parse(body) as examType;
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
