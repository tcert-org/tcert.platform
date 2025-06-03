import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FilterParamsVoucher, createParamsVoucher } from "./types";

const filterSchema = z.object({
  filter_code: z.string().optional(),
  filter_certification_name: z.string().optional(),
  filter_email: z.string().optional(),
  filter_available: z.boolean().optional(),
  filter_purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  filter_expiration_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  filter_partner_id: z.string(),
  order_by: z.string().optional(),
  order_dir: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(10).optional(),
  filter_token: z.string().optional(),
});


const creationSchema = z.object({
  partner_id: z.string(),
  certification_id: z.string().nullable().optional(),
  expiration_dates: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
    status_id: z.string().optional(),
  email: z.string().email(),
  used: z.boolean().default(false),
});

export default class VoucherMiddleware {
  static async validateFilters(
    req: NextRequest,
    next: (data: FilterParamsVoucher) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = filterSchema.parse(body) as FilterParamsVoucher;
      return next(validatedData);
    } catch (error) {
      console.error("Validation Error (filters):", error);
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: `Invalid request data: ${error}`,
        },
        { status: 400 }
      );
    }
  }

 static async validateCreate(
  req: NextRequest,
  next: (data: createParamsVoucher) => Promise<NextResponse>
) {
  try {
    const body = await req.json();
    const validatedData = creationSchema.parse(body) as createParamsVoucher;

    try {
      // Intenta ejecutar el controller
      return await next(validatedData);
    } catch (error: any) {
      console.error("Controller Error (create):", error);

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
