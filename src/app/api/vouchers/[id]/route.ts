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
      certification:certifications ( name )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Voucher no encontrado" }), {
      status: 404,
    });
  }

  const formattedData = {
    id: data.id,
    code: data.code,
    email: data.email,
    used: data.used,
    purchase_date: data.purchase_date,
    expiration_date: data.expiration_date,
    certification_name: data.certification?.name ?? "N/A",
  };

  return new Response(JSON.stringify({ data: formattedData }), { status: 200 });
}
