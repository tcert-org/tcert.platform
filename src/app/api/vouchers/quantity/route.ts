import { NextRequest, NextResponse } from "next/server";
import VoucherController from "@/modules/vouchers/quantity/controller";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const partnerIdParam = url.searchParams.get("partner_id");

    if (!partnerIdParam || !/^\d+$/.test(partnerIdParam)) {
      return NextResponse.json(
        { message: "Invalid or missing partner_id parameter" },
        { status: 400 }
      );
    }

    const partner_id = parseInt(partnerIdParam, 10);
    return VoucherController.getVoucherCounts(partner_id);

  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
