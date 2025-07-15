import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("type_question")
      .select("id, type_option");

    if (error || !data)
      throw error || new Error("No se encontraron tipos de preguntas");

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Error al obtener los tipos de preguntas ",
      },
      { status: 500 }
    );
  }
}
