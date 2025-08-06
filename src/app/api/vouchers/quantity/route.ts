import { NextRequest, NextResponse } from "next/server";
import VoucherController from "@/modules/vouchers/quantity/controller";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const partnerIdParam = url.searchParams.get("partner_id");

  if (!partnerIdParam || !/^\d+$/.test(partnerIdParam)) {
    return NextResponse.json(
      { message: "Invalid partner_id" },
      { status: 400 }
    );
  }

  return VoucherController.getVoucherCounts(parseInt(partnerIdParam, 10));
}
