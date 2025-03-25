import VoucherTable from "@/modules/vouchers/table";
import { NextRequest, NextResponse } from "next/server";
// import VoucherTable from "@/modules/vouchers/table"; // You'll need to create this module

export type FilterParamsVoucher = {
  filter_code?: string;
  filter_certification_name?: string;
  filter_student_name?: string;
  filter_student_document?: string;
  filter_buyer_email?: string;
  filter_available?: boolean;
  filter_purchase_date_op?: string;
  filter_purchase_date?: string;
  filter_expiration_date_op?: string;
  filter_expiration_date?: string;
  partner_id?: string;
  page?: number;
  limit?: number;
  order_by?: string;
  order_dir?: "asc" | "desc";
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: FilterParamsVoucher = {
      filter_code: searchParams.get("filter_code") || undefined,
      filter_certification_name:
        searchParams.get("filter_certification_name") || undefined,
      filter_student_name: searchParams.get("filter_student_name") || undefined,
      filter_student_document:
        searchParams.get("filter_student_document") || undefined,
      filter_buyer_email: searchParams.get("filter_buyer_email") || undefined,
      filter_available: searchParams.get("filter_available")
        ? searchParams.get("filter_available") === "true"
        : undefined,
      filter_purchase_date_op:
        searchParams.get("filter_purchase_date_op") || undefined,
      filter_purchase_date:
        searchParams.get("filter_purchase_date") || undefined,
      filter_expiration_date_op:
        searchParams.get("filter_expiration_date_op") || undefined,
      filter_expiration_date:
        searchParams.get("filter_expiration_date") || undefined,
      partner_id: searchParams.get("partner_id") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10,
      order_by: searchParams.get("order_by") || "purchase_date",
      order_dir: (searchParams.get("order_dir") as "asc" | "desc") || "desc",
    };

    const voucherTable = new VoucherTable();

    const result = await voucherTable.getVouchersForTable(params);
    console.log("AQUII ESSS", result);
    if (!params) {
      return NextResponse.json(
        { error: "Failed to fetch vouchers" },
        { status: 500 }
      );
    }
    // const { data, totalCount } = result;

    return NextResponse.json({
      data: params,
      totalCount: 0,
      message: "Success",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}
