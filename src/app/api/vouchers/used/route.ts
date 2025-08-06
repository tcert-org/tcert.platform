import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("vouchers")
      .select("used");

    if (error) throw error;

    // Obtener valores únicos de "used" y mapearlos a { value, label }
    const uniqueUsedValues = Array.from(new Set(data.map((item) => item.used)));

    const formatted = uniqueUsedValues.map((val) => ({
      value: val,
      label: val ? "Sí" : "No",
    }));

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Error al obtener valores usados",
      },
      { status: 500 }
    );
  }
}
