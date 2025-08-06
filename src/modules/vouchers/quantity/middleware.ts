import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const partnerSchema = z.object({
  partner_id: z.string().regex(/^\d+$/),
});

export default class VoucherCountMiddleware {
  static async validatePartnerId(
    req: NextRequest,
    next: (partnerId: number) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validated = partnerSchema.parse(body);
      const partnerId = parseInt(validated.partner_id, 10);

      return await next(partnerId);
    } catch (error: any) {
      console.error("Validation Error (voucher count):", error);
      return NextResponse.json(
        {
          message: `Invalid partner_id: ${error?.message || error}`,
        },
        { status: 400 }
      );
    }
  }
}
