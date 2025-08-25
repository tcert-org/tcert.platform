import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(JWT_SECRET);

// GET: Obtener datos del voucher por voucher_id, solo si el rol es student
export async function GET(req: NextRequest) {
  try {
    // Obtener student_access_token de la cookie
    const studentToken = req.cookies.get("student_access_token")?.value;
    if (!studentToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Decodificar el JWT del estudiante
    let payload;
    try {
      const verified = await jwtVerify(studentToken, secret);
      payload = verified.payload;
    } catch (e) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Validar rol student
    if (payload?.role !== "student") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener voucher_id del query param (enviado por el frontend desde sessionStorage)
    const url = new URL(req.url);
    const voucherId = url.searchParams.get("voucher_id");
    if (!voucherId) {
      return NextResponse.json(
        { error: "voucher_id requerido" },
        { status: 400 }
      );
    }

    // Buscar el voucher
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select(
        `
        id,
        code,
        email,
        used,
        purchase_date,
        expiration_date,
        certification_id,
        status_id,
        certification:certifications ( name, logo_url ),
        voucher_status:voucher_statuses ( name )
      `
      )
      .eq("id", voucherId)
      .single();
    if (voucherError || !voucher) {
      return NextResponse.json(
        { error: "Voucher no encontrado" },
        { status: 404 }
      );
    }

    const certification = Array.isArray(voucher.certification)
      ? voucher.certification[0]
      : voucher.certification;
    const voucherStatus = Array.isArray(voucher.voucher_status)
      ? voucher.voucher_status[0]
      : voucher.voucher_status;

    const formattedData = {
      id: voucher.id,
      code: voucher.code,
      email: voucher.email,
      used: voucher.used,
      purchase_date: voucher.purchase_date,
      expiration_date: voucher.expiration_date,
      certification_id: voucher.certification_id,
      status_id: voucher.status_id,
      certification_name: certification?.name ?? "N/A",
      certification_logo_url: certification?.logo_url ?? null,
      status_name: voucherStatus?.name ?? "Sin estado",
    };

    return NextResponse.json({ data: formattedData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
