import PartnerTable from "@/modules/partners/table";
import { NextRequest, NextResponse } from "next/server";

export type FilterParamsPartner = {
  filter_company_name?: string;
  filter_email?: string;
  filter_total_vouchers_op?: string;
  filter_total_vouchers?: string;
  filter_used_vouchers_op?: string;
  filter_used_vouchers?: string;
  filter_created_at_op?: string;
  filter_created_at?: string;
  page?: number;
  limit?: number;
  order_by?: string;
  order_dir?: "asc" | "desc";
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: FilterParamsPartner = {
      filter_company_name: searchParams.get("filter_company_name") || undefined,
      filter_email: searchParams.get("filter_email") || undefined,
      filter_total_vouchers_op:
        searchParams.get("filter_total_vouchers_op") || undefined,
      filter_total_vouchers:
        searchParams.get("filter_total_vouchers") || undefined,
      filter_used_vouchers_op:
        searchParams.get("filter_used_vouchers_op") || undefined,
      filter_used_vouchers:
        searchParams.get("filter_used_vouchers") || undefined,
      filter_created_at_op:
        searchParams.get("filter_created_at_op") || undefined,
      filter_created_at: searchParams.get("filter_created_at") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10,
      order_by: searchParams.get("order_by") || "created_at",
      order_dir: (searchParams.get("order_dir") as "asc" | "desc") || "desc",
    };

    const partnerTable = new PartnerTable();

    const result = await partnerTable.getPartnersForTable(params);
    if (!result) {
      return NextResponse.json(
        { error: "Failed to fetch partners" },
        { status: 500 }
      );
    }
    const { data, totalCount } = result;

    return NextResponse.json({
      data,
      totalCount,
      message: "Success",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
