

import { NextRequest, NextResponse } from "next/server";
import PaymentTable from "@/modules/payments/table";
import { FilterParamsPayment } from "@/modules/payments/table";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerIdRaw = searchParams.get("partner_id");

    if (!partnerIdRaw) {
      return NextResponse.json(
        { error: "Falta el parámetro 'partner_id'" },
        { status: 400 }
      );
    }

    const partner_id = parseInt(partnerIdRaw, 10);
    if (isNaN(partner_id)) {
      return NextResponse.json(
        { error: "'partner_id' debe ser un número válido" },
        { status: 400 }
      );
    }

    const filters: FilterParamsPayment = {
      filter_created_at: searchParams.get("filter_created_at") ?? undefined,
      filter_created_at_op: searchParams.get("filter_created_at_op") ?? undefined,
      filter_total_price: searchParams.get("filter_total_price")
        ? Number(searchParams.get("filter_total_price"))
        : undefined,
      filter_total_price_op: searchParams.get("filter_total_price_op") ?? undefined,
      order_by: searchParams.get("order_by") ?? "created_at",
      order_dir: searchParams.get("order_dir") ?? "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit_value: searchParams.get("limit_value")
        ? Number(searchParams.get("limit_value"))
        : 10,
    };

    const table = new PaymentTable();
    const { data, totalCount } = await table.getPaymentsWithFilters(filters);

    return NextResponse.json({
      data,
      meta: { totalCount },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener pagos del partner" },
      { status: 500 }
    );
  }
}
