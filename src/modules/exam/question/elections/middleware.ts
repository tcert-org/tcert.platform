import { NextRequest, NextResponse } from "next/server";
import { OptionRegisterSchema } from "@/lib/schemas";
import { OptionsType } from "./type";

export default class OptionMiddleware {
  static async validateOption(
    req: NextRequest,
    next: (data: OptionsType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = OptionRegisterSchema.parse(body) as OptionsType;
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
