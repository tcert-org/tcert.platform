import { NextRequest, NextResponse } from "next/server";
import VoucherController from "@/modules/vouchers/controller";

// Endpoint público para integración con Stripe
export async function POST(req: NextRequest) {
  try {
    // Recibe el payload de Stripe (webhook) o los datos de la compra exitosa
    const body = await req.json();

    // Aquí deberías validar la firma del webhook de Stripe si es necesario
    // Por simplicidad, asumimos que el pago es exitoso y el body contiene:
    // { email, certification_id, partner_id }
    const { email, certification_id, partner_id } = body;

    if (!email || !certification_id || !partner_id) {
      return NextResponse.json({
        statusCode: 400,
        data: null,
        error: "Faltan datos requeridos (email, certification_id, partner_id)"
      }, { status: 400 });
    }

    // Buscar param 6 para meses de expiración
    const { data: param, error: paramError } = await (await import("@/lib/database/conection")).supabase
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
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: "No se pudo calcular la fecha de expiración"
      }, { status: 500 });
    }

    // Construir el objeto para crear el voucher
    const voucherData: any = {
      partner_id,
      certification_id,
      email,
      expiration_dates: expiration_date,
      used: false,
      payment_id: null // Puedes guardar el payment_id de Stripe si lo tienes
    };

    return await VoucherController.createVoucher(voucherData);
  } catch (error: any) {
    return NextResponse.json({
      statusCode: 500,
      data: null,
      error: error.message || "Error interno"
    }, { status: 500 });
  }
}
