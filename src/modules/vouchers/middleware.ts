import { NextRequest, NextResponse } from "next/server";
import { CreateParamsVoucher } from "./types";

// Middleware SOLO para CREATE (POST)
export default class VoucherMiddleware {
  static async validateCreate(
    req: NextRequest,
    next: (data: CreateParamsVoucher) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      // Si quieres, puedes validar los campos aquí (manual o con Zod, etc)
      return await next(body as CreateParamsVoucher);
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
