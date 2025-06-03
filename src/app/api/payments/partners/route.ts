// app/api/payments/partners/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, company_name")
      .eq("role_id", await getRoleIdByName("partner"));

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Error al obtener partners",
      },
      { status: 500 }
    );
  }
}

async function getRoleIdByName(roleName: string): Promise<number> {
  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (error || !data) throw new Error("No se encontró el rol");

  return data.id;
}
