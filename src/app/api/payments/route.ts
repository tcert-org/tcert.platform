// src/app/api/payments/route.ts

import { NextRequest } from "next/server";
import PaymentMiddleware from "@/modules/payments/middleware";
import PaymentController from "@/modules/payments/controller";

export async function POST(req: NextRequest) {
  return PaymentMiddleware.validateCreate(req, async (validatedData) => {
    return PaymentController.createPayment(validatedData);
  });
}

export async function GET(req: NextRequest) {
  return PaymentController.getPaymentsWithFilters(req);
}
