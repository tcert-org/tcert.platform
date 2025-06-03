// src/modules/payments/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentsInsertType } from "./types"; 

const paymentCreationSchema = z.object({
  partner_id: z.string(),
  admin_id: z.string().nullable().optional(),
  voucher_quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  total_price: z.number().nonnegative(),
  files: z.string().optional(),
});

export default class PaymentMiddleware {
  static async validateCreate(
    req: NextRequest,
    next: (data: PaymentsInsertType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = paymentCreationSchema.parse(body) as PaymentsInsertType;
      return next(validatedData);
    } catch (error) {
      console.error("[PAYMENT_VALIDATION_ERROR]", error);
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
