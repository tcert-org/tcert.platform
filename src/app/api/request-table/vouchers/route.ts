import { NextRequest } from "next/server";
import VoucherMiddleware from "@/modules/vouchers/middleware";
import VoucherController from "@/modules/vouchers/controller";

export async function POST(req: NextRequest) {
  return VoucherMiddleware.validateFilters(req, VoucherController.getVouchers);
}
