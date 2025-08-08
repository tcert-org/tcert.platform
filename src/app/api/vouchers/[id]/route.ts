import { NextRequest } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
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
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Voucher no encontrado" }), {
      status: 404,
    });
  }

  const certification = Array.isArray(data.certification)
    ? data.certification[0]
    : data.certification;

  const voucherStatus = Array.isArray(data.voucher_status)
    ? data.voucher_status[0]
    : data.voucher_status;

  const formattedData = {
    id: data.id,
    code: data.code,
    email: data.email,
    used: data.used,
    purchase_date: data.purchase_date,
    expiration_date: data.expiration_date,
    certification_id: data.certification_id,
    status_id: data.status_id,
    certification_name: certification?.name ?? "N/A",
    certification_logo_url: certification?.logo_url ?? null,
    status_name: voucherStatus?.name ?? "Sin estado",
  };

  return new Response(JSON.stringify({ data: formattedData }), { status: 200 });
}
