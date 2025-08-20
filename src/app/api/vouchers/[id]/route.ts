import { NextRequest } from "next/server";
import { supabase } from "@/lib/database/conection";
import { NextResponse } from "next/server";
import UserTable from "@/modules/auth/table";

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

// PATCH: Solo admin puede cambiar la certificación del voucher
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = req.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Obtener usuario actual
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 401 }
    );
  }

  // Buscar usuario en tabla interna y verificar rol
  const userTable = new UserTable();
  const dbUser = await userTable.getByUuid(user.id);
  if (!dbUser || dbUser.role_id !== 4) {
    // 4 = admin
    return NextResponse.json(
      { error: "Solo administradores pueden cambiar la certificación" },
      { status: 403 }
    );
  }

  // Obtener nuevo certification_id
  const body = await req.json();
  const { certification_id } = body;
  if (!certification_id) {
    return NextResponse.json(
      { error: "certification_id requerido" },
      { status: 400 }
    );
  }

  // Actualizar voucher
  const { error } = await supabase
    .from("vouchers")
    .update({ certification_id: Number(certification_id) })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { message: "Certificación actualizada correctamente" },
    { status: 200 }
  );
}
