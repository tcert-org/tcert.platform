import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FilterParamsVoucher } from "./types";

const filterSchema = z.object({
  filter_code: z.string().optional(),
  filter_certification_name: z.string().optional(),
  filter_student_fullname: z.string().optional(),
  filter_student_document_number: z.string().optional(),
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
});

export default class VoucherMiddleware {
  static async validatePost(
    req: NextRequest,
    next: (data: FilterParamsVoucher) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = filterSchema.parse(body) as FilterParamsVoucher;
      return next(validatedData);
    } catch (error) {
      console.error("Validation Error:", error);
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
}
