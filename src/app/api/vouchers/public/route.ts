import { NextRequest, NextResponse } from "next/server";
import VoucherController from "@/modules/vouchers/controller";

// Endpoint público especial para crear vouchers desde la landing
export async function POST(req: NextRequest) {
  try {
    const { email, certification } = await req.json();
    if (!email || !certification) {
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: "Faltan datos requeridos (email, certification)",
        },
        { status: 400 }
      );
    }

    // partner_id fijo
    const partner_id = "73";
    // Buscar param 6 para meses de expiración
    const { data: param, error: paramError } = await (
      await import("@/lib/database/conection")
    ).supabase
      .from("params")
      .select("value")
      .eq("id", 6)
      .single();

    let expiration_date: string | null = null;
    const meses = !paramError && param?.value ? Number(param.value) : 0;
    if (!paramError && !isNaN(meses) && meses > 0) {
      const purchaseDate = new Date();
      const expirationDate = new Date(purchaseDate);
      expirationDate.setMonth(purchaseDate.getMonth() + meses);
      if (expirationDate.getDate() !== purchaseDate.getDate()) {
        expirationDate.setDate(0);
      }
      expiration_date = expirationDate.toISOString();
    } else {
      console.log(
        "[DEBUG PUBLIC VOUCHER] param:",
        param,
        "paramError:",
        paramError
      );
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error: "No se pudo calcular la fecha de expiración",
        },
        { status: 500 }
      );
    }

    // Buscar el status_id por slug 'sin-presentar'
    const { data: status, error: statusError } = await (await import("@/lib/database/conection")).supabase
      .from("voucher_statuses")
      .select("id")
      .eq("slug", "sin-presentar")
      .single();

    if (statusError || !status?.id) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: "No se pudo obtener el status_id para el slug 'sin-presentar'"
      }, { status: 500 });
    }

    // Construir el objeto para crear el voucher
    const voucherData: any = {
      partner_id,
      certification_id: certification,
      email,
      expiration_dates: expiration_date,
      used: false,
      payment_id: null,
      status_id: status.id.toString()
    };

    return await VoucherController.createVoucher(voucherData);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: 500,
        data: null,
        error: error.message || "Error interno",
      },
      { status: 500 }
    );
  }
}
