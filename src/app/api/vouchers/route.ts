// src/app/api/vouchers/route.ts

import { NextRequest, NextResponse } from "next/server";
import VoucherController from "@/modules/vouchers/controller";
import {
  FilterParamsVoucher,
  CreateParamsVoucher,
} from "@/modules/vouchers/types";

// GET: Para listar/paginar/buscar vouchers (solo soporta query params tipo GET)
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams.entries());

    const filters: FilterParamsVoucher = {
      filter_code: params.filter_code,
      filter_certification_name: params.filter_certification_name,
      filter_email: params.filter_email,
      filter_available:
        params.filter_available === "true"
          ? true
          : params.filter_available === "false"
          ? false
          : undefined,
      filter_purchase_date: params.filter_purchase_date,
      filter_expiration_date: params.filter_expiration_date,
      filter_partner_id: params.filter_partner_id,
      filter_status_name: params.filter_status_name,
      order_by: params.order_by,
      order_dir: params.order_dir as "asc" | "desc" | undefined,
      page: params.page ? Number(params.page) : 1,
      limit_value: params.limit_value ? Number(params.limit_value) : 10,
      filter_token: params.filter_token,
    };

    return await VoucherController.getVouchers(filters);
  } catch (error: any) {
    // Aquí imprime el stacktrace y error completo en consola
    console.error("ERROR GET /api/vouchers", error);
    return NextResponse.json(
      {
        statusCode: 400,
        data: null,
        error: error.stack || error.message || "Invalid params",
      },
      { status: 400 }
    );
  }
}

// POST: Para crear voucher nuevo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // No zod, asume correcto (puedes validar manual si quieres)
    return await VoucherController.createVoucher(body as CreateParamsVoucher);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 400, data: null, error: error.message || "Invalid body" },
      { status: 400 }
    );
  }
}
