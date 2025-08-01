import { NextRequest } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
      certification:certifications ( name, logo_url )

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

  const formattedData = {
    id: data.id,
    code: data.code,
    email: data.email,
    used: data.used,
    purchase_date: data.purchase_date,
    expiration_date: data.expiration_date,
    certification_id: data.certification_id,
    certification_name: certification?.name ?? "N/A",
    certification_logo_url: certification?.logo_url ?? null,
  };

  return new Response(JSON.stringify({ data: formattedData }), { status: 200 });
}
